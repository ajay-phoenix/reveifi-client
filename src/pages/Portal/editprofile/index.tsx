import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";

import { AdminTopNav, SideBar } from "../../../components/common/imports/navigations";
import { UserService, CookieService } from "../../../services/imports/index";

import { toast } from 'react-toastify';
import {
    FormBuilder,
    AbstractControl,
    Validators,
    FieldGroup,
    FieldControl
} from "react-reactive-form";

import { Trans, useTranslation } from "react-i18next";
import "./_style.scss";
import defaultProfileImage from "../../../assets/images/defaultImage.png";
import $ from 'jquery';

let userAvatarFile = null;
const setUserAvatar = (file) => {
    userAvatarFile = file;
    if (userAvatarFile) {
        const reader = new FileReader();
        reader.readAsDataURL(userAvatarFile);
        reader.onload = (event) => { document.getElementById('avatar').setAttribute('src', (event.target.result).toString()); }
    }
    else { document.getElementById('avatar').setAttribute('src', defaultProfileImage); }
}

export function MyComponent({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input className="lib-inputtextfld" type="text" id={meta.id} placeholder={t(`Enter ${meta.label}`)} {...handler()} />
}
export function MyComponent1({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input className="lib-inputtextfld" type="password" placeholder={t(`Enter ${meta.label}`)} {...handler()} />
}
export function MyComponent2({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input className="lib-inputtextfld" type="password" placeholder={t(`Enter ${meta.label}`)} {...handler()} />
}


const TextInput = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <MyComponent handler={handler} meta={meta} ></MyComponent>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </div>
);

const TextArea = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <textarea className="lib-inputtextfld h-auto" placeholder={meta.label} {...handler()}></textarea>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
        </span>
    </div>
);
const ImageInput = ({ handler, touched, hasError, meta }: any) => (
    <label className="imageInput">
        <img id="avatar" className="user-avatar" src={defaultProfileImage} alt="Avatar" />
        <label>
            <span className="profileImageUpload"><Trans>upload profile image</Trans></span>
            <input id="avatar_input" className="lib-inputtextfld" accept="image/*" type="file" {...handler()} onChange={(e) => { const file = e.target.files[0]; setUserAvatar(file); }} />
        </label>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
        </span>
    </label>
);
const NumberInput = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <input className="lib-inputtextfld" type="number" placeholder={`Enter ${meta.label}`} {...handler()} />
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </div>
);

const TextInputPassword = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <MyComponent2 handler={handler} meta={meta} ></MyComponent2>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{(touched && hasError('mismatch')) && "Password don't Match!"}</Trans>
        </span>
    </div>
);

const SelectInput = ({ handler, touched, hasError, meta }: any) => (
    <>
        <select {...handler()}>
            {meta.options.map((item, index) => (<option key={index} value={item.value}>{item.label}</option>))}
        </select>
        <span className="dropdownicon">
            <img src="../images/nl-down-icon-white.png" />
        </span>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>

    </>
);
const role_id = CookieService.get('role_id');


class EditProfile extends Component<RouteComponentProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            userBus: {},
            loader: false,
            loading: 'true',
            success: 'false',
            busSuccess: 'false',
            invalidAddress: 'false',
            enablealloweditstate: true,
            editdetailsstate: "Personal Details"
        };
        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }

    singnUPForm = FormBuilder.group({
        name: ['', [Validators.required]],
        last_name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        mobile_number: ['', [Validators.required]],
        /* mobile_number: ['', [Validators.required, Validators.pattern("^[0-9]*$")]], */
        address: [''],
        address_line_2: [''],
        country: [''],
        state: [''],
        city: [''],
        linkedin_profile_link: [''],
        instagram_profile_link: [''],
        facebook_profile_link: [''],
        tiktok_profile_link: [''],
        about: [''],
        areas_of_service: [''],
        zip: [''],
    });

    businessForm = FormBuilder.group({
        title: ['', [Validators.required]],
        office_name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        address: ['', [Validators.required]],
        address_line_2: [''],
        country: [''],
        state: ['', [Validators.required]],
        nmls: [''],
        license: [''],
        city: ['', [Validators.required]],
        zip: ['', [Validators.required]],
        role_id: role_id

    });

    resetPasswordForm = FormBuilder.group({
        old_password: ['', [Validators.required]],
        new_password: ['', [Validators.required]],
        confirm_password: ['', [Validators.required]],
    }, {
        validators: [this.MatchPasswords],
    });

    async componentDidMount() {

        document.body.classList.add('disable-sidebar');
        const response = await UserService.getCurrentUserProfile();
        const userData = response && response['userProfile'] || null;
        let businessData = response && response['businessProfile'] || null;
        // businessData = businessData[0];
        document.getElementById('avatar').setAttribute('src', userData.avatar || defaultProfileImage);
        this.setState({ user: userData, userBus: businessData, loading: 'false' });
        this.singnUPForm.controls['name'].setValue(userData.name || '');
        this.singnUPForm.controls['last_name'].setValue(userData.last_name || '');
        this.singnUPForm.controls['email'].setValue(userData.email || '');
        this.singnUPForm.controls['mobile_number'].setValue(this.formatMobileNumber(userData.mobile_number) || '');
        this.singnUPForm.controls['country'].setValue(userData.country || '');
        this.singnUPForm.controls['address'].setValue(userData.address || '');
        this.singnUPForm.controls['address_line_2'].setValue(userData.address_line_2 || '');
        this.singnUPForm.controls['state'].setValue(userData.state || '');
        this.singnUPForm.controls['city'].setValue(userData.city || '');
        this.singnUPForm.controls['zip'].setValue(userData.zip || '');
        this.singnUPForm.controls['linkedin_profile_link'].setValue(userData.linkedin_profile_link || '');
        this.singnUPForm.controls['instagram_profile_link'].setValue(userData.instagram_profile_link || '');
        this.singnUPForm.controls['facebook_profile_link'].setValue(userData.facebook_profile_link || '');
        this.singnUPForm.controls['tiktok_profile_link'].setValue(userData.tiktok_profile_link || '');
        this.singnUPForm.controls['about'].setValue(userData.about || '');
        this.singnUPForm.controls['areas_of_service'].setValue(userData.areas_of_service || '');
        this.businessForm.controls['email'].setValue(userData.email || '');

        if (userData && userData.address !== null) {
            document.body.classList.remove('disable-sidebar');
            //this.props.history.push("/dashboard");
        }

        if (businessData) {
            this.businessForm.controls['title'].setValue(businessData.title || '');
            this.businessForm.controls['office_name'].setValue(businessData.office_name || '');
            // this.businessForm.controls['email'].setValue(response['userProfile'].email);
            this.businessForm.controls['country'].setValue(businessData.country || '');
            this.businessForm.controls['address'].setValue(businessData.address || '');
            this.businessForm.controls['address_line_2'].setValue(businessData.address_line_2 || '');
            this.businessForm.controls['state'].setValue(businessData.state || '');
            this.businessForm.controls['city'].setValue(businessData.city || '');
            this.businessForm.controls['zip'].setValue(businessData.zip || '');
            if (global['lenderRole'] == role_id) {
                this.businessForm.controls['nmls'].setValue(businessData.nmls || '');
            }
            if (global['realtorRole'] == role_id) {
                this.businessForm.controls['license'].setValue(businessData.license || '');
            }
        }
    }

    formatMobileNumber(number){
        var formatted = number.replace(/(\d{1,2})(\d{1})?(\d{1,3})?(\d{1,4})?/, function(_, p1, p2, p3, p4){
            let output = ""
            if (p1) output = `(${p1}`;
            if (p2) output += `${p2})`;
            if (p3) output += ` ${p3}`
            if (p4) output += `-${p4}`
            return output;
        });
        return formatted;
    }

    MatchPasswords(AC: AbstractControl) {
        let password = AC.get('new_password').value;
        let confirmPassword = AC.get('confirm_password').value;
        if (password === "" && confirmPassword === "") {
            AC.get('confirm_password').setErrors(null);
        } else if (password !== confirmPassword) {
            AC.get('confirm_password').setErrors({ mismatch: true });
        } else {
            return null;
        }
    }

    async handleFormSubmit(event: any) {
        event.preventDefault();
        this.setState({ loader: true });
        this.singnUPForm.patchValue({ loader: true });
        const formData = new FormData();
        const postData = this.singnUPForm.value;
        var invalid_files = 0;
        postData && Object.keys(postData).forEach((key) => {
            if (key === 'avatar' && userAvatarFile !== null) {
                var file_extension = userAvatarFile.name.split('.').pop();
                if(file_extension!=='jpg' && file_extension!=='jpeg' && file_extension!=='png' && file_extension!=='jiff' && file_extension!=='jfif' && file_extension!=='gif'){
                    invalid_files = 1;
                }
                formData.append(key, userAvatarFile || null);
            } else if(key==='mobile_number'){
                formData.append(key, postData[key].replace(/[^\d]/g, ''))
            } else{
                formData.append(key, postData[key])
            }
        })

        userAvatarFile = null;
        let validAddress = true;
        // country is USA
        if (postData.country) {
            if (postData.address) {
                validAddress = await UserService.validateAddress(postData.address, postData.city, postData.state, postData.zip);
            }
        }

        if (validAddress && invalid_files!==1) {
            document.body.classList.remove('disable-sidebar');
            const response = await UserService.updateUser(formData);
            if (response) {
                this.setState({ loader: false });
                this.singnUPForm.patchValue({ loader: false });
                this.setState({ success: 'true' });
                toast.success('Profile updated Successfully');
            } else {
                this.setState({ loader: false });
                this.singnUPForm.patchValue({ loader: false });
                toast.error("Some thing went wrong please try again.");
            }
        } else if(invalid_files===1){
            toast.error('File type is not allowed')
            this.setState({ loader: false });
            this.singnUPForm.patchValue({ loader: false });
            this.setState({ invalidAddress: 'true' });
        } else{
            toast.error("Invalid Address!");
            this.setState({ loader: false });
            this.singnUPForm.patchValue({ loader: false });
            this.setState({ invalidAddress: 'true' });
        }
    }

    async handleBusinessFormSubmit(event: any) {
        event.preventDefault();
        this.setState({ loader: true });
        this.businessForm.patchValue({ loader: true });
        const postData = this.businessForm.value;
        let validAddress = true;
        // country is USA
        if (postData.country) {
            validAddress = await UserService.validateAddress(postData.address, postData.city, postData.state, postData.zip);
        }

        if (validAddress) {
            const response = await UserService.updateBusinessProfile(postData);
            if (response) {
                this.setState({ loader: false });
                this.businessForm.patchValue({ loader: false });
                this.setState({ busSuccess: 'true' });
                toast.success('Business Profile updated Successfully');
            } else {
                this.setState({ loader: false });
                this.businessForm.patchValue({ loader: false });
            }
        } else {
            toast.error("Invalid Address!");
            this.setState({ loader: false });
            this.businessForm.patchValue({ loader: false });
            this.setState({ invalidAddress: 'true' });
        }
    }

    async handleResetPasswordFormSubmit(event: any) {
        event.preventDefault();
        this.setState({ loader: true });
        const postData = this.resetPasswordForm.value;

        const response = await UserService.resetPassword(postData);
        if (response && response.status === 'success') {
            this.setState({ loader: false });
            toast.success(response.message || 'Password updated Successfully');
            this.resetPasswordForm.reset();
        } else {
            toast.error(response.message || 'Failed to update password.');
            this.setState({ loader: false });
        }
    }

    public enableallowedit = async () => {
        this.setState({ enablealloweditstate: true })
    }

    editpersonal = async () => {
        await this.setState({ editdetailsstate: "Personal Details" })
    }

    editcompany = async () => {
        await this.setState({ editdetailsstate: "Company Details" })
    }

    resetpassword = async () => {
        await this.setState({ editdetailsstate: "Reset Password" })
    }


    render() {
        setTimeout(function(){
            $('#phoneNumber').keyup(function(e){
                var ph = this.value.replace(/\D/g,'').substring(0,10);
                // Backspace and Delete keys
                var deleteKey = (e.keyCode == 8 || e.keyCode == 46);
                var len = ph.length;
                if(len==0){
                    ph=ph;
                }else if(len<3){
                    ph='('+ph;
                }else if(len==3){
                    ph = '('+ph + (deleteKey ? '' : ') ');
                }else if(len<6){
                    ph='('+ph.substring(0,3)+') '+ph.substring(3,6);
                }else if(len==6){
                    ph='('+ph.substring(0,3)+') '+ph.substring(3,6)+ (deleteKey ? '' : '-');
                }else{
                    ph='('+ph.substring(0,3)+') '+ph.substring(3,6)+'-'+ph.substring(6,10);
                }
                this.value = ph;
            });
        }, 10)

        console.log(this.state)

        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>

                <section className="edit-profile-section ">
                    <div className="edit-profile-page">
                        <div className="edit-profile-image">
                            <img src="/images/editprofile.png" alt="" />
                        </div>
                        <div className="edit-profile-form">

                            <div className={`epb-edit-btn-title ${this.state.enablealloweditstate ? "" : "disbledcss"}`}>
                                <h1><Trans>Edit Profile</Trans></h1>
                                <span onClick={this.enableallowedit} id="hideonclick" className="epb-edit-btn epb-edit-btn-res">
                                    <Trans>Edit</Trans>
                                </span>
                            </div>

                            {!this.state.userBus?.title && this.state.loading==='false' ?
                                <div className="alert alert-warning w-100 text-center" role="alert"><Trans>You need to complete your business profile</Trans></div>
                            : null }
                            
                            {
                                (this.state['invalidAddress'] === 'true')
                                    ?
                                    <div className="alert-group">
                                        <div className="alert alert-error alert-dismissable">
                                            <button type="button" className="close" data-dismiss="alert"
                                                aria-hidden="true">×
                                            </button>
                                            <strong><Trans>Address is invalid</Trans></strong>
                                        </div>
                                    </div> : null}
                            <div className={`edit-profile-form-box ${this.state.enablealloweditstate ? "" : "disbledcss"}`}>
                                <ul className="epfb-tab-title-list">
                                    <li className={` ${this.state.editdetailsstate == "Personal Details" ? "active" : ""}`} onClick={this.editpersonal} >
                                        <Trans>Edit Personal Details</Trans>
                                    </li>
                                    {
                                        global['lenderRole'] == role_id || global['realtorRole'] == role_id ? (
                                            <li className={` ${this.state.editdetailsstate == "Company Details" ? "active" : ""}`} onClick={this.editcompany} >
                                                <Trans>Edit Company Details</Trans>
                                            </li>
                                        ) : ''}
                                    <li className={` ${this.state.editdetailsstate == "Reset Password" ? "active" : ""}`} onClick={this.resetpassword} >
                                        <Trans>Reset Password</Trans>
                                    </li>
                                </ul>
                                <div className="epfb-tab-content-box">
                                    <span onClick={this.enableallowedit} id="hideonclick" className="epb-edit-btn epb-edit-btn-nonres">
                                        <Trans>Edit</Trans>
                                    </span>
                                    <ul className="epfb-tab-content">
                                        <li>
                                            <div className={` ${this.state.editdetailsstate == "Personal Details" ? "epfb-res-title-box active" : "epfb-res-title-box"}`} onClick={this.editpersonal}>
                                                <Trans>Edit Personal Details</Trans>
                                            </div>
                                            <div className={` ${this.state.editdetailsstate == "Personal Details" ? "epfb-tab-content-input-box active" : "epfb-tab-content-input-box"}`}>
                                                <h3>
                                                    <Trans>Edit Personal Details</Trans>
                                                </h3>
                                                {/* <h4><Link to={'/forgot-password'}><Trans>Change Password</Trans></Link></h4> */}
                                                <div className="edit-personal-details-box">

                                                    <FieldGroup control={this.singnUPForm}

                                                        render={({ invalid, pristine, pending, meta }) => (
                                                            <form noValidate
                                                                onSubmit={(event) => this.handleFormSubmit(event)}>
                                                                <ul className="epf-inputfld-list">
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>First Name</Trans></div>
                                                                        <FieldControl name="name" render={TextInput}
                                                                            meta={{ label: "First Name" }} />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>Last Name</Trans></div>
                                                                        <FieldControl name="last_name" render={TextInput}
                                                                            meta={{ label: "Last Name" }} />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>Email</Trans></div>
                                                                        <FieldControl
                                                                            name="email"
                                                                            render={TextInput}
                                                                            meta={{ label: "Email" }}
                                                                        />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>Number</Trans></div>
                                                                        <FieldControl name="mobile_number"
                                                                            render={TextInput}
                                                                            meta={{ label: "Phone", id: "phoneNumber" }} />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>Address</Trans></div>
                                                                        <FieldControl
                                                                            name="address"
                                                                            render={TextInput}
                                                                            meta={{ label: "Address" }}
                                                                        />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>Address Line 2</Trans></div>
                                                                        <FieldControl
                                                                            name="address_line_2"
                                                                            render={TextInput}
                                                                            meta={{ label: "Address Line 2" }}
                                                                        />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>City</Trans></div>
                                                                        <FieldControl name="city" render={TextInput}
                                                                            meta={{ label: "Enter City" }} />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>Zip Code</Trans></div>
                                                                        <FieldControl name="zip" render={TextInput}
                                                                            meta={{ label: "Zip Code" }} />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>State</Trans></div>
                                                                        <div className="epf-select-div">
                                                                            <FieldControl name="state"
                                                                                render={SelectInput} meta={{
                                                                                    label: "State",
                                                                                    options: global['constStates']
                                                                                }} />
                                                                        </div>
                                                                        <input type="hidden" name="country" value="840" />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>Linkedin Profile Link</Trans></div>
                                                                        <FieldControl name="linkedin_profile_link" render={TextInput}
                                                                            meta={{ label: "Linkedin Profile Link" }} />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>Instagram Profile Link</Trans></div>
                                                                        <FieldControl name="instagram_profile_link" render={TextInput}
                                                                            meta={{ label: "Instagram Profile Link" }} />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>Facebook Profile Link</Trans></div>
                                                                        <FieldControl name="facebook_profile_link" render={TextInput}
                                                                            meta={{ label: "Facebook Profile Link" }} />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>Tiktok Profile Link</Trans></div>
                                                                        <FieldControl name="tiktok_profile_link" render={TextInput}
                                                                            meta={{ label: "Tiktok Profile Link" }} />
                                                                    </li>
                                                                    <li />
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>About</Trans></div>
                                                                        <FieldControl name="about" render={TextArea}
                                                                            meta={{ label: "This is where a future bio or some info can go" }} />
                                                                    </li>
                                                                    <li>
                                                                        <div className='epf-inputlabel'><Trans>Areas of service</Trans></div>
                                                                        <FieldControl name="areas_of_service" render={TextArea}
                                                                            meta={{ label: "This is where a future bio or some info can go" }} />
                                                                    </li>
                                                                    <li className="margin-bottom-0">
                                                                        <div className='epf-inputlabel'><Trans>Avatar</Trans></div>
                                                                        <div className="epf-select-div">
                                                                            <FieldControl name="avatar"
                                                                                render={ImageInput}
                                                                                meta={{
                                                                                    label: "Avatar"
                                                                                }} />
                                                                        </div>
                                                                    </li>
                                                                </ul>
                                                                <div className="edit-profile-btn-row" id="hidebeforeclick">
                                                                    {
                                                                        !this.state['loader']
                                                                            ?
                                                                            <button disabled={invalid} className="epb-button">
                                                                                <Trans>Submit</Trans>
                                                                            </button>
                                                                            :
                                                                            <button disabled className="epb-button">
                                                                                <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                                                                <span className="sr-only"><Trans>Loading...</Trans></span>
                                                                            </button>
                                                                    }
                                                                </div>

                                                            </form>
                                                        )} />

                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            {
                                                global['lenderRole'] == role_id || global['realtorRole'] == role_id ? (
                                                    <div className={` ${this.state.editdetailsstate == "Company Details" ? "epfb-res-title-box active" : "epfb-res-title-box"}`} onClick={this.editcompany}>
                                                        <Trans>Edit Company Details</Trans>
                                                    </div>) : ''}
                                            <div className={` ${this.state.editdetailsstate == "Company Details" ? "epfb-tab-content-input-box active" : "epfb-tab-content-input-box"}`}>
                                                {
                                                    global['lenderRole'] == role_id || global['realtorRole'] == role_id ? (
                                                        <>
                                                            <h3>
                                                                <Trans>Edit Company Details</Trans>

                                                            </h3>
                                                            <div className="edit-company-details-box">
                                                                <FieldGroup
                                                                    control={this.businessForm}
                                                                    render={({ invalid, pristine, pending, meta }) => (
                                                                        <form noValidate
                                                                            onSubmit={(event) => this.handleBusinessFormSubmit(event)}>
                                                                            <ul className="epf-inputfld-list">
                                                                                <li className="width100">
                                                                                    <div className='epf-inputlabel'><Trans>Title</Trans></div>
                                                                                    <FieldControl
                                                                                        name="title"
                                                                                        render={TextInput}
                                                                                        meta={{ label: "Company Title" }}
                                                                                    />
                                                                                </li>
                                                                                <li className="width100">
                                                                                    <div className='epf-inputlabel'><Trans>Office Name</Trans></div>
                                                                                    <FieldControl
                                                                                        name="office_name"
                                                                                        render={TextInput}
                                                                                        meta={{ label: "Company Name" }}
                                                                                    />
                                                                                </li>
                                                                                {/*<li className="width60">*/}
                                                                                {/*<div className='epf-inputlabel'><Trans>Email</Trans></div>*/}
                                                                                {/*<FieldControl*/}
                                                                                {/*name="email"*/}
                                                                                {/*render={TextInput}*/}
                                                                                {/*meta={{ label: "Email" }}*/}
                                                                                {/*/>*/}
                                                                                {/*</li>*/}
                                                                                {
                                                                                    global['lenderRole'] == role_id ?
                                                                                        <li className="width100">
                                                                                            <div className='epf-inputlabel'><Trans>Number</Trans></div>
                                                                                            <FieldControl
                                                                                                name="nmls"
                                                                                                render={NumberInput}
                                                                                                meta={{ label: "N M L S" }}
                                                                                            />
                                                                                        </li> : null
                                                                                }

                                                                                {
                                                                                    global['realtorRole'] == role_id ?
                                                                                        <li className="width100">
                                                                                            <div className='epf-inputlabel'><Trans>License</Trans></div>
                                                                                            <FieldControl
                                                                                                name="license"
                                                                                                render={NumberInput}
                                                                                                meta={{ label: "License" }}
                                                                                            />
                                                                                        </li> : null
                                                                                }

                                                                                <li className="width60">
                                                                                    <div className='epf-inputlabel'><Trans>Address</Trans></div>
                                                                                    <FieldControl
                                                                                        name="address"
                                                                                        render={TextInput}
                                                                                        meta={{ label: "Address" }}
                                                                                    />
                                                                                </li>

                                                                                <li className="width40">
                                                                                    <div className='epf-inputlabel'><Trans>Address Line 2</Trans></div>
                                                                                    <FieldControl
                                                                                        name="address_line_2"
                                                                                        render={TextInput}
                                                                                        meta={{ label: "Address Line 2" }}
                                                                                    />
                                                                                </li>

                                                                                <li className="width40">
                                                                                    <div className='epf-inputlabel'><Trans>City Name</Trans></div>
                                                                                    <FieldControl
                                                                                        name="city"
                                                                                        render={TextInput}
                                                                                        meta={{ label: "City" }}
                                                                                    />
                                                                                </li>
                                                                                <li className="width60">
                                                                                    <div className='epf-inputlabel'><Trans>Zip Code</Trans></div>
                                                                                    <FieldControl
                                                                                        name="zip"
                                                                                        render={TextInput}
                                                                                        meta={{ label: "Zip Code" }}
                                                                                    />
                                                                                </li>
                                                                                <li className="width40">
                                                                                    <div className='epf-inputlabel'><Trans>State</Trans></div>
                                                                                    <div className="epf-select-div">
                                                                                        <FieldControl name="state"
                                                                                            render={SelectInput} meta={{
                                                                                                label: "State",
                                                                                                options: global['constStates']
                                                                                            }} />
                                                                                    </div>
                                                                                </li>

                                                                                <li>
                                                                                    <input type="hidden" name="country" value="840" />
                                                                                </li>

                                                                            </ul>
                                                                            <div className="edit-profile-btn-row" id="hidebeforeclick">
                                                                                {
                                                                                    !this.state['loader']
                                                                                        ?
                                                                                        <button disabled={invalid}
                                                                                            className="epb-button">
                                                                                            <Trans>Submit</Trans></button>
                                                                                        :
                                                                                        <button disabled className="epb-button">
                                                                                            <span
                                                                                                className="spinner-grow spinner-grow-sm"
                                                                                                role="status"
                                                                                                aria-hidden="true">
                                                                                            </span>
                                                                                            <span className="sr-only">
                                                                                                <Trans>Loading...</Trans>
                                                                                            </span>
                                                                                        </button>
                                                                                }
                                                                            </div>
                                                                        </form>
                                                                    )} />
                                                            </div>
                                                        </>
                                                    ) : ''}
                                            </div>
                                        </li>
                                        {this.state.editdetailsstate === "Reset Password" && <li>
                                            <div className={` ${this.state.editdetailsstate === "Reset Password" ? "epfb-res-title-box active" : "epfb-res-title-box"}`} onClick={this.resetpassword}>
                                                <Trans>Change Password</Trans>
                                            </div>
                                            <div className={` ${this.state.editdetailsstate === "Reset Password" ? "epfb-tab-content-input-box active" : "epfb-tab-content-input-box"}`}>
                                                <h3><Trans>Change Password</Trans>
                                                </h3>
                                            </div>
                                            <div className="edit-personal-details-box">
                                                <FieldGroup control={this.resetPasswordForm} render={({ invalid, pristine, pending, meta }) => (
                                                    <form id="resetPasswordForm" noValidate onSubmit={(event) => this.handleResetPasswordFormSubmit(event)}>
                                                        <div className="sup-input-fld-box">
                                                            <div className="sup-inputtextfld-box100">
                                                                <div className='epf-inputlabel'><Trans>Current Password</Trans></div>
                                                                <FieldControl name="old_password" render={TextInputPassword} meta={{ label: "Current Password" }} />
                                                            </div>
                                                            <div className="sup-inputtextfld-box100">
                                                                <div className='epf-inputlabel'><Trans>New Password</Trans></div>
                                                                <FieldControl name="new_password" render={TextInputPassword} meta={{ label: "Password" }} />
                                                            </div>
                                                            <div className="sup-inputtextfld-box100">
                                                                <div className='epf-inputlabel'><Trans>Confirm Password</Trans></div>
                                                                <FieldControl name="confirm_password" render={TextInputPassword} meta={{ label: "Confirm Password" }} />
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            {this.state['errorMsg'] ?
                                                                <div className="alert alert-danger" role="alert">
                                                                    <Trans>{this.state['errorMsg']}</Trans>
                                                                </div>
                                                                : null
                                                            }
                                                        </div>
                                                        <div className="">
                                                            {!this.state['loader'] ?
                                                                <button type="submit" className="lib-login-btn" disabled={invalid || pristine || pending}><Trans>Submit</Trans></button>
                                                                :
                                                                <button className="lib-login-btn" type="button" disabled>
                                                                    <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                                                    <span className="sr-only"><Trans>Loading...</Trans></span>
                                                                </button>
                                                            }
                                                            {/*{this.state['errorMsg'] ? <div className="alert alert-danger" role="alert"><Trans>Email or Password incorrect...!</Trans></div> : null}*/}
                                                        </div>
                                                    </form>
                                                )} />
                                            </div>
                                        </li>}
                                    </ul>
                                </div>

                                {/* <span onClick={this.enableallowedit} id="hideonclick" className="epb-button">
                                    <Trans>Edit</Trans>
                                </span> */}

                            </div>
                        </div>
                    </div>
                </section>
            </React.Fragment >
        )

    }

}


export default EditProfile;