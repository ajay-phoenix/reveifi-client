import React, {Component} from "react";

import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import "./_style.scss";
import {Trans} from "react-i18next";

class MyInvites extends Component {
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
                <AdminTopNav handler = {this.handler} >

                </AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <div className="content-wrapper">
                    <div className="row">
                        <div className="container">
                            <div className="profile-inner">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h3 id="myinvites"><Trans>My Invites</Trans></h3>
                                        </div>
                                        <div className="col-md-6">

                                        </div>
                                    </div>
                                </div>
                                <div className="container offers-table">
                                    <div className="table-responsive">
                                        <table className="table">
                                            <tbody>
                                            <tr>
                                                <td>
                                                    <div className="property-img">

                                                        <img src="http://reverifi.trisec.io/images/property-1.png"
                                                             className="img-fluid"></img>
                                                    </div>
                                                    <div className="property-name">
                                                        <p><Trans>Property Name Here.</Trans></p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="property-img">
                                                        <img src="http://reverifi.trisec.io/images/buyer-name.png"
                                                             className="img-fluid"></img>

                                                    </div>
                                                    <div className="property-name">
                                                        <p><Trans>Buyer Name</Trans></p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="property-name">
                                                        <p><Trans>Offer Price: $50,000</Trans></p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="bid-now-btn"><a href=""><Trans>Bid Now</Trans></a></div>

                                                </td>
                                            </tr>
                                            <tr className="outer-tr">
                                                <td colSpan={100}>
                                                    <p><Trans>34 Prospect Street #7 Jersey City NJ 07307 United States</Trans></p>
                                                </td>

                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="property-img">
                                                        <img src="http://reverifi.trisec.io/images/property-1.png"
                                                             className="img-fluid"></img>
                                                    </div>
                                                    <div className="property-name">
                                                        <p><Trans>Property Name Here.</Trans></p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="property-img">
                                                        <img src="http://reverifi.trisec.io/images/buyer-name.png"
                                                             className="img-fluid"></img>
                                                    </div>
                                                    <div className="property-name">
                                                        <p><Trans>Buyer Name</Trans></p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="property-name">
                                                        <p><Trans>Offer Price: $50,000</Trans></p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="bid-now-btn"><a href=""><Trans>Bid Now</Trans></a></div>

                                                </td>
                                            </tr>
                                            <tr className="outer-tr">
                                                <td colSpan={100}>
                                                    <p><Trans>34 Prospect Street #7 Jersey City NJ 07307 United States</Trans></p>
                                                </td>

                                            </tr>
                                            <tr>
                                                <td>
                                                    <div className="property-img">

                                                        <img src="http://reverifi.trisec.io/images/property-1.png"
                                                             className="img-fluid"></img>
                                                    </div>
                                                    <div className="property-name">
                                                        <p><Trans>Property Name Here.</Trans></p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="property-img">
                                                        <img src="http://reverifi.trisec.io/images/buyer-name.png"
                                                             className="img-fluid"></img>

                                                    </div>
                                                    <div className="property-name">
                                                        <p><Trans>Buyer Name</Trans></p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="property-name">
                                                        <p><Trans>Offer Price: $50,000</Trans></p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="bid-now-btn" id="bid-now-btn"><a href=""><Trans>Closed</Trans></a>
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
            </React.Fragment>
        )

    }

}


export default MyInvites;