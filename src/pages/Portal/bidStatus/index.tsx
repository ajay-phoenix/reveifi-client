import React, { Component } from "react";
import { Link } from "react-router-dom";

import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import footer from "../../../components/common/footer";
import "./_style.scss";
import {Trans} from "react-i18next";


class bidStatus extends Component {
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
                    <div className="profile-inner">
                    <div className="container">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h3 id="myinvites" className="my-bids"><Trans>My Bids</Trans></h3>
                                        </div>
                                        <div className="col-md-6">

                                        </div>
                                    </div>
                        </div>
                        
                     <div className="container">
                <ul className="nav nav-tabs tabs-upper-cast" role="tablist" id="nameupper">
                                            <li className="nav-item">
                                                <a className="nav-link active" data-toggle="tab"
                                                   href="#home"><Trans>My Successful Bids</Trans></a>
                                            </li>
<li className="nav-item">
                            <a className="nav-link" data-toggle="tab" href="#menu1">
                            <Trans>My Unsuccessful Bids</Trans>
</a>
                                            </li>
                                           
                            </ul>
                            </div> 
  <div className="tab-content">
      <div id="home" className="container tab-pane active">
       <div className="tab-pane active" id="desc" role="tabpanel">
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
                                                        <p><Trans>Property Name Here</Trans></p>
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
                                                        <p><Trans>Offer Price</Trans>: $50,000</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="bid-now-btn"><a href=""><Trans>Inspection</Trans></a></div>

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
                                                        <p><Trans>Offer Price</Trans>: $50,000</p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="bid-now-btn"><a href=""><Trans>Inspection</Trans></a></div>

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
                                                        <p><Trans>Lorem Ipsum is simply dummy text of the printing</Trans></p>
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
                                                    <div className="bid-now-btn" id="bid-now-btn"><a href=""><Trans>Clear Mortgage</Trans></a>
                                                    </div>

                                                </td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
       </div>
       </div>

       <div id="menu1" className="container tab-pane">
                                <div className="tab-pane active" id="desc" role="tabpanel">
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
                                                        <p><Trans>Dummy property Here.</Trans></p>
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
                                                    <div className="bid-now-btn"><a href=""><Trans>Inspection</Trans></a></div>

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
                                                <td >
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
                                                    <div className="bid-now-btn"><a href=""><Trans>Inspection</Trans></a></div>

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
                                                        <p><Trans>Lorem Ipsum is simply dummy text of the printing</Trans></p>
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
                                                    <div className="bid-now-btn" id="bid-now-btn"><a href=""><Trans>Clear Mortgage</Trans></a>
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
            </React.Fragment>
        )

    }

}


export default bidStatus;