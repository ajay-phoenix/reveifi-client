import React, { Component } from "react";
import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import { RouteComponentProps } from "react-router";
import Modal from "react-bootstrap/Modal";
import CookieService from "../../../services/CookieService";
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css'
import UserService from "../../../services/UserService";
import { toast } from "react-toastify";
import Select from 'react-select';
import {
    FormBuilder,
    AbstractControl,
    Validators,
    FieldGroup,
    FieldControl
} from "react-reactive-form";
import { Link } from "react-router-dom";
import { Button, CardColumns } from "react-bootstrap";

import { Trans, useTranslation } from "react-i18next";

export function MyComponent({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input className="dp-inputfld" type={`${meta.type}`} id={`Enter ${meta.id}`} placeholder={t(`Enter ${meta.label}`)} {...handler()} />
}

export function CheckboxComponent({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <>
        <input type="checkbox" className="lib-checkbox" id={meta.id} {...handler()}/>
        <label className="lib-checkboxlabel" htmlFor={meta.id}>{meta.label}</label>
    </>
}

const CheckBox = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <CheckboxComponent handler={handler} meta={meta} ></CheckboxComponent>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
        </span>
    </div>
);


const role_id = CookieService.get('role_id');
const TextInput = ({ handler, touched, hasError, meta }: any) => (
    <>
        <MyComponent handler={handler} meta={meta} ></MyComponent>
        {/* <input className="dp-inputfld" type={`${meta.type}`} id={`Enter ${meta.id}`} placeholder={`Enter ${meta.label}`} {...handler()} /> */}
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
            <Trans>{hasError('pattern') && `${meta.label} is not valid`}</Trans>
        </span>
    </>
);

const SelectInput = ({ handler, touched, hasError, meta }: any) => (
    <>
        <select className="dp-selectfld" {...handler()}>
            {meta.options.map((item, index) => (<option value={item.value}>{item.label}</option>))}
        </select>
        <span className="dropdownicon">
            <img src="../images/nl-down-icon-white.png" />
        </span>
        <span className="help-block">
            {touched && hasError("required") && `${meta.label} is required`}
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </>
);

let sellersData = [];
let sellingRealtorsData = [];
let buyersData = [];
let buyingRealtorsData = [];
let lendersData = [];


class AddPropertyToTransactionTable extends Component<RouteComponentProps, any> {
    constructor(props) {
        super(props);

        this.handler = this.handler.bind(this);

        this.state = {
            tags: [],
            user: {},
            loading: 'true',
            isOpen: false,
            success: 'false',
            realtorId: '',
            showrealtorpopupstate: false,
            showconfirmpopupstate: false,
            inviteplaceholder: '',
            businessProfile: true,
            user_role: 0,
            showdropdownliststate: '',
            realtors: [],
            current_step: 1,
            showCreateUserPopup: false
        };

        sellersData.push({ label: 'Select Seller', value: 0 });
        sellingRealtorsData.push({ label: 'Select Selling Realtor', value: 0 });
        buyersData.push({ label: 'Select Buyer', value: 0 });
        buyingRealtorsData.push({ label: 'Select Buying Realtor', value: 0 });
        lendersData.push({ label: 'Select Lender', value: 0 });
    }

    validateState = (AC: AbstractControl) => {
        let val = AC.get('countyState').value;
        if (val) {
            if(val !== 'NJ' && val !== 'NY'){
                AC.get('countyState').setErrors({ validateState: true });
            } else{
                return null;
            }
        } else {
            return null;
        }
    };

    validateCheckbox = (AC: AbstractControl) => {
        let val = AC.get('i_represent').value;
        if (!val) {
            AC.get('i_represent').setErrors({ validateState: true });
        } else {
            return null;
        }
    };

    signUPForm = FormBuilder.group({
        name: ['', [Validators.required]],
        last_name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        countyState: ['', [Validators.required]],
        mobile_number: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        role_id: ['1'],
        //notifications_only: $('#notifications_only:checked').length
        notifications_only: 0,
        i_represent: [false]
    }, {
        validators: [this.validateState],
    });



    async selectClients(data, role_id) {
        var userIds = [];
        data.forEach((res, i) => {
            let obj = { label: null, value: null };
            if(role_id===1){
                obj = {
                    label: res.userProfile.name + " " + res.userProfile.last_name,
                    value: res.userProfile.id
                };
                sellersData.push(obj);
                buyersData.push(obj);
                /* if( res.client.name && res.client.last_name && res.client.id){
                    obj = {
                        label: res.client.name + " " + res.client.last_name,
                        value: res.client.id
                    };
    
                    if (obj.value) {
                        if (userIds.indexOf(obj.value.toString()) === -1) {
                            sellersData.push(obj);
                            buyersData.push(obj);
                        }
                        userIds.push(obj.value.toString())
                    }    
                } */
            } else{
                if(res.businessProfile && res.userProfile){
                    obj = {
                        label: res.userProfile.name + " " + res.userProfile.last_name,
                        value: res.userProfile.id
                    };
                    
                    if(role_id===2){
                        sellingRealtorsData.push(obj);
                        buyingRealtorsData.push(obj);
                    } else{
                        lendersData.push(obj);
                    }
                }
            }
        });

        /* if(role_id===1){
            sellersData.push({ label: 'Invite Seller', value: -1 });
            buyersData.push({ label: 'Invite Buyer', value: -1 });
        } else if(role_id===2){
            sellingRealtorsData.push({ label: 'Invite Selling Realtor', value: -1 });
            buyingRealtorsData.push({ label: 'Invite Buying Realtor', value: -1 });
        } else{
            lendersData.push({ label: 'Invite Lender', value: -1 });
        } */
        

        this.setState({ sellers: sellersData })
        this.setState({ sellingRealtors: sellingRealtorsData })
        this.setState({ buyers: buyersData })
        this.setState({ buyingRealtors: buyingRealtorsData })
        this.setState({ lenders: lendersData })
    }

    async componentDidMount() {
        this.setState({ inviteplaceholder: 'Add clients email' });
        //var clients = await UserService.getClientList()
        var clients = await UserService.getAllUsersWithRole(1)
        var all_realtors = await UserService.getAllUsersWithRole(2)
        var all_lenders = await UserService.getAllUsersWithRole(3)

        await this.selectClients(clients, 1);
        await this.selectClients(all_realtors, 2);
        await this.selectClients(all_lenders, 3);
        const userProfile = await UserService.getCurrentUserProfile();
        this.setState({ user: userProfile.userProfile, user_role: userProfile.userProfile.role_id, businessProfile: userProfile.businessProfile });
    }


    validateNoUserListed = (AC: AbstractControl) => {
        if (AC.value < 0) {
            this.showModal();
        } else {
            return null;
        }
    };

    handler() {
        this.setState({
            updateLanguage: true
        })
    }

    property = FormBuilder.group({
        title: [''],
        mls_link: [''],
        youtube_video: [''],
        price: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        address: ['', [Validators.required]],
        state: ['', [Validators.required]],
        city: ['', [Validators.required]],
        zipcode: ['', [Validators.required]],
        counties: ['', [Validators.required]],
        country: ['840', [Validators.required]],
        countryHtml: ['USA', [Validators.required]],
        media: [''],
        fileSource: ['', [Validators.required]],
    });


    seller = FormBuilder.group({
        seller: ['', [Validators.required, this.validateNoUserListed]],
        sellerHtml: ['', [this.validateNoUserListed]],
        showdropdownlistValue: ['']
    })

    sellingRealtor = FormBuilder.group({
        sellingRealtor: ['', [Validators.required, this.validateNoUserListed]],
        sellingRealtorHtml: ['', [this.validateNoUserListed]],
        showdropdownlistValue: ['']
    })

    buyer = FormBuilder.group({
        buyer: ['', [Validators.required, this.validateNoUserListed]],
        buyerHtml: ['', [this.validateNoUserListed]],
        showdropdownlistValue: ['']
    })

    buyingRealtor = FormBuilder.group({
        buyingRealtor: ['', [Validators.required, this.validateNoUserListed]],
        buyingRealtorHtml: ['', [this.validateNoUserListed]],
        showdropdownlistValue: ['']
    })

    lender = FormBuilder.group({
        lender: ['', [Validators.required, this.validateNoUserListed]],
        lenderHtml: ['', [this.validateNoUserListed]],
        showdropdownlistValue: ['']
    })

    onFileChange(event) {
        if (event.target.files && event.target.files.length) {
            const file = event.target.files;
            var images = [];
            for (let i = 0; i < event.target.files.length; i++) {
                images.push(event.target.files[i])
            }

            this.property.patchValue({
                fileSource: event.target.files
            });
        }
    }

    handleChange(tags) {
        this.setState({ tags });
    }

    showModal() {
        this.setState({ tags: [] });
        this.setState({ showrealtorpopupstate: true })
    }

    createUserPopup(role_id, user_role) {
        this.signUPForm.patchValue({ role_id: role_id })
        this.setState({ showCreateUserPopup: true, add_user_type: role_id, add_user_role: user_role })
    }
    hideCreateUserPopup() {
        this.setState({ showCreateUserPopup: false })
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
                roleId: role_id == 2 ? 1 : 2,
            };

            const response = await UserService.sendInvitations(data);
            if (response) {
                if (response['data'] !== 0) {
                    let realtor = [];
                    if (role_id == 2) {
                        realtor = await UserService.getClientList()

                        for (let i = 0; i < realtor.length; i++) {
                            var client_id = realtor[i].client.id;
                            var client_email = realtor[i].client.email;

                            for (let j = 0; j < data.invitation.length; j++) {
                                if (data.invitation[j] == client_email) {
                                    this.setState({ realtorId: client_id })
                                }
                            }
                        }
                    } else {
                        realtor = await UserService.getClientList();

                        for (let i = 0; i < realtor.length; i++) {
                            var client_id = realtor[i].client.id;
                            var client_email = realtor[i].client.email;

                            for (let j = 0; j < data.invitation.length; j++) {
                                if (data.invitation[j] == client_email) {
                                    this.setState({ realtorId: client_id })
                                }
                            }
                        }
                    }


                    this.setState({ invitationSent: false });
                    this.setState({ invitationLoader: false });
                    this.setState({ showrealtorpopupstate: false });
                    if (response.data.success === false) {
                        toast.error(response.data.message, { autoClose: false });
                    } else {
                        toast.success("Invitation Sent Successfuly", {
                            closeOnClick: true,
                            pauseOnHover: true,
                        });
                    }
                }


                if (response['onceInvited'].length > 0) {
                    response['onceInvited'].forEach((v) => {
                        toast.error("The user has already been invited: " + v.to_email, { autoClose: false, });
                    });
                    this.setState({ invitationSent: false });
                    this.setState({ invitationLoader: false });
                    this.setState({ showrealtorpopupstate: false });
                }
            } else {
                this.setState({ invitationSent: false });
                this.setState({ invitationLoader: false });
                this.setState({ showrealtorpopupstate: false });
                toast.error("Some thing went wrong please try again.", { autoClose: false, });
            }
        } else {
            this.setState({ invitationSent: false });
            this.setState({ invitationLoader: false });
            this.setState({ showrealtorpopupstate: false });
            toast.error("No valid email provided !", { autoClose: false, });
        }
    }

    showconfirmpopup = () => {
        if (this.state.showconfirmpopupstate == true) {
            this.setState({ showconfirmpopupstate: false })
        } else {
            this.setState({ showconfirmpopupstate: true })
        }
    }
    hidepopup = () => {
        this.setState({ showrealtorpopupstate: false })
    }

    showdropdownlist = (title) => {
        this.setState({ showdropdownliststate: title });
        this.property.patchValue({ showdropdownlistValue: title });
        this.seller.patchValue({ showdropdownlistValue: title });
        this.sellingRealtor.patchValue({ showdropdownlistValue: title });
        this.buyer.patchValue({ showdropdownlistValue: title });
        this.buyingRealtor.patchValue({ showdropdownlistValue: title });
        this.lender.patchValue({ showdropdownlistValue: title });
        this.signUPForm.patchValue({ showdropdownlistValue: title });
    }

    setCountryDropdownValue = (value, html) => {
        this.property.patchValue({ country: value });
        this.property.patchValue({ countryHtml: html });
        this.showdropdownlist("");
    }

    setUserDropdownValue = (value, html, selected_dropdown) => {
        if (selected_dropdown === 'seller') {
            this.seller.patchValue({ seller: value });
            this.seller.patchValue({ sellerHtml: html });
        } else if (selected_dropdown === 'sellingRealtor') {
            this.sellingRealtor.patchValue({ sellingRealtor: value });
            this.sellingRealtor.patchValue({ sellingRealtorHtml: html });
        } else if (selected_dropdown === 'buyer') {
            this.buyer.patchValue({ buyer: value });
            this.buyer.patchValue({ buyerHtml: html });
        } else if (selected_dropdown === 'buyingRealtor') {
            this.buyingRealtor.patchValue({ buyingRealtor: value });
            this.buyingRealtor.patchValue({ buyingRealtorHtml: html });
        } else {
            this.lender.patchValue({ lender: value });
            this.lender.patchValue({ lenderHtml: html });
        }


        this.showdropdownlist("");
    }

    
    async createUser() {
        if (!this.signUPForm.get('i_represent').value) {
            toast.error('You must represent the client to add them to your account', {
                closeOnClick: true,
                pauseOnHover: true,
            });
          
            return false;
        }
   
    
        this.setState({ loader: true, errorMsg: false });
        this.signUPForm.patchValue({ loader: true }); 
        //this.signUPForm.patchValue({ notifications_only: $('#notifications_only:checked').length }); 
        this.signUPForm.patchValue({ notifications_only: 0 }); 
    
        const postData = this.signUPForm.value;
        const response = await UserService.createClient(postData);
        
        this.setState({ loader: false, errorMsg: false });
        if (response.status == 'failure') {
            for (let i = 0; i < response.message.email.length; i++) {
                toast.error(response.message.email[i], {
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            }
    
        } else if (response.status == 'fake_email') {
            toast.error(response.message, {
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else if (response) {
            const data = {
                invitation: [response.email],
                propId: 0,
                roleId: response.role_id,
            };
            const invitation = await UserService.sendInvitations(data);
    
            toast.success(this.state.add_user_role+' created successfully', {
                closeOnClick: true,
                pauseOnHover: true,
            });
            
            this.assignRoleToUser(response.id, this.state.add_user_role)
            this.setState({ showCreateUserPopup: false })
            this.nextStep()
        }
    }

    assignRoleToUser(user_id, user_type){
        if(user_type=='seller' || user_type=='Seller'){
            this.seller.patchValue({ seller: user_id })
        } else if(user_type=='sellingRealtor' || user_type=='Selling Realtor'){
            this.sellingRealtor.patchValue({ sellingRealtor: user_id })
        } else if(user_type=='buyer' || user_type=='Buyer'){
            this.buyer.patchValue({ buyer: user_id })
        } else if(user_type=='buyingRealtor' || user_type=='Buyer Realtor'){
            this.buyingRealtor.patchValue({ buyingRealtor: user_id })
        } else if(user_type=='lender' || user_type=='Lender'){
            this.lender.patchValue({ lender: user_id })
        }
    }

    prevStep() {
        this.setState({ current_step: this.state.current_step - 1 })
    }
    nextStep() {
        this.setState({ current_step: this.state.current_step + 1 })
    }

    async submitProperty(){
        const formData = new FormData();
        formData.append('title', this.property.get('address').value)
        formData.append('mls_link', this.property.get('mls_link').value)
        formData.append('youtube_video', this.property.get('youtube_video').value)
        formData.append('price', this.property.get('price').value)
        formData.append('address', this.property.get('address').value)
        formData.append('state', this.property.get('state').value)
        formData.append('city', this.property.get('city').value)
        formData.append('zipcode', this.property.get('zipcode').value)
        formData.append('counties', this.property.get('counties').value)
        formData.append('country', this.property.get('country').value)
        
        for(let i=0; i<this.property.get('fileSource').value.length; i++){
            formData.append('media[]', this.property.get('fileSource').value[i]);
        }

        formData.append('seller',this.seller.get('seller').value)
        formData.append('sellingRealtor',this.sellingRealtor.get('sellingRealtor').value)
        formData.append('buyer',this.buyer.get('buyer').value)
        formData.append('buyingRealtor',this.buyingRealtor.get('buyingRealtor').value)
        formData.append('lender',this.lender.get('lender').value)

        var response = await UserService.addPropertyToTransactionTable(formData);
        if(response.success){
            toast.success("Property successfully added to the transaction table", {
                closeOnClick: true,
                pauseOnHover: true,
            });
            setTimeout(function(){
                 window.location.href = '/my-properties';
            },2000)
        } else{
            alert('Something went wrong')
        }
    }

    render() {
        const EMAIL_VALIDATION_REGEX = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i        
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>

                <section className="submit-property-page">
                    <Modal show={this.state['isOpen']} onHide={() => this.hideModal()}>
                        <div>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <button type="button" className="close float-right" onClick={() => this.hideModal()} data-dismiss="modal">&times;</button>
                                </div>
                                <div className="modal-body">
                                    {!this.state['invitationSent'] ?
                                        <div className="invite-buyer-upper">
                                            <h5 style={{ marginTop: '-40px', marginBottom: '40px' }}><Trans>Invite My Realtor</Trans></h5>
                                            <div className="tag_list_wrapper">
                                                <div className="popup-btns">
                                                    <TagsInput
                                                        value={this.state['tags']}
                                                        addKeys={[9, 13, 32, 186, 188]}
                                                        onlyUnique
                                                        addOnPaste
                                                        addOnBlur
                                                        inputProps={{ placeholder: 'Add lenders email' }}
                                                        validationRegex={EMAIL_VALIDATION_REGEX}
                                                        pasteSplit={data => {
                                                            return data.replace(/[\r\n,;]/g, ' ').split(' ').map(d => d.trim())
                                                        }}
                                                        onChange={(event) => this.handleChange(event)}
                                                    />
                                                </div>
                                            </div>
                                        </div> :
                                        <h2 className="text-center pt-0 pb-4"><Trans>Invitation Sent!!</Trans></h2>
                                    }
                                </div>

                                {!this.state['invitationSent'] ?
                                    <div className="modal-footer">
                                        {!this.state['invitationLoader'] ?
                                            <input type="submit" name="submit"
                                                onClick={(event) => this.sendInvitation(event, '')}
                                                className="btn btn-invite-buyers">
                                            </input> :
                                            <button type="submit" name="submit" disabled className="btn btn-invite-buyers">
                                                <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                                <span className="sr-only"><Trans>Loading...</Trans></span>
                                            </button>
                                        }
                                    </div>
                                    : null}
                            </div>
                        </div>
                    </Modal>
                    <h3><Trans>Add Property To Transaction Table</Trans></h3>
                    <div className="ndp-right-box">
                        {!this.state['businessProfile'] && this.state.user_role !== 1 ?
                            <div className="alert alert-warning alert_box" role="alert">  <Link to="/edit-profile"><Trans>Please complete your business profile</Trans></Link></div> : null
                        }
                    </div>
                    <div className="submit-property-box">
                        <div className="progress-line-sec">
                            <ul id="progressbar">
                                <li className={this.state.current_step > 0 ? "active" : null} id="first"><strong>About the property </strong></li>
                                <li className={this.state.current_step > 1 ? "active" : null} id="second"><strong>About the seller </strong></li>
                                <li className={this.state.current_step > 2 ? "active" : null} id="third"><strong>About the selling realtor </strong></li>
                                <li className={this.state.current_step > 3 ? "active" : null} id="fourth"><strong> About the buyer </strong></li>
                                <li className={this.state.current_step > 4 ? "active" : null} id="fifth"><strong>About the buying realtor</strong></li>
                                <li className={this.state.current_step > 5 ? "active" : null} id="sixth"><strong>About the lender</strong></li>
                            </ul>
                        </div>
                        <div className={this.state.current_step == 1 ? 'd-block' : 'd-none'} id="step-1">
                            <div className="dp-title">
                                <Trans>About the property</Trans>
                            </div>
                            <FieldGroup control={this.property} render={({ invalid, pristine, pending, meta }) => (
                                <div className="dp-content">
                                    <ul className="dp-input-list">
                                        <li>
                                            <FieldControl name="mls_link" render={TextInput}
                                                meta={{ label: "Realtor.Com or alternative MLS site link (optional)", id: "MLSLink", type: "text" }} />
                                        </li>
                                        <li>
                                            <FieldControl name="youtube_video" render={TextInput}
                                                meta={{ label: "Youtube Video link (optional)", id: "videoLink", type: "text" }} />
                                        </li>
                                        <li>
                                            <FieldControl name="price" render={TextInput} meta={{
                                                label: "Ask/List price",
                                                id: "AskingPrice",
                                                type: "number"
                                            }} />
                                        </li>
                                        <li>
                                            <FieldControl name="address" render={TextInput}
                                                meta={{ label: "Address", id: "Address", type: "text" }} />
                                        </li>
                                        <li>
                                            <FieldControl name="state" render={TextInput}
                                                meta={{ label: "State", id: "State", type: "text" }} />
                                        </li>
                                        <li>
                                            <FieldControl name="city" render={TextInput}
                                                meta={{ label: "City", id: "City", type: "text" }} />
                                        </li>
                                        <li>
                                            <FieldControl name="zipcode" render={TextInput}
                                                meta={{ label: "Zip Code", id: "ZipCode", type: "number" }} />
                                        </li>
                                        <li>

                                            <div className="dp-select-div">
                                                <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectCountry')} >
                                                    {this.property.get('countryHtml').value ? this.property.get('countryHtml').value : <Trans>Select Country</Trans>}
                                                    <span className="dropdownicon">
                                                        <img src="../images/nl-down-icon-white.png" />
                                                    </span>
                                                </div>
                                                {(this.state.showdropdownliststate == 'SelectCountry') && (
                                                    <ul className="dpselect-option-list">
                                                        <li onClick={() => this.setCountryDropdownValue('840', 'USA')}>USA</li>
                                                        <li onClick={() => this.setCountryDropdownValue('826', 'UK')}>UK</li>
                                                    </ul>
                                                )}
                                            </div>
                                        </li>
                                        <li>
                                            <FieldControl name="counties" render={TextInput}
                                                meta={{ label: "County", id: "counties", type: "text" }} />
                                        </li>
                                        <li>
                                            <div className="dp-inputfile-box">
                                                <label htmlFor="choosefile"><Trans>Choose File</Trans></label>
                                                <input className="dp-inputfld" id="choosefile"
                                                    onChange={(event) => this.onFileChange(event)} type="file" multiple accept="image/*" />
                                            </div>
                                        </li>
                                    </ul>

                                    <div className="text-center">
                                        <Button onClick={() => this.nextStep()} className="btn theme-btn px-4" disabled={invalid}>Next <i className="fa fa-arrow-right"></i></Button>
                                    </div>
                                </div>
                            )} />
                        </div>

                        <div className={this.state.current_step == 2 ? 'd-block' : 'd-none'} id="step-2">
                            <div className="dp-title">
                                <Trans>About the seller</Trans>
                            </div>
                            <FieldGroup control={this.seller} render={({ invalid, pristine, pending, meta }) => (
                                <div className="dp-content">
                                    <ul className="dp-input-list">
                                        <li className="w-100">
                                            <div className="dp-select-div w-50 mx-auto">
                                                <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectSeller')}  >
                                                    {this.seller.get('sellerHtml').value ? this.seller.get('sellerHtml').value : <Trans>Select Seller</Trans>}
                                                    <span className="dropdownicon">
                                                        <img src="../images/nl-down-icon-white.png" />
                                                    </span>
                                                </div>
                                                {(this.seller.get('showdropdownlistValue').value === 'SelectSeller') && (
                                                    <ul className="dpselect-option-list" style={{ height: '50vh', overflowY: 'scroll', }}>
                                                        {this.state.sellers.map((realtor, i) => {
                                                            return <li key={i} onClick={() => this.setUserDropdownValue(realtor.value, realtor.label, 'seller')}>{realtor.label}</li>
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        </li>

                                        <li className="w-100 mb-0">
                                            <div className="text-center">
                                                <input type="checkbox" id="currentUserSeller" onClick={()=>this.assignRoleToUser(this.state.user.id, 'seller')}/>
                                                <label htmlFor="currentUserSeller"><Trans>&nbsp;Assign this role to me</Trans></label>
                                            </div>
                                        </li>

                                        <li className="w-100">
                                            <div className="text-center">
                                                <button className="btn btn-light-primary text-light" onClick={() => this.createUserPopup('1', 'Seller')}>Create Seller</button>
                                            </div>
                                        </li>
                                    </ul>
                                    <div className="text-center">
                                        <Button onClick={() => this.prevStep()} className="btn theme-btn px-4 mr-4"><i className="fa fa-arrow-left"></i> Previous</Button>
                                        <Button onClick={() => this.nextStep()} className="btn theme-btn px-4" disabled={invalid}>Next <i className="fa fa-arrow-right"></i></Button>
                                    </div>
                                </div>
                            )} />
                        </div>

                        <div className={this.state.current_step == 3 ? 'd-block' : 'd-none'} id="step-2">
                            <div className="dp-title">
                                <Trans>About the selling realtor</Trans>
                            </div>

                            <FieldGroup control={this.sellingRealtor} render={({ invalid, pristine, pending, meta }) => (
                                <div className="dp-content">
                                    <ul className="dp-input-list">
                                        <li className="w-100">
                                            <div className="dp-select-div w-50 mx-auto">
                                                <Select
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    defaultValue={this.state.sellingRealtors ? this.state.sellingRealtors[0]:null}
                                                    isDisabled={false}
                                                    isLoading={false}
                                                    isClearable={true}
                                                    isRtl={false}
                                                    isSearchable={true}
                                                    options={this.state.sellingRealtors}
                                                    onChange={(e)=>this.setUserDropdownValue(e.value, e.label, 'sellingRealtor')}
                                                />
                                            </div>

                                            {/* <div className="dp-select-div w-50 mx-auto">
                                                <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectSellingRealtor')}  >
                                                    {this.sellingRealtor.get('sellingRealtor').value ? this.sellingRealtor.get('sellingRealtorHtml').value : <Trans>Select Selling Realtor</Trans>}
                                                    <span className="dropdownicon">
                                                        <img src="../images/nl-down-icon-white.png" />
                                                    </span>
                                                </div>
                                                {(this.sellingRealtor.get('showdropdownlistValue').value === 'SelectSellingRealtor') && (
                                                    <ul className="dpselect-option-list">
                                                        {this.state.sellingRealtors.map((realtor, i) => {
                                                            return <li key={i} onClick={() => this.setUserDropdownValue(realtor.value, realtor.label, 'sellingRealtor')}>{realtor.label}</li>
                                                        })}
                                                    </ul>
                                                )}
                                            </div> */}
                                        </li>

                                        <li className="w-100 mb-0">
                                            <div className="text-center">
                                                <input type="checkbox" id="currentUserSellingRealtor" onClick={()=>this.assignRoleToUser(this.state.user.id, 'sellingRealtor')}/>
                                                <label htmlFor="currentUserSellingRealtor"><Trans>&nbsp;Assign this role to me</Trans></label>
                                            </div>
                                        </li>

                                        <li className="w-100 ">
                                            <div className="text-center">
                                                <button className="btn btn-light-primary text-light" onClick={() => this.createUserPopup('2', 'Selling Realtor')}>Create Selling Realtor</button>
                                            </div>
                                        </li>
                                    </ul>
                                    <div className="text-center">
                                        <Button onClick={() => this.prevStep()} className="btn theme-btn px-4 mr-4"><i className="fa fa-arrow-left"></i> Previous</Button>
                                        <Button onClick={() => this.nextStep()} className="btn theme-btn px-4" disabled={invalid}>Next <i className="fa fa-arrow-right"></i></Button>
                                    </div>
                                </div>
                            )} />
                        </div>

                        <div className={this.state.current_step == 4 ? 'd-block' : 'd-none'} id="step-3">
                            <div className="dp-title">
                                <Trans>About the buyer</Trans>
                            </div>
                            <FieldGroup control={this.buyer} render={({ invalid, pristine, pending, meta }) => (
                                <div className="dp-content">
                                    <ul className="dp-input-list">
                                        <li className="w-100">
                                            <div className="dp-select-div w-50 mx-auto">
                                                <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectBuyer')}  >
                                                    {this.buyer.get('buyer').value ? this.buyer.get('buyerHtml').value : <Trans>Select Buyer</Trans>}
                                                    <span className="dropdownicon">
                                                        <img src="../images/nl-down-icon-white.png" />
                                                    </span>
                                                </div>
                                                {(this.buyer.get('showdropdownlistValue').value === 'SelectBuyer') && (
                                                    <ul className="dpselect-option-list" style={{ height: '50vh', overflowY: 'scroll', }}>
                                                        {this.state.buyers.map((realtor, i) => {
                                                            return <li key={i} onClick={() => this.setUserDropdownValue(realtor.value, realtor.label, 'buyer')}>{realtor.label}</li>
                                                        })}
                                                    </ul>
                                                )}
                                            </div>
                                        </li>
                                        <li className="w-100 mb-0">
                                            <div className="text-center">
                                                <input type="checkbox" id="currentUserBuyer" onClick={()=>this.assignRoleToUser(this.state.user.id, 'buyer')} />
                                                <label htmlFor="currentUserBuyer"><Trans>&nbsp;Assign this role to me</Trans></label>
                                            </div>
                                        </li>

                                        <li className="w-100">
                                            <div className="text-center">
                                                <button className="btn btn-light-primary text-light" onClick={() => this.createUserPopup('1', 'Buyer')}>Create Buyer</button>
                                            </div>
                                        </li>

                                    </ul>
                                    <div className="text-center">
                                        <Button onClick={() => this.prevStep()} className="btn theme-btn px-4 mr-4"><i className="fa fa-arrow-left"></i> Previous</Button>
                                        <Button onClick={() => this.nextStep()} className="btn theme-btn px-4" disabled={invalid}>Next <i className="fa fa-arrow-right"></i></Button>
                                    </div>
                                </div>
                            )} />
                        </div>

                        <div className={this.state.current_step == 5 ? 'd-block' : 'd-none'} id="step-4">
                            <div className="dp-title">
                                <Trans>About the buying realtor</Trans>
                            </div>

                            <FieldGroup control={this.buyingRealtor} render={({ invalid, pristine, pending, meta }) => (
                                <div className="dp-content">
                                    <ul className="dp-input-list">
                                        <li className="w-100">
                                            <div className="dp-select-div w-50 mx-auto">
                                                <Select
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    defaultValue={this.state.buyingRealtors ? this.state.buyingRealtors[0]:null}
                                                    isDisabled={false}
                                                    isLoading={false}
                                                    isClearable={true}
                                                    isRtl={false}
                                                    isSearchable={true}
                                                    options={this.state.buyingRealtors}
                                                    onChange={(e)=>this.setUserDropdownValue(e.value, e.label, 'buyingRealtor')}
                                                />
                                            </div>

                                            {/* <div className="dp-select-div w-50 mx-auto">
                                                <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectBuyingRealtor')}  >
                                                    {this.buyingRealtor.get('buyingRealtor').value ? this.buyingRealtor.get('buyingRealtorHtml').value : <Trans>Select Buyer Realtor</Trans>}
                                                    <span className="dropdownicon">
                                                        <img src="../images/nl-down-icon-white.png" />
                                                    </span>
                                                </div>
                                                {(this.state.showdropdownliststate === 'SelectBuyingRealtor') && (
                                                    <ul className="dpselect-option-list">
                                                        {this.state.buyingRealtors.map((realtor, i) => {
                                                            return <li key={i} onClick={() => this.setUserDropdownValue(realtor.value, realtor.label, 'buyingRealtor')}>{realtor.label}</li>
                                                        })}
                                                    </ul>
                                                )}
                                            </div> */}
                                        </li>
                                        <li className="w-100 mb-0">
                                            <div className="text-center">
                                                <input type="checkbox" id="currentUserBuyingRealtor" onClick={()=>this.assignRoleToUser(this.state.user.id, 'buyingRealtor')} />
                                                <label htmlFor="currentUserBuyingRealtor"><Trans>&nbsp;Assign this role to me</Trans></label>
                                            </div>
                                        </li>

                                        <li className="w-100">
                                            <div className="text-center">
                                                <button className="btn btn-light-primary text-light" onClick={() => this.createUserPopup('2', 'Buyer Realtor')}>Create Buyer Realtor</button>
                                            </div>
                                        </li>


                                    </ul>
                                    <div className="text-center">
                                        <Button onClick={() => this.prevStep()} className="btn theme-btn px-4 mr-4"><i className="fa fa-arrow-left"></i> Previous</Button>
                                        <Button onClick={() => this.nextStep()} className="btn theme-btn px-4" disabled={invalid}>Next <i className="fa fa-arrow-right"></i></Button>
                                    </div>
                                </div>
                            )} />
                        </div>

                        <div className={this.state.current_step == 6 ? 'd-block' : 'd-none'} id="step-5">
                            <div className="dp-title">
                                <Trans>About the lender</Trans>
                            </div>
                            <FieldGroup control={this.lender} render={({ invalid, pristine, pending, meta }) => (
                                <div className="dp-content">
                                    <ul className="dp-input-list">
                                        <li className="w-100">
                                            <div className="dp-select-div w-50 mx-auto">
                                                <Select
                                                    className="basic-single"
                                                    classNamePrefix="select"
                                                    defaultValue={this.state.lenders ? this.state.lenders[0]:null}
                                                    isDisabled={false}
                                                    isLoading={false}
                                                    isClearable={true}
                                                    isRtl={false}
                                                    isSearchable={true}
                                                    options={this.state.lenders}
                                                    onChange={(e)=>this.setUserDropdownValue(e.value, e.label, 'lender')}
                                                />
                                            </div>

                                            {/* <div className="dp-select-div w-50 mx-auto">
                                                <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectLender')}  >
                                                    {this.lender.get('lender').value ? this.lender.get('lenderHtml').value : <Trans>Select Lender</Trans>}
                                                    <span className="dropdownicon">
                                                        <img src="../images/nl-down-icon-white.png" />
                                                    </span>
                                                </div>
                                                {(this.state.showdropdownliststate === 'SelectLender') && (
                                                    <ul className="dpselect-option-list">
                                                        {this.state.lenders.map((realtor, i) => {
                                                            return <li key={i} onClick={() => this.setUserDropdownValue(realtor.value, realtor.label, 'lender')}>{realtor.label}</li>
                                                        })}
                                                    </ul>
                                                )}
                                            </div> */}
                                        </li>
                                        <li className="w-100 mb-0">
                                            <div className="text-center">
                                                <input type="checkbox" id="currentUserLender" onClick={()=>this.assignRoleToUser(this.state.user.id, 'lender')} />
                                                <label htmlFor="currentUserLender"><Trans>&nbsp;Assign this role to me</Trans></label>
                                            </div>
                                        </li>

                                        <li className="w-100">
                                            <div className="text-center">
                                                <button className="btn btn-light-primary text-light" onClick={() => this.createUserPopup('3', 'Lender')}>Create Lender</button>
                                            </div>
                                        </li>


                                    </ul>
                                    <div className="text-center">
                                        <Button onClick={() => this.prevStep()} className="btn theme-btn px-4 mr-4"><i className="fa fa-arrow-left"></i> Previous</Button>
                                        <Button className="btn theme-btn px-4" disabled={invalid} onClick={()=>this.submitProperty()}>Submit</Button>
                                    </div>
                                </div>
                            )} />
                        </div>

                    </div>

                    {(this.state.showrealtorpopupstate == true) && (
                        <div className="add-realtor-popup-page">
                            <div className="arp-close-btn">
                                {(this.state.showconfirmpopupstate == false) && (
                                    <img src="../images/close-btn.svg" onClick={this.hidepopup} />
                                )}
                            </div>
                            <div className="add-realtor-popup">
                                <div className="arp-title"><Trans>Send Invitation</Trans></div>
                                <div className="arp-content">
                                    <ul className="arp-inputfld-list">
                                        {!this.state['invitationSent'] ?
                                            <li className="fullwidth arp-margin30">
                                                <TagsInput value={this.state['tags']} addKeys={[9, 13, 32, 186, 188]} onlyUnique addOnPaste addOnBlur inputProps={{ placeholder: this.state.inviteplaceholder }} validationRegex={EMAIL_VALIDATION_REGEX} pasteSplit={data => {
                                                    return data.replace(/[\r\n,;]/g, ' ').split(' ').map(d => d.trim())
                                                }} onChange={(event) => this.handleChange(event)} />
                                            </li> :
                                            <li><b><Trans>invitation sent successfully</Trans></b></li>
                                        }
                                    </ul>
                                    {!this.state['invitationLoader'] ?
                                        <div className="arp-btn-row">
                                            <span className="arp-submit-btn" onClick={(event) => this.sendInvitation(event, '')}><Trans>Submit</Trans></span>
                                        </div> :
                                        <button className="lib-login-btn" type="button" disabled>
                                            <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                            <span className="sr-only"><Trans>Loading...</Trans></span>
                                        </button>
                                    }
                                </div>
                                {(this.state.showconfirmpopupstate == true) && (
                                    <div className="arrp-confrim-popup-box">
                                        <div className="arp-confrim-popup">
                                            <div className="arpc-title"><Trans>Confirm Realtor Invite to Property Listing?</Trans>
                                            </div>
                                            <div className="arpc-button-box">
                                                <button className="arpc-yes-button"
                                                    onClick={this.showconfirmpopup}><Trans>Yes</Trans>
                                                </button>
                                                <button className="arpc-no-button" onClick={this.showconfirmpopup}>no
                                                </button>
                                            </div>
                                            <div className="arpc-note-box"><Trans>An invitation will be sent to the Realtor’s email if they do not exist on the Reverifi Network</Trans>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}


                    {(this.state.showCreateUserPopup == true) && (
                        <div className="add-realtor-popup-page">
                            <div className="arp-close-btn">
                                <img src="../images/close-btn.svg" onClick={() => this.hideCreateUserPopup()} />
                            </div>
                            <div className="add-realtor-popup">
                                <div className="arp-title"><Trans>Create {this.state.add_user_role}</Trans></div>
                                <div className="arp-content">
                                    <ul className="arp-inputfld-list">
                                        <FieldGroup control={this.signUPForm} render={({ invalid, pristine, pending, meta }) => (
                                            <div className="dp-content">
                                                <ul className="dp-input-list">
                                                    <li className="d-none">
                                                        <FieldControl name="role_id" render={TextInput}
                                                            meta={{ label: "User Role", id: "role_id", type: "text" }} />
                                                    </li>
                                                    <li className="pl-0 pr-0">
                                                        <FieldControl name="name" render={TextInput} meta={{ label: "Name" }} />
                                                    </li>
                                                    <li className="pl-3 pr-0">
                                                        <FieldControl name="last_name" render={TextInput} meta={{ label: "Last Name" }} />
                                                    </li>
                                                    <li className="pl-0 pr-0">
                                                        <FieldControl name="email" render={TextInput} meta={{ label: "Email" }} />
                                                    </li>
                                                    <li className="pl-3 pr-0">
                                                        <FieldControl name="mobile_number" render={TextInput} meta={{ label: "Phone number" }} />
                                                    </li>
                                                    <li className="pl-0 pr-0">
                                                         <FieldControl name="countyState"
                                                            render={SelectInput} meta={{
                                                                label: "State",
                                                                options: global['constStates']
                                                            }} />
                                                    </li>
                                                    <li className="pl-0 w-100">
                                                        <div className="sup-inputcheckfld-box w-100 mb-3">
                                                            <FieldControl name="i_represent" render={CheckBox} meta={{ label: "I confirm I represent this client", id: "i_represent" }}/>
                                                        </div>

                                                    </li>
                                                </ul>

                                            </div>
                                        )} />
                                    </ul>
                                    {!this.state['invitationLoader'] ?
                                        <div className="arp-btn-row">
                                            <span className="arp-submit-btn" onClick={() => this.createUser()}><Trans>Submit</Trans></span>
                                        </div> :
                                        <button className="lib-login-btn" type="button" disabled>
                                            <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                            <span className="sr-only"><Trans>Loading...</Trans></span>
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </React.Fragment>
        )

    }

}


export default AddPropertyToTransactionTable;