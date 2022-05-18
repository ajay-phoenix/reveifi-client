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
import {
    FormBuilder,
    AbstractControl,
    Validators,
    FieldGroup,
    FieldControl
} from "react-reactive-form";
import { Link } from "react-router-dom";
import { CardColumns } from "react-bootstrap";

import { Trans, useTranslation } from "react-i18next";
import $ from 'jquery';

export function MyComponent({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input className="dp-inputfld" type={`${meta.type}`} id={`Enter ${meta.id}`} placeholder={t(`Enter ${meta.label}`)} {...handler()} />
}


const role_id = CookieService.get('role_id');
const TextInput = ({ handler, touched, hasError, meta }: any) => (
    <>
        <MyComponent handler={handler} meta={meta} ></MyComponent>
        {/* <input className="dp-inputfld" type={`${meta.type}`} id={`Enter ${meta.id}`} placeholder={`Enter ${meta.label}`} {...handler()} /> */}
        <span className="help-block">
        <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
            <Trans>{hasError('pattern') && 'Price is not valid'}</Trans>
        </span>
    </>
);

const SelectInput = ({ handler, touched, hasError, meta }: any) => (
    <>
        <select className="dp-selectfld" {...handler()}>
            {meta.options.map((item, index) => (<option value={item.value}>{item.lable}</option>))}
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

let realtorsData = [];

class SubmitProperty extends Component<RouteComponentProps, any> {
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
            realtors: []
        };
        realtorsData = [];
        realtorsData.push({
            lable: role_id == 2 ? 'Select Client' : 'Select Realtor',
            value: 0
        });
    }

    async setRealtors(data) {
        var userIds = [];
        data.forEach((res, i) => {

            let obj = {
                lable: null,
                value: null
            };
            if (role_id == 2) {
                if (res.client.name && res.client.last_name && res.client.id) {
                    obj = {
                        lable: res.client.name + " " + res.client.last_name,
                        value: res.client.id
                    };
                }
            } else if (res && res.business_profiles) {
                if (res.name && res.last_name && res.id) {
                    obj = {
                        lable: res.name + " " + res.last_name,
                        value: res.id
                    };
                }
            }
            if (obj.value) {
                if (userIds.indexOf(obj.value.toString()) === -1) {
                    realtorsData.push(obj);
                }
                userIds.push(obj.value.toString())
            }

        });

        realtorsData.push({
            lable: role_id==2 ? 'Invite Seller' : 'Invite Realtor',
            value: -1
        });
        this.setState({ realtors: realtorsData })
    }

    async componentDidMount() {
        let realtor = [];

        if (role_id == 2) {
            this.setState({ inviteplaceholder: 'Add clients email' });
            realtor = await UserService.getClientList()
        }

        else {
            this.setState({ inviteplaceholder: 'Add realtors email' });
            realtor = await UserService.getUserActsList(2);
        }

        await this.setRealtors(realtor);
        const userProfile = await UserService.getCurrentUserProfile();
        this.setState({ user_role: userProfile.userProfile.role_id, businessProfile: userProfile.businessProfile });


    }


    validateNoRealtorListed = (AC: AbstractControl) => {
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
        realtor: ['', [Validators.required, this.validateNoRealtorListed]],
        realtorHtml: ['', [Validators.required, this.validateNoRealtorListed]],
        state: ['', [Validators.required]],
        city: ['', [Validators.required]],
        zipcode: ['', [Validators.required]],
        counties: ['', [Validators.required]],
        country: ['840', [Validators.required]],
        countryHtml: ['USA', [Validators.required]],
        media: [''],
        fileSource: ['', [Validators.required]],
        showdropdownlistValue: ['']

    });

    async prepareData() {
        if (this.property.get('realtor').value === '-1') {
            var realtor_id = this.state.realtorId !== '' ? this.state.realtorId : this.property.get('realtor').value;
        } else {
            var realtor_id = this.property.get('realtor').value;
        }

        let validAddress = true;
        const postData = this.property.value;
        // country is USA
        if (postData.country) {
            validAddress = await UserService.validateAddress(postData.address, postData.city, postData.state, postData.zipcode);
        }
        if (validAddress) {
            const formData = new FormData();
            formData.append('title', this.property.get('title').value);
            formData.append('mls_link', this.property.get('mls_link').value);
            formData.append('youtube_video', this.property.get('youtube_video').value);
            formData.append('price', this.property.get('price').value);
            formData.append('address', this.property.get('address').value);
            formData.append('state', this.property.get('state').value);
            formData.append('city', this.property.get('city').value);
            formData.append('realtor', realtor_id);
            formData.append('zipcode', this.property.get('zipcode').value);
            formData.append('counties', this.property.get('counties').value);
            formData.append('country', this.property.get('country').value);

            for(let i=0; i<this.property.get('fileSource').value.length; i++){
                formData.append('media[]', this.property.get('fileSource').value[i]);
            }
            
            return formData;
        } else {
            toast.error("Invalid Address!");
            this.setState({ loader: false });
            this.property.patchValue({ loader: false });
            return false;
        }
    }

    async handleFormSubmit(event: any) {
        event.preventDefault();
        this.setState({ loader: true });
        this.property.patchValue({ loader: true });
        const formData = await this.prepareData();
        if (formData) {
            const response = await UserService.submitProperty(formData);
            if (response) {
                toast.success("Your property is added successfully.", {
                    closeOnClick: true,
                    pauseOnHover: true,
                });
                this.props.history.push("/my-properties");
            } else {
                this.setState({ loader: false });
                this.property.patchValue({ loader: false });
            }
        }
    }

    onFileChange(event) {
        if (event.target.files && event.target.files.length) {
            const file = event.target.files;

            var images = [];
            var invalid_file_format = 0;
            for(let i=0; i<event.target.files.length; i++){
                var file_extension = event.target.files[i].name.split('.').pop();
                if(file_extension!=='jpg' && file_extension!=='jpeg' && file_extension!=='png' && file_extension!=='jiff' && file_extension!=='jfif' && file_extension!=='gif'){
                    invalid_file_format = 1;
                }
                images.push(event.target.files[i])
            }
            

            if(invalid_file_format===1){
                toast.error('File type is not allowed')
                this.property.patchValue({
                    fileSource: ''
                });
                $('#choosefile').val('')
            } else{
                this.property.patchValue({
                    fileSource: event.target.files
                });
            }

        }

    }


    handleChange(tags) {
        this.setState({ tags });
    }


    showModal() {
        // this.setState({ isOpen: true });
        this.setState({ tags: [] });
        this.setState({ showrealtorpopupstate: true })
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
        //console.log(data);
    }

    showconfirmpopup = () => {
        if (this.state.showconfirmpopupstate == true) {
            this.setState({ showconfirmpopupstate: false })
        } else {
            this.setState({ showconfirmpopupstate: true })
        }
    }
    hidepopuo = () => {
        this.setState({ showrealtorpopupstate: false })
    }

    showdropdownlist = (title) => {
        var dropdowntext = title;
        this.setState({ showdropdownliststate: dropdowntext });
        this.property.patchValue({ showdropdownlistValue: dropdowntext });
    }

    setCountryDropdownValue = (value, html) => {
        this.property.patchValue({ country: value });
        this.property.patchValue({ countryHtml: html });
        this.showdropdownlist("");
    }

    setRealtorDropdownValue = (value, html) => {
        this.property.patchValue({ realtor: value });
        this.property.patchValue({ realtorHtml: html });
        this.showdropdownlist("");
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
                                    <button type="button" className="close float-right"
                                        onClick={() => this.hideModal()}
                                        data-dismiss="modal">&times;</button>
                                </div>
                                <div className="modal-body">
                                    {

                                        !this.state['invitationSent']
                                            ?
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
                                                            onChange={(event) => this.handleChange(event)} />

                                                    </div>
                                                </div>
                                            </div>
                                            :
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
                                                <span
                                                    className="spinner-grow spinner-grow-sm"
                                                    role="status"
                                                    aria-hidden="true">
                                                </span>
                                                <span className="sr-only"><Trans>Loading...</Trans></span>
                                            </button>
                                        }
                                    </div>
                                    : null}
                            </div>
                        </div>
                    </Modal>
                    <h3><Trans>Submit Property</Trans></h3>
                    <div className="ndp-right-box">
                        {!this.state['businessProfile'] && this.state.user_role !== 1 ?
                            <div className="alert alert-warning alert_box" role="alert">  <Link to="/edit-profile"><Trans>Please complete your business profile</Trans></Link></div> : null
                        }
                    </div>
                    <div className="submit-property-box">

                        <div className="dp-title">
                            <Trans>Enter Applicable Property Details</Trans>
                        </div>
                        <FieldGroup control={this.property} render={({ invalid, pristine, pending, meta }) => (
                            <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                                <div className="dp-content">
                                    <ul className="dp-input-list">
                                        {/*<li>*/}
                                        {/*<FieldControl name="title" render={TextInput} meta={{*/}
                                        {/*required: "required",*/}
                                        {/*label: "title",*/}
                                        {/*id: "title",*/}
                                        {/*type: "text"*/}
                                        {/*}}/>*/}
                                        {/*</li>*/}
                                        <li>
                                            <div className="dp-select-div">

                                                <div className="dpselect-span-box" onClick={() => this.showdropdownlist('SelectRealtor')}  >
                                                    {this.property.get('realtor').value ? this.property.get('realtorHtml').value : <Trans>{role_id == 2 ? 'Select Client' : 'Select Realtor'}</Trans>}
                                                    <span className="dropdownicon">
                                                        <img src="../images/nl-down-icon-white.png" />
                                                    </span>
                                                </div>

                                                {(this.state.showdropdownliststate === 'SelectRealtor') && (
                                                    <ul className="dpselect-option-list">
                                                        {this.state.realtors.map((realtor, i) => {
                                                            return <li key={i} onClick={() => this.setRealtorDropdownValue(realtor.value, realtor.lable)}>{realtor.lable}</li>
                                                        })}
                                                        {/* <li onClick={() => this.setRealtorDropdownValue('Realtor Buyer')}>Realtor Buyer</li>
                                                        <li onClick={() => this.setRealtorDropdownValue('Realtor Seller')}>Realtor Seller</li>
                                                        <li onClick={() => this.setRealtorDropdownValue('Not Listed')}>Not Listed</li> */}
                                                    </ul>
                                                )}


                                                {/* <FieldControl name="realtor" render={SelectInput} meta={{
                                                    label: "Realtors",
                                                    id: "Realtors",
                                                    options: realtorsData
                                                }} />  */}

                                            </div>
                                        </li>
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
                                                {/* <FieldControl name="country" render={SelectInput} meta={{
                                                    label: "Country",
                                                    options: [{ lable: 'Select Country', value: '' }, { lable: 'USA', value: 840 }, { lable: 'UK', value: 826 }]
                                                }} /> */}
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
                                                    onChange={(event) => this.onFileChange(event)} type="file" multiple accept="image/*"/>
                                            </div>
                                        </li>

                                        <li className="submitbtn-list">
                                            {!this.state['loader'] ?
                                                <input type="submit" className="submitpropert-btn" disabled={invalid}></input> :
                                                <button type="submit" name="submit" disabled className="submitpropert-btn">
                                                    <span className="spinner-grow spinner-grow-sm" role="status"
                                                        aria-hidden="true"></span>
                                                    <span className="sr-only"><Trans>Loading...</Trans></span>
                                                </button>
                                            }
                                        </li>
                                    </ul>
                                </div>
                            </form>
                        )} />
                    </div>

                    {/*<div className="submit-property-footer">*/}
                    {/*<a>*/}
                    {/*<Trans>Cancel</Trans>*/}
                    {/*</a>*/}
                    {/*</div>*/}
                    {(this.state.showrealtorpopupstate == true) && (
                        <div className="add-realtor-popup-page">
                            <div className="arp-close-btn">
                                {(this.state.showconfirmpopupstate == false) && (
                                    <img src="../images/close-btn.svg" onClick={this.hidepopuo} />
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
                                                }}
                                                    onChange={(event) => this.handleChange(event)} />
                                            </li> :
                                            <li><b><Trans>invitation sent successfully</Trans></b></li>
                                        }
                                    </ul>
                                    {

                                        !this.state['invitationLoader']
                                            ?
                                            <div className="arp-btn-row">
                                                <span className="arp-submit-btn" onClick={(event) => this.sendInvitation(event, '')}><Trans>Submit</Trans></span>
                                            </div> :
                                            <button className="lib-login-btn" type="button" disabled>
                                                <span className="spinner-grow spinner-grow-sm" role="status"
                                                    aria-hidden="true"></span>
                                                <span className="sr-only"><Trans>Loading...</Trans></span>
                                            </button>}
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
                </section>
            </React.Fragment>
        )

    }

}


export default SubmitProperty;