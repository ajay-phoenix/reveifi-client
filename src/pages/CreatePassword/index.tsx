import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FormBuilder, FieldGroup, FieldControl, Validators, AbstractControl } from "react-reactive-form";

import TopNav from "../../components/common/topnav";
import AuthService from "./../../services/AuthService";
import UserService from "../../services/UserService";
import { Trans, useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import TextInput from '../../components/common/inputs/inputText';

export function MyComponent1({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input className="form-control" type="password" placeholder={t(`Enter ${meta.label}`)}  {...handler()} />
}

const TextInputPassword = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <MyComponent1 handler={handler} meta={meta} ></MyComponent1>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{(touched && hasError('mismatch')) && "Passwords don’t match"}</Trans>
        </span>
    </div>
);

class CreatePassword extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loader: '',
            errorMsg: ''
        }
    }
    
    async componentDidMount() {
        var token = window.location.href
        .split(';')[0]
        .split('verify_token=')[1];

        if (token) {

            var response = await UserService.verifyEmailAddress({ verify_token: token })            
            if (response.status === 'success') {
                var user_info = await UserService.getUserInfoByRememberToken(token);
                this.form.patchValue({ user_id: user_info.id });
                
                toast.success(response.message, {
                    closeOnClick: true,
                    pauseOnHover: true,
                });

                
            } else {
                var message = response.message;
                if (message === 'Verification link  invalid') {
                    message = 'Verification code not recognized';
                } else{
                    var user_info = await UserService.getUserInfoByRememberToken(token);
                    this.form.patchValue({ user_id: user_info.id });
                }
                toast.error(message, {
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            }

        }
    }


    MatchPasswords(AC: AbstractControl) {
        let password = AC.get('password').value;
        let confirmPassword = AC.get('confirm_password').value;
        if (password !== confirmPassword) {
            AC.get('confirm_password').setErrors({ mismatch: true });
        } else {
            return null;
        }

    }

    form = FormBuilder.group({
        password: ['', [Validators.required]],
        confirm_password: ['', [Validators.required]],

    }, {
        validators: [this.MatchPasswords],
    });

    async handleFormSubmit(event: any) {
        event.preventDefault();
        this.setState({ loader: true, errorMsg: false });
        this.form.patchValue({ loader: true });
        
        
        const postData = {
            user_id: this.form.value.user_id,
            password: this.form.value.password,
            confirm_password: this.form.value.confirm_password
        };

        const response = await UserService.createPassword(postData);
        console.log(response);
        if (response.success == true) {
            alert(response.message);
            window.location.href='/login';
        }
        else {
            alert(response.message);
            this.setState({ loader: false, errorMsg: true });
            this.form.patchValue({ loader: true, errorMsg: true })
        }
    }

    render() {
        return (
            <>
                <TopNav />
                <FieldGroup control={this.form} render={({ invalid, pristine, pending, meta }) => (
                    <section className="loginsection" id="loginpage">
                        <div className="loginpage">
                            <div className="login-image">
                                <img src="/images/login.png" alt="" className="img-fluid"></img>
                            </div>
                            <div className="login-form">
                                <h1><Trans>Create Password</Trans></h1>
                                <div className="login-form-box">
                                    <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                                        <div className="input-fld-box">
                                            <div className="d-none">
                                                <FieldControl name='user_id' render={TextInput} meta={{ label: 'user_id', id: 'user_id', type: 'user_id' }}/>
                                            </div>

                                            <div className="lib-inputtextfld-box">
                                                <FieldControl name="password" render={TextInputPassword} meta={{ label: "Password", id: "password", type: "password" }} />
                                            </div>
                                            <div className="lib-inputtextfld-box">
                                                <FieldControl name="confirm_password" render={TextInputPassword} meta={{ label: "Confirm Password", id: "confirm_password", type: "password" }} />
                                            </div>
                                        </div>
                                        <div className="">
                                            <button type="submit" className="lib-login-btn" disabled={invalid || pristine || pending}><Trans>Submit</Trans></button>
                                        </div>
                                        <div className="lib-forget-signup-row">
                                            <Link to="/login">
                                                <Trans>Sign-in</Trans>
                                            </Link>
                                            <span>
                                                <Trans>No account?</Trans>
                                                <Link to="/sign-up" className="signUp">
                                                    <Trans>Sign up here</Trans>
                                                </Link>
                                            </span>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>
                )} />
            </>
        );
    }
}

export default CreatePassword;
