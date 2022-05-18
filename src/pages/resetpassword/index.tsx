import React, { Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { FormBuilder, FieldGroup, FieldControl, Validators } from "react-reactive-form";


// import components here
import TopVan from "../../components/common/topnav";
import TextInput from "../../components/common/inputs/inputText";
import TextInputPassword from "../../components/common/inputs/inputPassword";
import AuthService from "./../../services/AuthService";
import "./_style.scss";
import UserService from "../../services/UserService";
import CookieService from "../../services/CookieService";
import axios from "axios";
import { Trans } from "react-i18next";


class Resetpassword extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            loader: '',
            errorMsg: ''

        }

    }


    resetpassword = FormBuilder.group({
        email: ['', [Validators.required, Validators.email]],

    });

    async handleFormSubmit(event: any) {
        event.preventDefault();
        this.setState({ loader: true, errorMsg: false });
        this.resetpassword.patchValue({ loader: true });

        const postData = {
            email: this.resetpassword.value.email

        };
        const response = await AuthService.resetpassword(postData);
        console.log(response);
        if (response.status == "success") {
            alert(response.message);
        }
        else {
            alert(response.message);
            this.setState({ loader: false, errorMsg: true });
            this.resetpassword.patchValue({ loader: true, errorMsg: true })
        }
    }

    render() {
        return (
            <>
                <TopVan></TopVan>
                <FieldGroup control={this.resetpassword} render={({ invalid, pristine, pending, meta }) => (
                    <section className="loginsection" id="loginpage">
                        <div className="loginpage">
                            <div className="login-image">
                                <img src="/images/login.png" alt="" className="img-fluid"></img>
                            </div>
                            <div className="login-form">
                                <h1><Trans>Reset Password</Trans></h1>
                                <div className="login-form-box">
                                    <h3><Trans>Enter account email to reset password</Trans></h3>
                                    <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                                        <div className="input-fld-box">
                                            <div className="lib-inputtextfld-box">
                                                <FieldControl name="email" render={TextInput} meta={{ label: "Email", id: "email", type: "email" }} />
                                            </div>
                                        </div>
                                        <div className="">
                                            <button type="submit" className="lib-login-btn"><Trans>Submit</Trans></button>
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

export default Resetpassword;
