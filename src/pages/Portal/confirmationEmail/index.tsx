import React, { Component } from "react";
import { Link } from "react-router-dom";
import TopNav from "../../../components/common/topnav";
import { AdminTopNav, SideBar } from "components/common/imports/navigations";
import footer from "../../../components/common/footer";
import "./_style.scss";
import { Trans } from "react-i18next";
class ConfirmationEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            loading: 'true'
        }
        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }
    render() {
        return (
            <React.Fragment>
                
                <section className="confirmemail-section">
                    <div className="confirmemail-box">
                        <h2><Trans>Confirmation Email</Trans></h2>
                        <div className="confirm-reg-desc">
                            <h4><Trans>Verify your e-mail to finish registration</Trans></h4>
                            <p><Trans>A Confirmation Email Has Been Sent To Your Email Address.</Trans></p>
                        </div>
                    </div>
                </section>
                {/* <div className="container-fluid">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-4 col-md-12 col-sm-12">
                                <div className="register-left">
                                    <img src="/images/undraw.png" className="img-fluid" alt=""></img>
                                </div>
                            </div>
                            <div className="col-lg-1 col-md-12"></div>
                            <div className="col-lg-7 col-md-12 col-sm-12 confirmreg">
                                <div className="confirmReg">
                                    <h2><Trans>Register</Trans></h2>
                                </div>
                                <div className="confirm-reg-desc">
                                    <h4><Trans>Verify your e-mail to finish registration</Trans></h4>
                                    <p><Trans>A Confirmation Email Has Been Sent To Your Email Address.</Trans></p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div> */}
            </React.Fragment>
        )
    }
}

export default ConfirmationEmail;