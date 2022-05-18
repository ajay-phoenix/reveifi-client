import React, { Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";


import { AdminTopNav, SideBar } from "components/common/imports/navigations";
import { UserService, CookieService, UrlService } from "services/imports/index";

import { Trans } from "react-i18next";
import { toast } from "react-toastify";
import TagsInput from 'react-tagsinput';

import 'react-tagsinput/react-tagsinput.css'

import {
    FormBuilder,
    AbstractControl,
    Validators,
    FieldGroup,
    FieldControl
} from "react-reactive-form";

import "./_style.scss";

const NumberInput = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <input className="dp-inputfld" type="number" placeholder={`${meta.label}`} {...handler()} />
        <span className="help-block">
            {touched && hasError("required") && `${meta.label} is required`}
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
            {(touched && hasError('mismatch')) && "Down payment must be less than bid price!"}
            {(touched && hasError('mismatchPreBid')) && "Please submit an offer higher than your previous offer"}
            <Trans>{(hasError('minimumPriceError')) && "Your offer must be greater than 60% of list price"}</Trans>
            <Trans>{(hasError('maximumPriceError')) && "Your offer cannot be larger than your Pre-Approval"}</Trans>
        </span>
    </div>
);
const SelectInput = ({ handler, touched, hasError, meta }: any) => (
    <>
        <select {...handler()} className="dp-selectfld">
            {meta.options.map((item, index) => (
                <option value={item.value}>{item.lable}</option>
            ))}
        </select>
        <span className="dropdownicon">
            <img src="https://reverifi.trisec.io/images/nl-down-icon-white.png" />
        </span>
        <span className="help-block">
            {touched && hasError("required") && `${meta.label} is required`}
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </>
);

const role_id = CookieService.get('role_id');
const useId = CookieService.get('_id');
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let lendersData = [], realtorsData = [], loanTypeData = [], creditScoreData = [{
    lable: '< 600',
    value: 1
},
{
    lable: '600 - 619',
    value: 2
},
{
    lable: '620 - 639',
    value: 3
},
{
    lable: '640 - 699',
    value: 4
},
{
    lable: '700+',
    value: 5
}];
const loanTypes = { "1": "FHA", "2": "VA", "3": "Conventional", "4": "Reverse" };
const creditScore = { "1": "< 600", "2": "600 - 619", "3": "620 - 639", "4": "640 - 699", "5": "700+" };
const allowedFileTypes = ['image/jpeg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/msword'];
class SubmitBid extends Component<RouteComponentProps, any> {

    constructor(props) {
        super(props);
        this.state = {
            user: {},
            userBus: {},
            tags: [],
            props: {},
            lender: [],
            sellerRealtor: 0,
            loading: 'true',
            isPreApproved: 0,
            preApprovedResp: {},
            notListed: 0,
            negotiation: false,
            negotiatingPrices: 0,
            previousOfferPrice: 0,
            bidSubmited: false,
            ownBid: false,
            loader: false,
            disabled: true,
            showconfirmpopupstate: false,
            showOfferPriceWarning: false,
            preApproval: false,
        };

        this.handler = this.handler.bind(this);

        realtorsData = [];
        lendersData = [];
        loanTypeData = [];
        realtorsData.push({ lable: 'Select Realtor', value: 0 });
        lendersData.push({ lable: 'Select Lender', value: 0 });

        loanTypeData.push({ lable: 'FHA', value: 1 });
        loanTypeData.push({ lable: 'VA', value: 2 });
        loanTypeData.push({ lable: 'Conventional', value: 3 });
        loanTypeData.push({ lable: 'Reverse', value: 4 });
    }

    async componentDidMount() {
        const propId = window.location.pathname.split("/").pop();
        const negotiationData = await UserService.getBidNegotiation(propId);

        const lender = negotiationData['lender'];
        let realtor = negotiationData['realtor'];
        const propDetails = negotiationData['propDetails'][0];
        const bidNegotiation = negotiationData['bidNegotiation'];
        const sellerRealtor = propDetails.property_association[0].realtor_id;
        var seller_realtor;
        if (realtor.length === 0) {
            const data = await UserService.getUserProfile(sellerRealtor);
            seller_realtor = [data];
        }

        if (lender.length === 0) {
            this.setState({ ownBid: true });
            this.recForm.patchValue({ 'lender': useId });
            this.recForm.patchValue({ 'is_pre_approved': 1 });
        }

        await this.setUserActsRealtorLender(lender, realtor, seller_realtor, sellerRealtor);
        this.setState({ props: propDetails, lender: lender, loading: 'false' });

        //check if bid has been compromised (rejected or negotiated)
        if (bidNegotiation.length > 0) {
            await this.checkForRejectedBids(bidNegotiation);
        }

    }

    // componentDidUpdate() {
    //     if (this.state.lender.length === 0) {
    //         this.recForm.patchValue({'lender': useId});
    //     }
    // }

    async checkForRejectedBids(bidNegotiation) {
        let rejected = false;
        bidNegotiation[0]['bid'].forEach((v) => {
            if (v.status < 0) {
                rejected = true;
            }
        });

        if (!rejected) {
            //If asked for negotiation
            this.setState({ isPreApproved: 1 });
            await this.setBidData(bidNegotiation);
        }

    }

    async setUserActsRealtorLender(lender, realtor, seller_realtor, sellerRealtor) {
        lender.forEach((res, i) => {
            if (res && res.business_profiles) {
                const obj = { lable: res.name + " " + res.last_name, value: res.id };
                lendersData.push(obj);
            }
        });
        lendersData.push({ lable: 'Not Listed', value: -1 });

        var realtor_ids = []
        realtor.forEach((res, i) => {
            if (res && res.business_profiles) {
                const obj = { lable: res.name + " " + res.last_name, value: res.id };
                if(realtor_ids.indexOf(res.id.toString())===-1){
                    realtorsData.push(obj);
                }
                realtor_ids.push(res.id.toString())
            }
        });

        if (seller_realtor && seller_realtor.length === 1) {
            const obj = { lable: seller_realtor[0].name + ' ' + seller_realtor[0].last_name, value: sellerRealtor };
            realtorsData.push(obj);
        }
        realtorsData.push({ lable: 'Not Listed', value: -1 });
    }

    handler() {
        this.setState({ updateLanguage: true });
    }

    handleChange(tags) {
        this.setState({ tags });
    }

    showModal() {
        this.setState({ showconfirmpopupstate: true })
        this.setState({ isOpen: true });
    }

    hideModal() {
        this.setState({ isOpen: false });
        this.setState({ tags: [] });
        this.setState({ invitationSent: false });
    }


    async sendInvitation(event: any, prop: any) {
        event.preventDefault();

        this.setState({ invitationLoader: true });
        if (this.state['tags'].length > 0) {
            const data = {
                invitation: this.state['tags'],
                propId: 0,
                roleId: 2,
            };
            const response = await UserService.sendInvitations(data);
            if (response) {
                this.setState({ invitationSent: true });
                this.setState({ invitationLoader: false });
                toast.success("Invitaion sent to successfully", {
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            } else {
                this.setState({ invitationLoader: false });
                toast.error("Something went wrong !");
            }
        } else {
            toast.error("No valid email provided !", { autoClose: false, });
            this.setState({ invitationLoader: false });
        }

    }

    async getpreArrpvals(value) {
        const response = await UserService.getPreApproval(value);
        if (response.length === 0) {
            this.setState({ preApproval: true });
            this.recForm.reset();
        } else {
            this.setState({ preApproval: false });
            this.setState({ preApprovedResp: response[0] });
            //this.recForm.get('offer_price').setValue(response[0].offer_price);
            this.recForm.get('loan_type').setValue(response[0].loan_type);
            this.recForm.get('down_payment').setValue(response[0].down_payment);
            this.recForm.get('credit_score').setValue(response[0].credit_score);
            this.recForm.get('bank_balance').setValue(response[0].bank_balance);
            this.recForm.get('loan_amount').setValue(response[0].loan_amount);
            this.recForm.get('is_pre_approved').setValue(1);
        }
    }


    validatePreApprovedForMortgage = (AC: AbstractControl) => {
        this.setState({ isPreApproved: 0 });

        if (AC.value == 1) {
            this.setState({ isPreApproved: 1 });
        } else if (AC.value == 2) {
            this.setState({ isPreApproved: 2 });
        }
    };

    validateNolenderListed = (AC: AbstractControl) => {
        this.setState({ notListed: 0 });
        this.setState({ isPreApproved: 0 });
        if (AC.value < 0) {
            if (AC.value == -1) {
                this.props.history.push("/lender-list");
            }
            // else if (AC.value == -2) {
            //     this.recForm.reset();
            //     this.getUser();
            //     this.setState({ownBid: true});
            // } else if (AC.value == -3) {
            //     this.recForm.reset();
            //     this.setState({ownBid: false});
            // }
        } else if (AC.value > 0 && !this.state['negotiation']) {
            this.setState({ isPreApproved: 1 });
            if (!this.state.ownBid) {
                const response = this.getpreArrpvals(AC.value);
            }

        }
    };

    validateDownPayment = (AC: AbstractControl) => {
        let bidPrice = AC.get('offer_price').value;
        let downPayment = AC.get('down_payment').value;
        AC.get('down_payment').setErrors(null);

        // validate with property price
        let propertyPrice = this.state && this.state['props'] && this.state['props']['price'];

        if (bidPrice && propertyPrice) {
            this.setState({ showOfferPriceWarning: false });

            // 60% of the property
            let minimumPrice = propertyPrice * 60 / 100;

            // Maximum price
            let loanAmount = this.recForm.get('loan_amount').value
            loanAmount = loanAmount ? loanAmount : 0;
            downPayment = downPayment ? downPayment : 0;

            let maximumPrice = parseFloat(loanAmount) + parseFloat(downPayment);

            /* console.log(bidPrice+'<'+minimumPrice)
            console.log(bidPrice+'>'+maximumPrice) */

            if (bidPrice < minimumPrice) {
                this.setState({ disabled: true })
                AC.get('offer_price').setErrors({ minimumPriceError: true });
                this.setState({ showOfferPriceWarning: true });
            } else if (bidPrice > maximumPrice) {
                this.setState({ disabled: true })
                AC.get('offer_price').setErrors({ maximumPriceError: true });
                this.setState({ showOfferPriceWarning: true });
            } else {
                this.setState({ disabled: false })
            }
        }
        if (this.recForm && this.state.negotiation) {
            if (parseFloat(bidPrice) <= parseFloat(this.state.previousOfferPrice)) {
                AC.get('offer_price').setErrors({ mismatchPreBid: true });
            }
        }

        if (parseFloat(downPayment) > parseFloat(bidPrice)) {
            AC.get('down_payment').setErrors({ mismatch: true });
        } else {
            return null
        }
    };

    validateNoRealtorListed = (AC: AbstractControl) => {
        if (AC.value < 0) {
            this.props.history.push("/realtor-list");
            // this.setState({showconfirmpopupstate: true});
            // this.showModal();
        }
    };

    calculateLoanAmount = (AC: AbstractControl) => {
        if (this.recForm && this.state.ownBid) {
            let offerPrice = this.recForm.get('offer_price').value;
            let downPayment = this.recForm.get('down_payment').value;
            const total = (offerPrice ? parseFloat(offerPrice) : 0) - (downPayment ? parseFloat(downPayment) : 0);
            this.recForm.patchValue({ 'loan_amount': total.toString() });
        }
    };
    recForm = FormBuilder.group({
        offer_price: ['', [Validators.required, this.calculateLoanAmount]],
        loan_type: ['1'],
        down_payment: ['', Validators.required, [this.calculateLoanAmount]],
        credit_score: ['1'],
        bank_balance: ['', Validators.required],
        is_pre_approved: ['', [this.validatePreApprovedForMortgage]],
        lender: ['', [Validators.required, this.validateNolenderListed]],
        realtor: ['0', [Validators.required, this.validateNoRealtorListed]],
        bank_name: [],
        lender_email: ['', Validators.email],
        lender_phone: [],
        loan_amount: [],
        total_assets: [],
        max_annual_prop_tax: ['', Validators.required],
        fileSource: [],
        showdropdownlistValue: ['']
    }, {
        validators: this.validateDownPayment
    });


    async setBidData(negotiationData) {
        this.setState({ negotiation: true });
        this.setState({ negotiatingPrices: negotiationData[0].negotiating_prices });
        const bid = negotiationData[0]['bid'][0];
        const bidAssoc = negotiationData[0]['bid_association'][0];
        this.setState({ previousOfferPrice: bid.offer_price });
        this.setState({ preApprovedResp: bid });
        this.recForm.get('offer_price').setValue(bid.offer_price);
        this.recForm.get('loan_type').setValue(bid.loan_type);
        this.recForm.get('down_payment').setValue(bid.down_payment);
        this.recForm.get('credit_score').setValue(bid.credit_score);
        this.recForm.get('bank_balance').setValue(bid.bank_balance);
        this.recForm.get('loan_amount').setValue(bid.loan_amount);
        this.recForm.get('is_pre_approved').setValue(bid.is_pre_approved);
        this.recForm.get('realtor').setValue(bidAssoc.realtor_id);
        this.recForm.get('lender').setValue(bidAssoc.lender_id);

        this.recForm.controls['realtor'].disable();
        this.recForm.controls['lender'].disable();
    }

    async prepareData() {
        const formData = new FormData();
        const propId = window.location.pathname.split("/").pop();
        formData.append('previous_offer_price', this.state.previousOfferPrice);
        formData.append('offer_price', this.recForm.get('offer_price').value);
        formData.append('loan_type', this.recForm.get('loan_type').value);
        formData.append('loan_amount', this.recForm.get('loan_amount').value);
        formData.append('down_payment', this.recForm.get('down_payment').value ? this.recForm.get('down_payment').value : 0);
        formData.append('credit_score', this.recForm.get('credit_score').value);
        formData.append('bank_balance', this.recForm.get('bank_balance').value);
        formData.append('total_assets', this.recForm.get('total_assets').value);
        formData.append('max_annual_prop_tax', this.recForm.get('max_annual_prop_tax').value);
        formData.append('is_pre_approved', this.recForm.get('is_pre_approved').value);
        formData.append('lender', this.recForm.get('lender').value);
        formData.append('realtor', this.recForm.get('realtor').value);
        formData.append('bank_name', this.recForm.get('bank_name').value);
        formData.append('lender_email', this.recForm.get('lender_email').value);
        formData.append('lender_phone', this.recForm.get('lender_phone').value);
        formData.append('file', this.recForm.get('fileSource').value);
        formData.append('prop_id', propId);
        return formData;
    }

    onFileChange(event) {
        if (event.target.files && event.target.files.length) {
            const file = event.target.files[0];
            if (allowedFileTypes.includes(file.type)) {
                this.recForm.patchValue({
                    fileSource: file
                });
            } else {
                event.target.value = null;
                toast.error("File type not allowed");
            }
        }
    }

    async handleFormSubmit(event: any) {
        event.preventDefault();
        this.setState({ loader: true });
        this.recForm.patchValue({ loader: true });
        const formData = await this.prepareData();

        const response = await UserService.submitBid(formData);

        if (typeof response.prop_id !== 'undefined') {
            this.setState({ bidSubmited: true });
            this.setState({ loader: false });
            this.recForm.patchValue({ loader: false });
            toast.success('Bid Submitted Successfully');

            setTimeout(() => {
                this.props.history.push("/properties-invitations");
            }, 50);

        } else {
            this.recForm.patchValue({ loader: false });
            this.setState({ loader: false });
            if (response && response.message) {
                toast.error(response.message);
            } else {
                toast.error("Something went wrong!");
            }
        }
    }

    showconfirmpopup = () => {
        if (this.state.showconfirmpopupstate == true) {
            this.setState({ showconfirmpopupstate: false })
        } else {
            this.setState({ showconfirmpopupstate: true })
        }
    }

    async getUser() {
        const userData = await UserService.getCurrentUserProfile();
        if (userData) {
            this.recForm.get('lender').setValue(-5)
        }
    }

    showdropdownlist = (title) => {
        var dropdowntext = title;
        this.setState({ showdropdownliststate: dropdowntext });
        this.recForm.patchValue({ showdropdownlistValue: dropdowntext });
    }

    setLenderDropdownValue = (value) => {
        this.recForm.patchValue({ lender: value });
        this.showdropdownlist("");
    }

    setRealtorDropdownValue = (value) => {
        this.recForm.patchValue({ realtor: value });
        this.showdropdownlist("");
    }
    setLoanDropdownValue = (value) => {
        this.recForm.patchValue({ loan_type: value });
        this.showdropdownlist("");
    }

    setCreditDropdownValue = (value) => {
        this.recForm.patchValue({ credit_score: value });
        this.showdropdownlist("");
    }

    // showOwnBidForm = () => {
    //     this.recForm.reset();
    //     if (this.state.ownBid == true) {
    //         this.setState({ownBid: false})
    //     } else {
    //         this.getUser();
    //         this.setState({ownBid: true})
    //     }
    // };

    render() {
        const EMAIL_VALIDATION_REGEX = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
        const priceSplitter = (number) => (number && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));

        //console.log(this.state.isPreApproved)
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <div className="submit-property-page">
                    <h3><Trans>Bid Submission</Trans></h3>
                    <div className="submit-property-box">
                        <div className="dp-title"><Trans>Property Details</Trans></div>
                        <div className="dp-submit-bid-row">
                            <div className="dpsb-image-box">
                                <img src={UrlService.imagesPath() + '/' + this.state['props']['media']} className="img-responsive" />
                            </div>
                            <ul className="dpsb-content-box">
                                <li>
                                    <label><Trans>Property Nick Name</Trans>:</label>
                                    <span>{this.state['props']['title']}</span>
                                </li>
                                {this.state['negotiation'] ?
                                    <li className="proptopright">
                                        <label><Trans>Asking price</Trans>:</label>
                                        <span> {priceSplitter(this.state['negotiatingPrices'])}</span>
                                    </li> :
                                    <li className="proptopright">
                                        <label><Trans>List Price</Trans> : </label>
                                        <span>${priceSplitter(this.state['props']['price'])}</span>
                                    </li>
                                }
                            </ul>
                        </div>
                        {/*--------pre-approval bidSubmit-------*/}
                        <div>
                            <div className="dp-title">
                                <Trans>Submit Bid</Trans>
                                {/*<div className="switch-field">*/}
                                {/*<input*/}
                                {/*onClick={this.showOwnBidForm}*/}
                                {/*checked={true} type="radio" id="radio-three"*/}
                                {/*name="switch-one" value="Buyer1"/>*/}
                                {/*<label htmlFor="radio-three">Pre-approval not on file</label>*/}
                                {/*</div>*/}
                                {(this.state.preApproval == true) && (
                                    <p style={{ color: "red", fontSize: 14 }}><Trans>No mortgage pre-approval available</Trans></p>
                                )}
                            </div>
                            {!this.state['bidSubmited'] ?
                                <>
                                    {(this.state.ownBid == false) && (
                                        <FieldGroup control={this.recForm} render={({ invalid, pristine, pending, meta }) => (
                                            <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                                                <ul className="dp-input-list">
                                                    <li>
                                                        <div className="dp-select-div">
                                                            <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectLender')}  >
                                                                {lendersData.filter((item) => {
                                                                    return item.value == this.recForm.get("lender").value;
                                                                })[0] ? lendersData.filter((item) => {
                                                                    return item.value == this.recForm.get("lender").value;
                                                                })[0].lable : 'Select Lender'}
                                                                <span className="dropdownicon">
                                                                    <img src="../images/nl-down-icon-white.png" />
                                                                </span>
                                                            </div>

                                                            {(this.state.showdropdownliststate === 'SelectLender') && (
                                                                <ul className="dpselect-option-list">
                                                                    {lendersData.map((item, index) => {
                                                                        return <li onClick={() => this.setLenderDropdownValue(item.value)}>{item.lable}</li>
                                                                    })}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </li>
                                                    
                                                    <li>
                                                        <FieldControl name="offer_price" render={NumberInput} meta={{ label: "Bid Price" }} />
                                                    </li>
                                                    
                                                    <li>
                                                        <div className="dp-select-div">
                                                            <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectRealtor')}  >
                                                                {realtorsData.filter((item) => {
                                                                    return item.value == this.recForm.get("realtor").value;
                                                                })[0] ? realtorsData.filter((item) => {
                                                                    return item.value == this.recForm.get("realtor").value;
                                                                })[0].lable: 'Select Realtor'}
                                                                <span className="dropdownicon">
                                                                    <img src="../images/nl-down-icon-white.png" />
                                                                </span>
                                                            </div>

                                                            {(this.state.showdropdownliststate === 'SelectRealtor') && (
                                                                <ul className="dpselect-option-list">
                                                                    {realtorsData.map((item, index) => {
                                                                        return <li onClick={() => this.setRealtorDropdownValue(item.value)} key={index}>{item.lable}</li>
                                                                    })}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </li>
                                                </ul>
                                                <ul className="bid-value-list-box">
                                                    {this.state['isPreApproved'] === 1 || this.state['negotiation'] ? <>
                                                        <li>
                                                            <label><Trans>Credit Score</Trans></label>
                                                            <span>{creditScore[this.state['preApprovedResp'].credit_score]}</span>
                                                        </li>
                                                        <li>
                                                            <label><Trans>Down Payment</Trans></label>
                                                            <span>${priceSplitter(this.state['preApprovedResp'].down_payment)}</span>
                                                        </li>
                                                        <li>
                                                            <label><Trans>Bank Balance</Trans></label>
                                                            <span>
                                                                {this.state['preApprovedResp'].bank_balance && this.state['preApprovedResp'].bank_balance != 0 ?
                                                                    '$' + priceSplitter(this.state['preApprovedResp'].bank_balance) :
                                                                    /* 'Available on Request' */
                                                                    <img src="/images/info-icon.png" style={{ width: '18px', marginLeft: '18%' }} title="Available on Request"/>
                                                                }
                                                            </span>
                                                        </li>
                                                        <li>
                                                            <label><Trans>Total Assets</Trans></label>
                                                            <span>
                                                                {this.state['preApprovedResp'].total_assets && this.state['preApprovedResp'].total_assets != 0 ?
                                                                    '$' + priceSplitter(this.state['preApprovedResp'].total_assets) :
                                                                    <img src="/images/info-icon.png" style={{ width: '18px', marginLeft: '18%' }} title="Available on Request"/>
                                                                }</span>
                                                        </li>
                                                        <li>
                                                            <label><Trans>Max Annual Property Taxes</Trans></label>
                                                            <span>{
                                                                this.state['preApprovedResp'].max_annual_prop_tax && this.state['preApprovedResp'].max_annual_prop_tax != 0 ?
                                                                    '$' + priceSplitter(this.state['preApprovedResp'].max_annual_prop_tax) : 
                                                                    <img src="/images/info-icon.png" style={{ width: '18px', marginLeft: '18%' }} title="Available on Request"/>
                                                            }</span>
                                                        </li>
                                                        <li>
                                                            <label><Trans>Loan Type</Trans></label>
                                                            <span>{loanTypes[this.state['preApprovedResp'].loan_type]}</span>
                                                        </li>
                                                        <li>
                                                            <label><Trans>Loan Amount</Trans></label>
                                                            <span>${priceSplitter(this.state['preApprovedResp'].loan_amount)}</span>
                                                        </li>
                                                    </> : null
                                                    }
                                                </ul>
                                                <ul className="dp-input-list">
                                                    <li className="submitbtn-list">
                                                        {!this.state['loader'] ?
                                                            // <input type="submit" disabled={invalid} className="submitpropert-btn"/>
                                                            <input type="submit" disabled={this.state.disabled} className="submitpropert-btn" /> :
                                                            <button type="submit" name="submit" disabled className="submitpropert-btn">
                                                                <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                                                <span className="sr-only"><Trans>Loading...</Trans></span>
                                                            </button>
                                                        }
                                                    </li>
                                                </ul>
                                            </form>
                                        )} />
                                    )}
                                    {(this.state.ownBid == true) && (
                                        <FieldGroup
                                            control={this.recForm}
                                            render={({ invalid, pristine, pending, meta }) => (
                                                <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                                                    <div className="dp-content">
                                                        <ul className="dp-input-list">
                                                            {/*<li>*/}
                                                            {/*<div className="dp-select-div">*/}
                                                            {/*<FieldControl name="lender"*/}
                                                            {/*render={SelectInput}*/}
                                                            {/*meta={{*/}
                                                            {/*label: "lender",*/}
                                                            {/*options: lendersData*/}
                                                            {/*}}/>*/}
                                                            {/*</div>*/}
                                                            {/*</li>*/}
                                                            <li>
                                                                <div className="dp-select-div">
                                                                    <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectRealtor')}  >
                                                                        {realtorsData.filter((item) => {
                                                                            return item.value == this.recForm.get("realtor").value;
                                                                        })[0].lable}
                                                                        <span className="dropdownicon">
                                                                            <img src="../images/nl-down-icon-white.png" />
                                                                        </span>
                                                                    </div>

                                                                    {(this.state.showdropdownliststate === 'SelectRealtor') && (
                                                                        <ul className="dpselect-option-list">
                                                                            {realtorsData.map((item, index) => {
                                                                                return <li onClick={() => this.setRealtorDropdownValue(item.value)} key={index}>{item.lable}</li>
                                                                            })}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <FieldControl
                                                                    name="offer_price"
                                                                    render={NumberInput}
                                                                    meta={{ label: "Enter Purchase Price" }}
                                                                />
                                                            </li>
                                                            <li>
                                                                <div className="dp-select-div">
                                                                    <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectLoan')}  >
                                                                        {loanTypeData.filter((item) => {
                                                                            return item.value == this.recForm.get("loan_type").value;
                                                                        })[0].lable}
                                                                        <span className="dropdownicon">
                                                                            <img src="../images/nl-down-icon-white.png" />
                                                                        </span>
                                                                    </div>

                                                                    {(this.state.showdropdownliststate === 'SelectLoan') && (
                                                                        <ul className="dpselect-option-list">
                                                                            {loanTypeData.map((item, index) => {
                                                                                return <li onClick={() => this.setLoanDropdownValue(item.value)}>{item.lable}</li>
                                                                            })}
                                                                        </ul>
                                                                    )}
                                                                </div>
                                                            </li>
                                                            <li>
                                                                <FieldControl name="down_payment" render={NumberInput} meta={{ label: "Enter Down Payment Amount" }}/>
                                                            </li>
                                                            <li>
                                                                <div className="dp-select-div">

                                                                    <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectCredit')}  >
                                                                        {creditScoreData.filter((item) => {
                                                                            return item.value == this.recForm.get("credit_score").value;
                                                                        })[0].lable}
                                                                        <span className="dropdownicon">
                                                                            <img src="../images/nl-down-icon-white.png" />
                                                                        </span>
                                                                    </div>

                                                                    {(this.state.showdropdownliststate === 'SelectCredit') && (
                                                                        <ul className="dpselect-option-list">
                                                                            {creditScoreData.map((item, index) => {
                                                                                return <li onClick={() => this.setCreditDropdownValue(item.value)}>{item.lable}</li>
                                                                            })}
                                                                        </ul>
                                                                    )}
                                                                </div>

                                                            </li>
                                                            <li>
                                                                <FieldControl
                                                                    name="bank_balance"
                                                                    render={NumberInput}
                                                                    meta={{ label: "Enter Bank Balance" }}
                                                                />
                                                            </li>
                                                            <li>
                                                                <FieldControl
                                                                    name="total_assets"
                                                                    render={NumberInput}
                                                                    meta={{ label: "Enter Total Assets " }}
                                                                />
                                                            </li>
                                                            <li>
                                                                <FieldControl
                                                                    name="max_annual_prop_tax"
                                                                    render={NumberInput}
                                                                    meta={{ label: "Enter Max Annual Property Taxes " }}
                                                                />
                                                            </li>
                                                            <li>
                                                                <FieldControl
                                                                    name="loan_amount"
                                                                    render={NumberInput}
                                                                    meta={{ label: "Enter Loan Amount" }}
                                                                />
                                                            </li>
                                                            <li>
                                                                <input className="form-control" onChange={(event) => this.onFileChange(event)} type="file" />
                                                            </li>
                                                            <li className="submitbtn-list">
                                                                {!this.state['loader']
                                                                    ?
                                                                    <input type="submit" className="submitpropert-btn" disabled={invalid}>
                                                                    </input>
                                                                    :
                                                                    <button type="submit" name="submit" disabled className="submitpropert-btn">
                                                                        <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true">
                                                                        </span>
                                                                        <span className="sr-only"><Trans>Loading...</Trans></span>
                                                                    </button>
                                                                }
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </form>
                                            )} />
                                    )}
                                </>
                                :
                                <ul className="epf-inputfld-list">
                                    <li><strong><Trans>Bid Submitted Successfully</Trans></strong></li>
                                </ul>
                            }</div>
                    </div>
                </div>
                {(this.state.showconfirmpopupstate == true) && (
                    <div className="add-realtor-popup-page">
                        <div className="arp-close-btn">
                            {(this.state.showconfirmpopupstate == true) && (
                                <img src="../images/close-btn.svg" onClick={this.showconfirmpopup} />
                            )}
                        </div>
                        <div className="add-realtor-popup">
                            <div className="arp-title"><Trans>Invite My Realtor</Trans></div>
                            <div className="arp-content">
                                <ul className="arp-inputfld-list">
                                    {!this.state['invitationSent']
                                        ?
                                        <>
                                            <li className="fullwidth arp-margin30">
                                                <TagsInput
                                                    value={this.state['tags']}
                                                    addKeys={[9, 13, 32, 186, 188]}
                                                    onlyUnique
                                                    addOnPaste
                                                    addOnBlur
                                                    inputProps={{ placeholder: 'Add lender email' }}
                                                    validationRegex={EMAIL_VALIDATION_REGEX}
                                                    pasteSplit={data => {
                                                        return data.replace(/[\r\n,;]/g, ' ').split(' ').map(d => d.trim())
                                                    }}
                                                    onChange={(event) => this.handleChange(event)} />

                                            </li>
                                            <div className="arp-btn-row">
                                                {
                                                    !this.state['invitationSent']
                                                        ?
                                                        <div className="modal-footer">
                                                            {
                                                                !this.state['invitationLoader'] ?
                                                                    <input type="submit" name="submit"
                                                                        onClick={(event) => this.sendInvitation(event, '')}
                                                                        className="arp-submit-btn">
                                                                    </input> :
                                                                    <button type="submit" name="submit" disabled className="arp-submit-btn">
                                                                        <span
                                                                            className="spinner-grow spinner-grow-sm"
                                                                            role="status"
                                                                            aria-hidden="true"> </span>
                                                                        <span className="sr-only"><Trans>Loading...</Trans></span>
                                                                    </button>
                                                            }
                                                        </div>
                                                        : null}

                                            </div>
                                        </> :
                                        <li className="fullwidth arp-margin30"><b><Trans>Invitation Sent Successfully</Trans></b></li>
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </React.Fragment>
        )
    }
}

export default SubmitBid;