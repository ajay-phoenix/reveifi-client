import React, { Component } from "react";

import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import "./_style.scss";
import {Trans} from "react-i18next";




class BidDetail extends Component {
    constructor(props) {
        super(props)

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
                <AdminTopNav handler={this.handler} >

                </AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <div className="content-wrapper">
                    <div className="row">
                        <div className="container">
                            <div className="profile-inner">
                                <div className="biddetail-outer">
                                    <div className="row">
                                        <div className="col-lg-7 col-md-12 col-sm-12">
                                            <div className="property-img">
                                                <img src="http://reverifi.trisec.io/images/property-1.png"
                                                    className="img-fluid"></img>

                                            </div>
                                            <div className="property-name">
                                                <p><Trans>Property Name Here.</Trans></p>
                                            </div>
                                            <div className="bid-details">
                                                <h5><Trans>Bid Details</Trans></h5>
                                            </div>
                                            <div className="offers_detail_table">

                                                <table className="table">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <Trans>Offer Price</Trans>
                                                        </td>
                                                            <td>
                                                                $50,000
                                                        </td>

                                                        </tr>
                                                        <tr className="outer-tr">
                                                            <td>
                                                                <Trans>No. Of Bids for this Property</Trans>
                                                        </td>
                                                            <td>12</td>

                                                        </tr>


                                                        <tr>
                                                            <td>
                                                            <Trans>Loan</Trans>
                                                        </td>
                                                            <td>
                                                            <Trans>Loan Name</Trans>
                                                        </td>

                                                        </tr>
                                                        <tr className="outer-tr">
                                                            <td>
                                                            <Trans>Down Payment</Trans>
                                                        </td>
                                                            <td>$3000</td>

                                                        </tr>


                                                        <tr>
                                                            <td>
                                                            <Trans>Credit Score</Trans>
                                                        </td>
                                                            <td>
                                                                600-619
                                                        </td>

                                                        </tr>
                                                        <tr className="outer-tr">
                                                            <td>
                                                            <Trans>Balance In Buyer’s Bank Account</Trans>
                                                        </td>
                                                            <td>$500000</td>

                                                        </tr>

                                                        <tr>
                                                            <td>
                                                            <Trans>Pre-Approved For Mortgage</Trans>
                                                        </td>
                                                            <td>
                                                                Yes
                                                        </td>

                                                        </tr>
                                                        <tr className="outer-tr">
                                                            <td>
                                                            <Trans>Bank Name</Trans>
                                                        </td>
                                                            <td><Trans>Bank Name</Trans></td>

                                                        </tr>


                                                        <tr>
                                                            <td>
                                                            <Trans>Banker’s Email</Trans>
                                                        </td>
                                                            <td>
                                                                bankname@domain.com
                                                        </td>

                                                        </tr>
                                                        <tr className="outer-tr">
                                                            <td>
                                                                <Trans>Phone Number For Verification</Trans>
                                                        </td>
                                                            <td>00000000000</td>

                                                        </tr>


                                                        <tr>
                                                            <td>
                                                            <Trans>Property Address</Trans>
                                                        </td>
                                                            <td>
                                                                &nbsp;
                                                        </td>

                                                        </tr>
                                                        <tr className="outer-tr">
                                                            <td colSpan={100}>
                                                                34 Prospect Street #7, Jersey City, NJ, 07307, United States
                                                        </td>


                                                        </tr>

                                                    </tbody>
                                                </table>
                                            </div>


                                        </div>
                                        <div className="col-lg-5 col-md-12 col-sm-12">
                                            <div className="property-img">
                                                <img src="http://reverifi.trisec.io/images/property-1.png"
                                                    className="img-fluid"></img>

                                            </div>
                                            <div className="property-name">
                                                <p><Trans>Buyer Name</Trans></p>
                                            </div>
                                            <div className="property-detail-btn">
                                                <a href=""><Trans>Property Details</Trans></a>
                                            </div>

                                            <div className="offers_detail_table" id="right-detail">

                                                <table className="table">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div className="bid-accepted">
                                                                    <a href="#"><Trans>Bid Accepted</Trans></a>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="seller-data">
                                                                    <p><Trans>(Seller)</Trans></p>
                                                                </div>

                                                            </td>

                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <div className="bid-accepted">
                                                                    <a href="#"><Trans>Contract Signed</Trans></a>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="seller-data">
                                                                    <p><Trans>((Buyer))</Trans></p>
                                                                </div>

                                                            </td>

                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <div className="bid-accepted">
                                                                    <a href="#"><Trans>Attorney Review</Trans></a>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="seller-data">
                                                                    <p><Trans>(Seller)</Trans></p>
                                                                </div>

                                                            </td>

                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <div className="bid-accepted">
                                                                    <a href="#"><Trans>Inspection Arranged</Trans></a>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="seller-data">
                                                                    <p><Trans>(Seller)</Trans></p>
                                                                </div>

                                                            </td>

                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <div className="bid-accepted">
                                                                    <a href="#"><Trans>Attorney Approved</Trans></a>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="seller-data">
                                                                    <p><Trans>(Buyer)</Trans></p>
                                                                </div>

                                                            </td>

                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <div className="bid-accepted">
                                                                    <a href="#"><Trans>LenderInvited</Trans></a>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="seller-data">
                                                                    <p><Trans>(Seller)</Trans></p>
                                                                </div>

                                                            </td>

                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <div className="bid-accepted">
                                                                    <a href="#"><Trans>Appraisal Arranged</Trans></a>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="seller-data">
                                                                    <p><Trans>(Seller)</Trans></p>
                                                                </div>

                                                            </td>

                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <div className="bid-accepted">
                                                                    <a href="#"><Trans>Task Checklist Complete</Trans></a>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="seller-data">
                                                                    <p><Trans>(Buyer)</Trans></p>
                                                                </div>

                                                            </td>

                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <div className="bid-accepted">
                                                                    <a href="#"><Trans>Set Close Date</Trans></a>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="seller-data">
                                                                    <p><Trans>(Seller)</Trans></p>
                                                                </div>

                                                            </td>

                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <div className="bid-accepted">
                                                                    <a href="#"><Trans>Bid Accepted</Trans></a>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="seller-data">
                                                                    <p><Trans>(Seller)</Trans></p>
                                                                </div>

                                                            </td>

                                                        </tr>

                                                        <tr>
                                                            <td>
                                                                <div className="bid-accepted">
                                                                    <a href="#"><Trans>Set Close Date</Trans></a>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="seller-data">
                                                                    <p><Trans>(Seller)</Trans></p>
                                                                </div>

                                                            </td>

                                                        </tr>


                                                    </tbody>
                                                </table>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-7 col-md-12 col-sm-12  propertyChatUpper">
                                <div className="property-main">
                                    <div className="property-img">
                                        <img src="/images/Capturess.png" alt=""></img>


                                    </div>
                                    <div className="property-name">
                                        <p id="buying-room-inner"><Trans>Transaction table Chat (Buyer, Seller, Realtors, Lenders)</Trans></p>
                                    </div>
                                </div>
                                <div className="propertyChatContent">
                                    <p className="para_align"><Trans>You Have Accepted Bidding From Justin</Trans></p>
                                    <div className="detail-desc-para">
                                        <p><Trans>That is what is required for an offer</Trans></p></div>
                                    <div className="detail-desc-para" id="inner-detil">
                                        <p><Trans>You need these two documents for that</Trans></p></div>
                                    <div className="detail-desc-para" id="detail-bottom">
                                        <p><Trans>Thanks for sharing documents</Trans></p></div>
                                    <div className="chat-msgs">

                                        <input type="text" id="mssg" name="msg" placeholder="Type message here"></input>
                                        <input type="submit" name="submit" value="submit" id="submit"></input>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-5 col-md-12 col-sm-12">
                                <div className="documents-uppers">
                                    <h2><Trans>Documents</Trans></h2>
                                    <div className="doc-upper">
                                        <div className="document-outer-section">
                                            <div className="documents-left">
                                                <img src="/images/Capturess.png" alt=""></img>
                                            </div>
                                            <div className="document-right">
                                                <div className="docs-color">
                                                    <div className="doc-pdf">
                                                        <i className="fa fa-file-pdf"></i>
                                                    </div>
                                                    <div className="pdf-desc">
                                                        <p><b>Loan-certificate.pdf</b><br />
                                                            160 kb &nbsp;05-07-2020</p>
                                                    </div>
                                                </div>
                                                <div className="pdf-download"><i className="fa fa-download"></i></div>
                                            </div>
                                        </div>
                                        <div className="document-outer-section">
                                            <div className="documents-left">
                                                <img src="/images/Capturess.png" alt=""></img>
                                            </div>
                                            <div className="document-right">
                                                <div className="docs-color">
                                                    <div className="doc-pdf">
                                                        <i className="fa fa-file-pdf"></i>
                                                    </div>
                                                    <div className="pdf-desc">
                                                        <p><b>Loan-certificate.pdf</b><br />
                                                            160 kb &nbsp;05-07-2020</p>
                                                    </div>
                                                </div>
                                                <div className="pdf-download"><i className="fa fa-download"></i></div>
                                            </div>
                                        </div>
                                        <div className="document-outer-section">
                                            <div className="documents-left">
                                                <img src="/images/Capturess.png" alt=""></img>
                                            </div>
                                            <div className="document-right">
                                                <div className="docs-color">
                                                    <div className="doc-pdf">
                                                        <i className="fa fa-file-pdf"></i>
                                                    </div>
                                                    <div className="pdf-desc">
                                                        <p><b>Loan-certificate.pdf</b><br />
                                                            160 kb &nbsp;05-07-2020</p>
                                                    </div>
                                                </div>
                                                <div className="pdf-download"><i className="fa fa-download"></i></div>
                                            </div>
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


export default BidDetail;