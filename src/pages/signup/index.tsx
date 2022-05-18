import React, { Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { toast } from 'react-toastify';
import TopNav from "../../components/common/topnav";

import {
    FormBuilder,
    AbstractControl,
    Validators,
    FieldGroup,
    FieldControl
} from "react-reactive-form";

import "./_style.scss";

import SignupService from "../../services/SignupService";
import { Trans, useTranslation } from "react-i18next";
import $ from 'jquery';

export function MyComponent({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input className="form-control" id={meta.id} placeholder={t(`Enter ${meta.label}`)} {...handler()} />
}

export function MyComponent1({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input className="form-control" type="password" placeholder={t(`Enter ${meta.label}`)}  {...handler()} />
}


const TextInput = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <MyComponent handler={handler} meta={meta} ></MyComponent>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
            <Trans>{hasError('pattern') && 'Mobile is not valid'}</Trans>
        </span>
    </div>
);

const TextInputPassword = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <MyComponent1 handler={handler} meta={meta} ></MyComponent1>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{(touched && hasError('mismatch')) && "Passwords don’t match"}</Trans>
        </span>
    </div>
);


const SelectInput = ({ handler, touched, hasError, meta }: any) => (
    <>
        <select {...handler()}>
            {meta.options.map((item, index) => (
                <option value={item.value}>{item.label}</option>
            ))}
        </select>
        <span className="dropdownicon"><img src="../images/nl-down-icon-white.png" /></span>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('validateState') && 'Your state is not currently reVerified'}</Trans>
        </span>
    </>
);

class SignUp extends Component<RouteComponentProps, any> {
    constructor(props) {
        super(props);

        this.state = {
            loader: false,
            errorMsg: false,
            logintab: 2,
            selectedTab: false
        }
    }


    MatchPasswords(AC: AbstractControl) {
        let password = AC.get('password').value;
        let confirmPassword = AC.get('confirmPassword').value;
        if (password !== confirmPassword) {
            AC.get('confirmPassword').setErrors({ mismatch: true });
        } else {
            return null;
        }

    }

    validateState = (AC: AbstractControl) => {
        let val = AC.get('countyState').value;
        if (val) {
            if(val !== 'NJ' && val !== 'NY' && val!=='FL'){
                AC.get('countyState').setErrors({ validateState: true });
            } else{
                return null;
            }
        } else {
            return null;
        }
    };

    singnUPForm = FormBuilder.group({
        name: ['', [Validators.required]],
        last_name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        countyState: ['', [Validators.required]],
        /* mobile_number: ['', [Validators.required, Validators.pattern("^[0-9]*$")]], */
        mobile_number: ['', [Validators.required]],
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]],
        role_id: [1]
    }, {
        validators: [this.MatchPasswords, this.validateState],
    });

    setRole(role): void {
        this.singnUPForm.patchValue({ role_id: role });
        this.setState({ logintab: role, selectedTab: true })
    }

    async handleFormSubmit(event: any) {
        event.preventDefault();
        this.setState({ loader: true, errorMsg: false });
        this.singnUPForm.patchValue({ loader: true }); 

        const postData = this.singnUPForm.value;
        this.singnUPForm.value.mobile_number = this.singnUPForm.value.mobile_number.replace(/[^\d]/g, '');

        const response = await SignupService.signUpUser(postData);
        
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
            window.location.href = '/confirmation-email';
            
        }
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

        return (
            <React.Fragment>
                <TopNav></TopNav>
                <FieldGroup control={this.singnUPForm} render={({ invalid, pristine, pending, meta }) => (
                    <section className="loginsection" id="signuppage">
                        <div className="loginpage">
                            <div className="login-image">
                                <img src="/images/login.png" alt="" className="img-fluid"></img>
                            </div>
                            <div className="login-form">
                                <h1><Trans>Sign up</Trans></h1>
                                <div className="login-form-box">
                                    <h3><Trans>Choose account type</Trans></h3>
                                    <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                                        <ul className={!this.state.selectedTab ? 'login-account-type-list select-latl' : 'login-account-type-list'}>
                                            <li className={this.state.logintab === 2 && 'active'}>
                                                <a onClick={() => this.setRole(2)} data-toggle="pill" href="#home" id="0">
                                                    <i className="fa fa-home"></i>
                                                    <span><Trans>Realtor</Trans></span>
                                                </a>
                                            </li>
                                            <li className={this.state.logintab === 1 && 'active'}>
                                                <a onClick={() => this.setRole(1)} data-toggle="pill" href="#menu1" id="1">
                                                    <i className="fa fa-flag"></i>
                                                    <span><Trans>Seller / Buyer</Trans></span>
                                                </a>
                                            </li>
                                            <li className={this.state.logintab === 3 && 'active'}>
                                                <a onClick={() => this.setRole(3)} data-toggle="pill" href="#menu2" id="2">
                                                    <i className="fa fa-credit-card"></i>
                                                    <span><Trans>Lender</Trans></span>
                                                </a>
                                            </li>
                                        </ul>

                                        { this.state.selectedTab ? <>
                                            <div className="sup-input-fld-box">
                                                <div className="sup-inputtextfld-box">
                                                    <FieldControl name="name" render={TextInput} meta={{ label: "First name" }} />
                                                </div>
                                                <div className="sup-inputtextfld-box">
                                                    <FieldControl name="last_name" render={TextInput} meta={{ label: "Last name" }} />
                                                </div>
                                                <div className="sup-inputtextfld-box">
                                                    <FieldControl name="email" render={TextInput} meta={{ label: "Email" }} />
                                                </div>
                                                <div className="sup-inputtextfld-box">
                                                    <FieldControl name="mobile_number" render={TextInput} meta={{ label: "Phone number", id:"phoneNumber" }} />
                                                </div>
                                                <div className="sup-inputtextfld-box">
                                                    <FieldControl name="password" render={TextInputPassword} meta={{ label: "Password" }} />
                                                </div>
                                                <div className="sup-inputtextfld-box">
                                                    <FieldControl name="confirmPassword" render={TextInputPassword} meta={{ label: "Confirm Password" }} />
                                                </div>
                                                <div className="sup-inputtextfld-box">
                                                    <div className="">
                                                        <FieldControl name="countyState"
                                                            render={SelectInput} meta={{
                                                                label: "State",
                                                                options: global['constStates']
                                                            }} />
                                                    </div>
                                                </div>
                                            </div>
                                       
                                            <div className="row">
                                                <input type="hidden" name="id" id="role_id" />
                                            </div>
                                            <div className="row">
                                                {this.state['errorMsg'] ?
                                                    <div className="alert alert-danger" role="alert">
                                                        <Trans>The email account has already been used</Trans>
                                                    </div>
                                                    : null
                                                }
                                            </div>
                                            <div className="">
                                                {!this.state['loader'] ?
                                                    <button type="submit" className="lib-login-btn" disabled={invalid || pristine || pending}><Trans>Register</Trans></button>
                                                    :
                                                    <button className="lib-login-btn" type="button" disabled>
                                                        <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                                        <span className="sr-only"><Trans>Loading...</Trans></span>
                                                    </button>
                                                }
                                                {/*{this.state['errorMsg'] ? <div className="alert alert-danger" role="alert"><Trans>Email or Password incorrect...!</Trans></div> : null}*/}
                                            </div>
                                        </> : null }
                                        <div className="lib-forget-signup-row">
                                            <span>
                                                <Trans>Already have an account?</Trans>
                                                <Link to="/login" className="signUp"> <Trans>Sign in</Trans> </Link>
                                            </span>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                )} />
            </React.Fragment>
        );
    }
}

export default SignUp;
