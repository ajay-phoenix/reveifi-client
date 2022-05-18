import React, { Component } from "react";
import { Link } from "react-router-dom";

import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import footer from "../../../components/common/footer";
import "./_style.scss";
import {Trans} from "react-i18next";


class testInbox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            list: null
        }


        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }
    componentDidMount() {
        this.getData()


    }

    getData() {
        fetch("http://localhost:3000/api/v1").then((response) => {
            console.log(response);
            response.json().then((result) => {


                this.setState({ list: result })
            })
        })
    }



    render() {
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler} >

                </AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <div className="content-wrapper">


                    <div className="inbox-outer">
                        <div className="container">

                            <div className="row">
                                <div className="inbox-heading">
                                    <h3><Trans>Inbox</Trans></h3>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4 user-status-md-5">
                                    <div className="user-status odd-row">
                                        <div className="user-status-left">
                                            <img src="/images/Capturess.png" className="img-fluid"></img>
                                        </div>
                                        <div className="user-status-right">
                                            <h5><Trans>Justin</Trans></h5>
                                        </div>
                                    </div>
                                    <div className="user-status odd-even">
                                        <div className="user-status-left">
                                            <img src="/images/Capturess.png" className="img-fluid"></img>
                                        </div>
                                        <div className="user-status-right">
                                            <h5><Trans>User Name</Trans></h5>
                                        </div>
                                    </div>
                                    <div className="user-status odd-row">
                                        <div className="user-status-left">
                                            <img src="/images/Capturess.png" className="img-fluid"></img>
                                        </div>
                                        <div className="user-status-right">
                                            <h5><Trans>Justin</Trans></h5>
                                        </div>
                                    </div>
                                    <div className="user-status odd-even">
                                        <div className="user-status-left">
                                            <img src="/images/Capturess.png" className="img-fluid"></img>
                                        </div>
                                        <div className="user-status-right">
                                            <h5><Trans>User Name</Trans></h5>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    <div className="property-img">
                                        <img src="/images/Capturess.png" className="img-fluid"></img>

                                    </div>
                                    <div className="property-name">
                                        <p><Trans>Chat with Justin</Trans></p>
                                    </div>
                                    <div className="chat-with-justin">
                                        <p className="first"><Trans>You Have Accepted Bidding From Justin</Trans><span><Trans>Property Name</Trans></span></p>
                                        <div className="row">
                                            <p className="second"><Trans>That is what is required for an offer</Trans></p>
                                        </div>

                                        <p className="third"><Trans>You Have Accepted Bidding From Justin</Trans></p>

                                        <div className="row">
                                            <p className="second" id="fourth"><Trans>Thanks for sharing documents</Trans></p>
                                        </div>
                                    </div>
                                    <div className="type_msg">
                                        <div className="input_msg_write">
                                            <input type="text" className="write_msg" placeholder="Type a message"></input>
                                            <button className="msg_send_btn" type="button"><i className="fa fa-paper-plane" aria-hidden="true"></i></button>

                                        </div>
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


export default testInbox;