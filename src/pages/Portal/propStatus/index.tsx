import React, { Component } from "react";

import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import "./_style.scss";
import UserService from "../../../services/UserService";
import { Redirect } from "react-router-dom";
import {Trans} from "react-i18next";

const loanType = { 1: 'FHA', 2: 'VA', 3: 'Conventional', 4: 'Reverse' };
const cs = { 1: '< 600', 2: '600 - 619', 3: '620 - 639', 4: '640 - 699', 5: '700+' };
const lender = { 1: 'Testing Lender 1', 2: 'Lender 2', 3: 'Lender 3', 4: 'Not Listed' };
var bidId = '';
class PropStatus extends Component<{}, any> {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            bidDetail: {}
        }

        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }


    async componentDidMount() {
        this.setState({ isLoading: true });
        bidId = window.location.pathname.split("/").pop();
        const response = await UserService.getBidDetail(bidId);
        console.log(response);
        this.setState({ bidDetail: response[0] });
        this.setState({ isLoading: false });
    }

    render() {
        if (this.state['bidDetail'].status === 1) {
            const url_to = `/buying-room/${bidId}`;
            return <Redirect to={url_to} />
        }
        if (this.state.isLoading) {
            return '';
        } else {
            return (
                <React.Fragment>
                    <AdminTopNav handler={this.handler} >
                    </AdminTopNav>
                    <SideBar handler={this.handler}></SideBar>
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="container">
                                <div className="profile-inner">
                                    <div className="biddetail-outer">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="bid-details">
                                                    <h5><Trans>Loan Details</Trans></h5>
                                                </div>
                                                <div className="offers_detail_table">

                                                    <table className="table">
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                <Trans>Offer Price</Trans>
                                                            </td>
                                                                <td>
                                                                    ${this.state['bidDetail'].offer_price}
                                                                </td>

                                                            </tr>
                                                            <tr className="outer-tr">
                                                                {/*<td>*/}
                                                                {/*No. Of Bids for this Property*/}
                                                                {/*</td>*/}
                                                                {/*<td>12</td>*/}

                                                            </tr>


                                                            <tr>
                                                                <td>
                                                                <Trans>Loan Type</Trans>
                                                            </td>
                                                                <td>
                                                                    {loanType[this.state['bidDetail'].loan_type]}
                                                                </td>

                                                            </tr>
                                                            <tr className="outer-tr">
                                                                <td>
                                                                <Trans>Down Payment</Trans>
                                                            </td>
                                                                <td>${this.state['bidDetail'].down_payment}</td>

                                                            </tr>


                                                            <tr>
                                                                <td>
                                                                <Trans>Credit Score</Trans>
                                                            </td>
                                                                <td>
                                                                    {cs[this.state['bidDetail'].credit_score]}
                                                                </td>

                                                            </tr>
                                                            <tr className="outer-tr">
                                                                <td>
                                                                <Trans>Balance In Buyer’s Bank Account</Trans>
                                                            </td>
                                                                <td>${this.state['bidDetail'].bank_balance}</td>

                                                            </tr>

                                                            <tr>
                                                                <td>
                                                                <Trans>Pre-Approved For Mortgage</Trans>
                                                            </td>
                                                                <td>
                                                                    {
                                                                        this.state['bidDetail'].is_pre_approved === 1 ?
                                                                            'Yes' : 'No'
                                                                    }

                                                                </td>

                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>


                                            </div>
                                            {/*<div className="col-md-5">*/}
                                            {/*<div className="documents-uppers">*/}
                                            {/*<h2>Documents</h2>*/}
                                            {/*<div className="doc-upper">*/}
                                            {/*<div className="document-outer-section">*/}
                                            {/*<div className="documents-left">*/}
                                            {/*<img src="/images/Capturess.png" alt=""></img>*/}
                                            {/*</div>*/}
                                            {/*<div className="document-right">*/}
                                            {/*<div className="docs-color">*/}
                                            {/*<div className="doc-pdf">*/}
                                            {/*<i className="fa fa-file-pdf"></i>*/}
                                            {/*</div>*/}
                                            {/*<div className="pdf-desc">*/}
                                            {/*<p><b>Loan-certificate.pdf</b><br/>*/}
                                            {/*160 kb &nbsp;05-07-2020</p>*/}
                                            {/*</div>*/}
                                            {/*</div>*/}
                                            {/*<div className="pdf-download"><i*/}
                                            {/*className="fa fa-download"></i></div>*/}
                                            {/*</div>*/}
                                            {/*</div>*/}


                                            {/*</div>*/}
                                            {/*</div>*/}
                                            {/*</div>*/}

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

}


export default PropStatus;