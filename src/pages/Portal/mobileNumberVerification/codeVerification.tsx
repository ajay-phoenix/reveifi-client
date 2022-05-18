import React, { Component } from "react";
import { RouteComponentProps } from "react-router-dom";
import {AdminTopNav, SideBar} from "components/common/imports/navigations";
import {UserService} from "services/imports/index";
import {Trans} from "react-i18next";
import {
    FormBuilder,
    FieldGroup,
    FieldControl,
    Validators,
} from "react-reactive-form";

const TextInput = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <input className="form-control" type="text" id="verifyfield" placeholder={`Enter ${meta.label}`} {...handler()} />
        <span className="help-block">
            {touched && hasError("required") && `${meta.label} is required`}
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </div>
);
class CodeVerification extends Component<RouteComponentProps> {
    constructor(props) {
        super(props)

        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }
    mnv = FormBuilder.group({
        otpCode: ['', [Validators.required]],
    });

    async handleFormSubmit(event: any) {
        //console.log('Signin Up User', this.mnv.value.mobileNumber);
        event.preventDefault();

        const postData = this.mnv.value;
        const response = await UserService.codeMobileNumber(postData);
        //
        if (response) {
            document.body.classList.remove('disable-sidebar');
            this.props.history.push("/dashboard");
        } else {
            alert("Some thing went wrong please try again.");
        }
    }
    render() {
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler} ></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <div className="content-wrapper">
                    <div className="container" style={{marginTop: "0"}}>
                        <div className="outer-content" style={{marginTop: "0"}}>
                            <div className="row">
                                <div className="verifi-heading">
                                    <h1><Trans>VERIFY your OTP Code</Trans></h1>
                                </div>
                            </div>
                            <div className="row verification-row">
                                <div className="col-md-3">
                                    <div className="leftsideimg" id="leftimg">
                                        <img src="images/verification_2.jpg" className="img-responsive" />
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    <div className="verifiy_outer">
                                        <FieldGroup
                                            control={this.mnv}
                                            render={({ invalid, pristine, pending, meta }) => (
                                                <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                                                    <div className="">
                                                        <div className="">
                                                            <FieldControl
                                                                name="otpCode"
                                                                render={TextInput}
                                                                meta={{ label: "Code" }}
                                                            />
                                                        </div>
                                                        <div className="">
                                                            <input type="submit" name="submit"
                                                                disabled={invalid || pristine || pending}
                                                                value="Verify"
                                                                className="btn btn-decode"
                                                                id="btndecode">
                                                            </input>
                                                        </div>
                                                    </div>
                                                </form>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>


                </div>
            </React.Fragment>
        )

    }

}


export default CodeVerification;