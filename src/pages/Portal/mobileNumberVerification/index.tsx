import React, { Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import Skeleton from 'react-loading-skeleton';

import { AdminTopNav, SideBar } from "components/common/imports/navigations";
import { UserService } from "services/imports/index";

import "./_style.scss";
import { Trans, useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
    FormBuilder,
    FieldGroup,
    FieldControl,
    Validators,
} from "react-reactive-form";
import $ from 'jquery';
import { setTimeout } from "timers";

export function MyComponent({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input type="text" className="lib-inputtextfld" id={meta.id} placeholder={t(`Enter ${meta.label}`)} {...handler()} />
}



const TextInput = ({ handler, touched, hasError, meta }: any) => (
    <>
        <MyComponent handler={handler} meta={meta} ></MyComponent>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </>
);

class MobileNumberVerification extends Component<RouteComponentProps> {
    constructor(props) {
        super(props);
        this.state = { user: {}, loading: 'true' }
        this.handler = this.handler.bind(this)
    }
    handler() { this.setState({ updateLanguage: true }) }

    mnv = FormBuilder.group({
        mobileNumber: ['', [Validators.required]],
    });

    async componentDidMount() {
        document.body.classList.add('disable-sidebar');
        const response = await UserService.getCurrentUserProfile();

        if (response['userProfile'].mobile_verified === 1) {
            document.body.classList.remove('disable-sidebar');
            this.props.history.push("/dashboard");
        }

        this.setState({ user: response, loading: 'false' });
        this.mnv.controls['mobileNumber'].setValue(this.formatMobileNumber(response.userProfile.mobile_number));

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

    async handleFormSubmit(event: any) {
        event.preventDefault();

        const postData = this.mnv.value;
        const response = await UserService.verifyMobileNumber(postData);

        if (response) {
            if (typeof response == 'string') {
                toast.error("Please enter valid phone number.");
            } else {
                toast.success("Message has been sent to: " + postData.mobileNumber, {
                    closeOnClick: true,
                    pauseOnHover: true,
                });
                this.props.history.push("/code-verification");
            }
        } else {
            toast.error("Some thing went wrong please try again.");
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
                <AdminTopNav handler={this.handler} ></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <section className="edit-profile-section">
                    <div className="edit-profile-page">
                        <div className="edit-profile-image">
                            <img src="images/verifiimg.jpg" className="img-responsive" />
                        </div>
                        <div className="edit-profile-form">
                            <h1><Trans>VERIFY MOBILE NUMBER</Trans></h1>
                            <div className="edit-profile-form-box">
                                <h3><Trans>Enter Mobile Number For One Time Verification</Trans></h3>
                                <FieldGroup control={this.mnv} render={({ invalid, pristine, pending, meta }) => (
                                    <div className="edit-personal-details-box">
                                        <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                                            <ul className="epf-inputfld-list">
                                                <li className="width100">
                                                    {(this.state['loading'] === 'true') ?
                                                        <Skeleton count={1} circle={true} height={60} />
                                                        :
                                                        <FieldControl name="mobileNumber" render={TextInput} meta={{ label: "Mobile Number", id:"phoneNumber" }} />
                                                    }
                                                </li>
                                            </ul>

                                            <div className="edit-profile-btn-row">
                                                {(this.state['loading'] === 'true') ?
                                                    <Skeleton count={1} circle={true} height={60} />
                                                    :
                                                    <input type="submit" name="submit" className="epb-button" disabled={invalid} value="GET Verification Code" />
                                                }
                                            </div>
                                        </form>
                                    </div>
                                )} />
                            </div>
                        </div>
                    </div>
                </section>
                <div className="container disnone">
                    <div className="outer-content">
                        <div className="row">
                            <div className="verifi-heading">
                                <h1><Trans>VERIFY MOBILE NUMBER</Trans></h1>
                            </div>
                        </div>
                        <div className="row verification-row">
                            <div className="col-md-5">
                                <div className="leftsideimg">
                                    <img src="images/verifiimg.jpg" className="img-responsive" />
                                </div>
                            </div>
                            <div className="col-md-7">
                                <div className="verifiy_outer">
                                    <h3><Trans>Enter Mobile Number For One Time Verification</Trans></h3>
                                    <FieldGroup
                                        control={this.mnv}
                                        render={({ invalid, pristine, pending, meta }) => (
                                            <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                                                <div className="">
                                                    <div className="">
                                                        {
                                                            (this.state['loading'] === 'true') ?
                                                                <Skeleton count={1} circle={true} height={60} />
                                                                :
                                                                <FieldControl
                                                                    name="mobileNumber"
                                                                    render={TextInput}
                                                                    meta={{ label: "Mobile Number", id:"phoneNumber" }}
                                                                />
                                                        }
                                                    </div>
                                                    <div className="">
                                                        {
                                                            (this.state['loading'] === 'true') ?
                                                                <Skeleton count={1} circle={true} height={60} />
                                                                :
                                                                <input type="submit" name="submit"
                                                                    className="btn btn-decode"
                                                                    disabled={invalid}
                                                                    value="GET Verification Code">
                                                                </input>
                                                        }

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
            </React.Fragment>
        )

    }

}


export default MobileNumberVerification;