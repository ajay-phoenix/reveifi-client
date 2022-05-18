import React, {Component} from "react";
import {Link, RouteComponentProps} from "react-router-dom";

import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import CookieService from "../../../services/CookieService";

import {
    FormBuilder,
    AbstractControl,
    Validators,
    FieldGroup,
    FieldControl
} from "react-reactive-form";

import "./_style.scss";
import UserService from "../../../services/UserService";
import UrlService from "../../../services/UrlService";
import {Trans} from "react-i18next";
import Modal from "react-bootstrap/Modal";
import {toast} from "react-toastify";

const TextInput = ({handler, touched, hasError, meta}: any) => (
    <div>
        <input className="form-control" type="text" placeholder={`Enter ${meta.label}`} {...handler()} />
        <span className="help-block">
            {touched && hasError("required") && `${meta.label} is required`}
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </div>
);
const NumberInput = ({handler, touched, hasError, meta}: any) => (
    <div>
        <input className="dp-inputfld" type="number" placeholder={`${meta.label}`} {...handler()} />
        <span className="help-block">
            {touched && hasError("required") && `${meta.label} is required`}
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
            {(touched && hasError('mismatch')) && "Down payment must be less than bid price!"}
        </span>
    </div>
);
const SelectInput = ({handler, touched, hasError, meta}: any) => (
    <div className="dp-select-div">
        <select className="dp-selectfld" {...handler()}>
            {meta.options.map((item, index) => (
                <option value={item.value}>{item.lable}</option>
            ))}
        </select>
        <span className="dropdownicon"><img src="../images/nl-down-icon-white.png"/></span>
        <span className="help-block">
            {touched && hasError("required") && `${meta.label} is required`}
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </div>
);


const role_id = CookieService.get('role_id');

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


const lendersData = [
    {
        lable: 'Select Lender',
        value: 0
    }
];
const allowedFileTypes = ['image/jpeg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/msword'];

class PreApprovalForm extends Component<RouteComponentProps> {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            userBus: {},
            props: {},
            preApprov: [],
            lender: [],
            loading: 'true',
            isPreApproved: 0,
            notListed: 0,
            bidSubmited: false,
            loader: false
        }

        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }

    setLenders(data) {
        data.forEach((res, i) => {
            const obj = {
                lable: res.name + " " + res.last_name,
                value: res.id
            };
            lendersData.push(obj);
        });
        const obj = {
            lable: 'Not Listed',
            value: -1
        };
        lendersData.push(obj);
    }

    async componentDidMount() {
        const userId = window.location.pathname.split("/").pop();
        const response = await UserService.getUserPreApproval(userId);
        this.setState({preApprov: response, loading: 'false'});

        if (response.length > 0) {
            this.setBidData(response[0]);
        }

    }

    async setBidData(bid) {
        var user = await UserService.getCurrentUserProfile();
        if(bid.lender_id == user.userProfile.id){
            this.recForm.get('offer_price').setValue(bid.offer_price);
            this.recForm.get('loan_type').setValue(bid.loan_type);
            this.recForm.get('loan_amount').setValue(bid.loan_amount);
            this.recForm.get('down_payment').setValue(bid.down_payment);
            this.recForm.get('credit_score').setValue(bid.credit_score);
            this.recForm.get('bank_balance').setValue(bid.bank_balance);
            this.recForm.get('is_pre_approved').setValue(bid.is_pre_approved);
            this.recForm.get('total_assets').setValue(bid.total_assets);
            this.recForm.get('max_annual_prop_tax').setValue(bid.max_annual_prop_tax);
            this.recForm.get('fileSource').clearValidators();
            this.recForm.get('fileSource').updateValueAndValidity();
        }
    }

    validatePreApprovedForMortgage = (AC: AbstractControl) => {
        this.setState({isPreApproved: 0});

        if (AC.value == 1) {
            this.setState({isPreApproved: 1});
        } else if (AC.value == 2) {
            this.setState({isPreApproved: 2});
        }
    };

    validateNolenderListed = (AC: AbstractControl) => {
        this.setState({notListed: 0});
        if (AC.value < 0) {
            this.setState({notListed: 1});
        }
    };

    validateDownPayment = (AC: AbstractControl) => {
        let bidPrice = AC.get('offer_price').value;
        let downPayment = AC.get('down_payment').value;

        if (parseFloat(downPayment) > parseFloat(bidPrice)) {
            AC.get('down_payment').setErrors({mismatch: true});
        } else {
            return null;
        }
    };

    calculateLoanAmount = (AC: AbstractControl) => {
        if (this.recForm) {
            let offerPrice = this.recForm.get('offer_price').value;
            let downPayment = this.recForm.get('down_payment').value;
            const total = (offerPrice ? parseFloat(offerPrice) : 0) - (downPayment ? parseFloat(downPayment) : 0);
            this.recForm.patchValue({'loan_amount': total.toString()});
        }
    };

    recForm = FormBuilder.group({
        offer_price: ['', [Validators.required, this.calculateLoanAmount]],
        loan_type: ['1'],
        loan_amount: ['', Validators.required],
        down_payment: ['', [Validators.required, this.calculateLoanAmount]],
        credit_score: ['1'],
        bank_balance: [''],
        total_assets: [''],
        max_annual_prop_tax: [''],
        is_pre_approved: ['', [this.validatePreApprovedForMortgage]],
        lender: [0, this.validateNolenderListed],
        bank_name: [],
        lender_email: ['', Validators.email],
        lender_phone: [],
        fileSource: ['', Validators.required],
    }, {
        validators: this.validateDownPayment
    });

    async prepareData() {
        const formData = new FormData();
        const propId = window.location.pathname.split("/").pop();
        formData.append('offer_price', this.recForm.get('offer_price').value);
        formData.append('loan_type', this.recForm.get('loan_type').value);
        formData.append('loan_amount', this.recForm.get('loan_amount').value);
        formData.append('down_payment', this.recForm.get('down_payment').value);
        formData.append('credit_score', this.recForm.get('credit_score').value);
        formData.append('bank_balance', this.recForm.get('bank_balance').value);
        formData.append('total_assets', this.recForm.get('total_assets').value);
        formData.append('max_annual_prop_tax', this.recForm.get('max_annual_prop_tax').value);
        formData.append('is_pre_approved', this.recForm.get('is_pre_approved').value);
        formData.append('lender', this.recForm.get('lender').value);
        formData.append('bank_name', this.recForm.get('bank_name').value);
        formData.append('lender_email', this.recForm.get('lender_email').value);
        formData.append('lender_phone', this.recForm.get('lender_phone').value);
        formData.append('file', this.recForm.get('fileSource').value);
        formData.append('prop_id', propId);

        if (this.state['preApprov'].length > 0) {
            formData.append('id', this.state['preApprov'][0]['id']);
        }

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

        this.setState({loader: true});
        this.recForm.patchValue({loader: true});

        const formData = await this.prepareData();

        let response: any;

        if (this.state['preApprov'].length > 0) {
            response = await UserService.updatePreApproval(formData);
        } else {
            response = await UserService.submitPreApproval(formData);
        }


        if (typeof response.id !== 'undefined') {
            this.setState({bidSubmited: true});
            this.setState({loader: false});
            this.recForm.patchValue({loader: false});
            toast.success("Pre Approval Submitted successfully", {
                closeOnClick: true,
                pauseOnHover: true,
            });
            this.recForm.reset();
            this.props.history.push("/client-list");
        } else {
            this.recForm.patchValue({loader: false});
            this.setState({loader: false});
            toast.error("Something went wrong !");
        }
    }

    async downloadFile(fileName) {
        try {
            const propId = window.location.pathname.split("/").pop();

            const formData = new FormData();
            formData.append('fileName', fileName);

            const response = await UserService.downloadPreApprovFile(formData);
            const link = document.createElement('a');
            link.href = response;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            toast.error('Something went wrong.');
        }
    }

    render() {
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <section className="submit-property-page">

                    <h3><Trans>Submit Pre-Approval</Trans></h3>
                    <div className="submit-property-box">
                        <div className="dp-title">
                            <Trans>Enter Applicable Pre-Approval Details</Trans>
                        </div>
                        <FieldGroup
                            control={this.recForm}
                            render={({invalid, pristine, pending, meta}) => (
                                <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                                    <div className="dp-content">
                                        <ul className="dp-input-list">
                                            <li>
                                                {(this.state['preApprov'].length > 0) && (
                                                    <label>Enter Purchase Price</label>
                                                )}
                                                <FieldControl
                                                    name="offer_price"
                                                    render={NumberInput}
                                                    meta={{label: "Enter Purchase Price"}}
                                                />
                                            </li>
                                            <li>
                                                {(this.state['preApprov'].length > 0) && (
                                                    <label>Enter Loan Type</label>
                                                )}
                                                <div className="dp-select-div">
                                                    <FieldControl
                                                        name="loan_type"
                                                        render={SelectInput}
                                                        meta={{
                                                            label: "Loan Type",
                                                            options: [
                                                                {
                                                                    lable: 'FHA',
                                                                    value: 1
                                                                },
                                                                {
                                                                    lable: 'VA',
                                                                    value: 2
                                                                },
                                                                {
                                                                    lable: 'Conventional',
                                                                    value: 3
                                                                },
                                                                {
                                                                    lable: 'Reverse',
                                                                    value: 4
                                                                }
                                                            ]
                                                        }}
                                                    />
                                                </div>
                                            </li>
                                            <li>
                                                {(this.state['preApprov'].length > 0) && (
                                                    <label><Trans>Enter Down Payment Amount</Trans></label>
                                                )}
                                                <FieldControl
                                                    name="down_payment"
                                                    render={NumberInput}
                                                    meta={{label: "Enter Down Payment Amount"}}
                                                />
                                            </li>
                                            <li>
                                                {(this.state['preApprov'].length > 0) && (
                                                    <label><Trans>Enter Credit Score</Trans></label>
                                                )}
                                                <FieldControl
                                                    name="credit_score"
                                                    render={SelectInput}
                                                    meta={{
                                                        label: "Credit Score",
                                                        options: [
                                                            {
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
                                                            }
                                                        ]
                                                    }}
                                                />
                                            </li>
                                            <li>
                                                {(this.state['preApprov'].length > 0) && (
                                                    <label><Trans>Enter Bank Balance</Trans></label>
                                                )}
                                                <FieldControl
                                                    name="bank_balance"
                                                    render={NumberInput}
                                                    meta={{label: "Enter Bank Balance"}}
                                                />
                                            </li>
                                            <li>
                                                {(this.state['preApprov'].length > 0) && (
                                                    <label><Trans>Enter Total Assets</Trans></label>
                                                )}
                                                <FieldControl
                                                    name="total_assets"
                                                    render={NumberInput}
                                                    meta={{label: "Enter Total Assets"}}
                                                />
                                            </li><li>
                                                {(this.state['preApprov'].length > 0) && (
                                                    <label><Trans>Enter Total Assets</Trans></label>
                                                )}
                                                <FieldControl
                                                    name="max_annual_prop_tax"
                                                    render={NumberInput}
                                                    meta={{label: "Enter Max Annual Property Taxes"}}
                                                />
                                            </li>
                                            <li>
                                                {(this.state['preApprov'].length > 0) && (
                                                    <label><Trans>Enter Loan Amount</Trans></label>
                                                )}
                                                <FieldControl
                                                    name="loan_amount"
                                                    render={NumberInput}
                                                    meta={{label: "Enter Loan Amount"}}
                                                />
                                            </li>
                                            <li>
                                                {(this.state['preApprov'].length > 0 && this.state['preApprov'][0]['document_name']) && (
                                                    <span>
                                                        <a href="javascript:void(0);"
                                                           onClick={() => this.downloadFile(this.state['preApprov'][0]['document_name'])}
                                                           style={{color: "#c3d235"}}
                                                        >
                                                            <i className="fa fa-download"></i>
                                                        </a>
                                                    </span>
                                                )}
                                                <input className="form-control"
                                                       onChange={(event) => this.onFileChange(event)}
                                                       type="file"/>
                                            </li>
                                            <li className="submitbtn-list">
                                                {!this.state['loader']
                                                    ?
                                                    <input type="submit" className="submitpropert-btn"
                                                           disabled={invalid}></input>
                                                    :
                                                    <button type="submit" name="submit" disabled
                                                            className="submitpropert-btn">
                                                        <span className="spinner-grow spinner-grow-sm"
                                                              role="status"
                                                              aria-hidden="true"></span>
                                                        <span className="sr-only"><Trans>Loading...</Trans></span>
                                                    </button>
                                                }
                                            </li>
                                        </ul>
                                    </div>
                                </form>
                            )}/>
                    </div>
                </section>
            </React.Fragment>
        )
    }
}

export default PreApprovalForm;