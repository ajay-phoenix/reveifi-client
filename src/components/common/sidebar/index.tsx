import React, { Component } from "react";
import { Link } from "react-router-dom";
import i18next from "../../../i18next";

// import CookieService from "../../../services/CookieService";
import './_style.scss';
import { Trans } from "react-i18next";
import ReactFlagsSelect from 'react-flags-select';
import 'react-flags-select/css/react-flags-select.css';
import 'react-flags-select/scss/react-flags-select.scss';
import { UserService, CookieService } from "services/imports/index";

const role_id = CookieService.get('role_id');

class SideBar extends Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            notificationclickstate: false,
            name: '',
            notif: [],
            notifCount: 0,
            last_name: '',
            opensettingboxstate: false,
            buyerseller: 'Buyer',
            radiobtnstatus: localStorage.getItem("type") ? localStorage.getItem("type") : 'Buyer',
        };
    }

    public handleChange = value => {
        let newlang = "en";
        switch (value) {
            case "US": newlang = "en"; break;
            case "GB": newlang = "gb"; break;
            case "ES": newlang = "se"; break;
        }
        this.setState(prevState => ({ value: newlang }));
        i18next.changeLanguage(newlang);
        if (this.props.handler) {
            this.props.handler();
        }
        this.setState({ opensettingboxstate: false })
        document.body.className += ' sidebar-collapse';
        console.log('asf' + localStorage.getItem('type'))
    };
    public changeSellerRole = () => {
        console.log('asf' + localStorage.getItem('type'));
    };
    closeSidebar = () => {
        document.body.className += ' sidebar-collapse';
    }

    logOut = () => {
        CookieService.remove('role_id');
        CookieService.remove('access_token');
        window.location.href = "/login";
    }
    opensettingbox = () => {
        if (this.state.opensettingboxstate == true) {
            this.setState({ opensettingboxstate: false })
        } else {
            this.setState({ opensettingboxstate: true })
        }
    }

    hidepopup = () => {
        this.setState({ opensettingboxstate: false })
    }

    buyerbtnclicked = async () => {
        localStorage.setItem("type", "Buyer");
        await this.setState({ radiobtnstatus: "Buyer" })
    }
    sellerbtnclicked = async () => {
        localStorage.setItem("type", "Seller");
        await this.setState({ radiobtnstatus: "Seller" });
    }

    clickonindicator = async () => {
        if (this.state.radiobtnstatus == "Buyer") {
            localStorage.setItem("type", "Seller");
            await this.setState({ radiobtnstatus: "Seller" });
        } else {
            localStorage.setItem("type", "Buyer");
            await this.setState({ radiobtnstatus: "Buyer" });
        }
    }


    async componentDidMount(){
        var user = await UserService.getCurrentUserProfile();
        if (user?.userProfile.role_id!==1 && !user?.businessProfile) {
            if(window.location.href.split('/').pop()!=='edit-profile'){
                window.location.href = "/edit-profile";
            }
        }
    }

    render() {
        const { t, i18next } = this.props;
        return (

            <aside className="main-sidebar sidebar-dark-primary elevation-4">
                <div className="sidenav-logo-close-btn">
                    <div className="sidenav-logo-box">
                        <Link to="/dashboard">
                            <img src="../images/reverifi-logo.png" alt="Logo" />
                        </Link>
                    </div>
                    <div className="sidenav-close-btn" data-widget="pushmenu">
                        <img src="../images/Close.png" alt="Logo" />
                    </div>
                </div>
                <div className="sidenav-list-box">
                    {global['lenderRole'] == role_id || global['realtorRole'] == role_id ?
                        (
                            <>
                                {global['realtorRole'] == role_id ?
                                    <Link onClick={() => this.closeSidebar()} className="submit-property-btn"
                                        to="/submit-property">
                                        <span>
                                            {
                                                global['realtorRole'] == role_id ?
                                                    <Trans>Create Listing</Trans>
                                                    : <Trans>Submit Property</Trans>
                                            }
                                        </span>
                                        <i className="fas fa-plus-circle"></i>
                                    </Link> : null
                                }
                                <ul className="sidenav-list">
                                    <li>
                                        <Link onClick={() => this.closeSidebar()} to="/dashboard">
                                            <i className="fa fa-tachometer"></i>
                                            <Trans>My Dashboard</Trans>
                                        </Link>
                                    </li>
                                    <li id="profile-mt">
                                        <Link onClick={() => this.closeSidebar()} to="/inbox">
                                            <i className="fa fa-inbox"></i>
                                            <Trans>My Inbox</Trans>
                                        </Link>
                                    </li>
                                    {global['realtorRole'] == role_id ?
                                        <li id="profile-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/my-properties">
                                                <i className="fa fa-home"></i>
                                                <Trans>My Listings</Trans>
                                            </Link>
                                        </li> : <span></span>
                                    }
                                    {/* {global['realtorRole'] == role_id ?
                                        <li id="profile-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/add-property-to-transaction-table">
                                                <i className="fa fa-align-justify"></i>
                                                <Trans>Add Property To Transaction Table</Trans>
                                            </Link>
                                        </li> : <span></span>
                                    } */}


                                    <li id="profile-mt">
                                        <Link onClick={() => this.closeSidebar()} to="/public-properties">
                                            <i className="fa fa-align-justify"></i>
                                            <Trans>Reverifi Listings</Trans>
                                        </Link>
                                    </li>
                                    <li id="profile-mt">
                                        <Link onClick={() => this.closeSidebar()} to="/closed-deals">
                                            <i className="fa fa-times"></i>
                                            <Trans>Closed Deals</Trans>
                                        </Link>
                                    </li>
                                    <li id="profile-mt">
                                        <Link onClick={() => this.closeSidebar()} to="/client-list">
                                            <i className="fa fa-user"></i>
                                            <Trans>My Clients</Trans>
                                        </Link>
                                    </li>
                                    <li id="profile-mt">
                                        <Link onClick={() => this.closeSidebar()} to="/notification-settings">
                                            <i className="fa fa-bell"></i>
                                            <Trans>Notification Settings</Trans>
                                        </Link>
                                    </li>
                                    <li id="profile-mt">
                                        <Link onClick={() => this.closeSidebar()} to="/view-profile">
                                            <i className="fa fa-user"></i>
                                            <Trans>My Profile</Trans>
                                        </Link>
                                    </li>
                                </ul>
                            </>
                        ) : (
                            <>
                                {localStorage.getItem('type') == "Seller" ? (
                                    <>
                                        <Link onClick={() => this.closeSidebar()} className="submit-property-btn"
                                            to="/submit-property">
                                            <span><Trans>Submit Property</Trans></span>
                                            <i className="fas fa-plus-circle"></i>
                                        </Link>
                                        <ul className="sidenav-list">
                                            <li>
                                                <Link onClick={() => this.closeSidebar()} to="/dashboard">
                                                    <i className="fa fa-tachometer"></i>
                                                    <Trans>My Dashboard</Trans>
                                                </Link>
                                            </li>
                                            <li id="profile-mt">
                                                <Link onClick={() => this.closeSidebar()} to="/edit-profile">
                                                    <i className="fa fa-user"></i>
                                                    <Trans>My Profile</Trans>
                                                </Link>
                                            </li>
                                            <li id="inbox-mt">
                                                <Link onClick={() => this.closeSidebar()} to="/inbox">
                                                    <i className="fa fa-inbox"></i>
                                                    <Trans>My Inbox</Trans>
                                                </Link>
                                            </li>
                                            <li id="Properties-mt">
                                                <Link onClick={() => this.closeSidebar()} to="/my-properties">
                                                    <i className="fa fa-home"></i>
                                                    <Trans>My Property Listings</Trans>
                                                </Link>
                                            </li>

                                            {/* <li id="profile-mt">
                                                <Link onClick={() => this.closeSidebar()} to="/add-property-to-transaction-table">
                                                    <i className="fa fa-align-justify"></i>
                                                    <Trans>Add Property To Transaction Table</Trans>
                                                </Link>
                                            </li> */}

                                            <li id="profile-mt">
                                                <Link onClick={() => this.closeSidebar()} to="/public-properties">
                                                    <i className="fa fa-align-justify"></i>
                                                    <Trans>Reverifi Listings</Trans>
                                                </Link>
                                            </li>
                                            {/* <li id="offers-mt">
                                                <Link onClick={() => this.closeSidebar()} to="/properties-invitations">
                                                    <i className="fa fa-align-justify"></i>
                                                    <Trans>Invitations</Trans>
                                                </Link>
                                            </li> */}
                                            <li id="offers-mt">
                                                <Link onClick={() => this.closeSidebar()} to="/realtor-list">
                                                    <i className="fa fa-user"></i>
                                                    <Trans>My Realtors</Trans>
                                                </Link>
                                            </li>
                                            <li id="closed-mt">
                                                <Link onClick={() => this.closeSidebar()} to="/closed-deals">
                                                    <i className="fa fa-times"></i>
                                                    <Trans>Closed Deals</Trans>
                                                </Link>
                                            </li>
                                            <li id="profile-mt">
                                                <Link onClick={() => this.closeSidebar()} to="/notification-settings">
                                                    <i className="fa fa-bell"></i>
                                                    <Trans>Notification Settings</Trans>
                                                </Link>
                                            </li>
                                        </ul>
                                    </>
                                ) : (
                                    <ul className="sidenav-list">
                                        <li>
                                            <Link onClick={() => this.closeSidebar()} to="/dashboard">
                                                <i className="fa fa-tachometer"></i>
                                                <Trans>My Dashboard</Trans>
                                            </Link>
                                        </li>
                                        <li id="profile-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/edit-profile">
                                                <i className="fa fa-user"></i>
                                                <Trans>My Profile</Trans>
                                            </Link>
                                        </li>
                                        <li id="inbox-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/inbox">
                                                <i className="fa fa-inbox"></i>
                                                <Trans>My Inbox</Trans>
                                            </Link>
                                        </li>
                                        {/* <li id="Properties-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/my-properties">
                                                <i className="fa fa-home"></i>
                                                <Trans>My Properties</Trans>
                                            </Link>
                                        </li> 
                                            <li id="offers-mt">
                                                <Link onClick={() => this.closeSidebar()} to="/my-properties">
                                                    <i className="fa fa-align-justify"></i>
                                                    <Trans>My Properties</Trans>
                                                </Link>
                                            </li>*/}
                                        <li id="offers-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/properties-invitations">
                                                <i className="fa fa-align-justify"></i>
                                                <Trans>Properties of interest</Trans>
                                            </Link>
                                        </li>

                                        {/* <li id="profile-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/add-property-to-transaction-table">
                                                <i className="fa fa-align-justify"></i>
                                                <Trans>Add Property To Transaction Table</Trans>
                                            </Link>
                                        </li> */}

                                        <li id="profile-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/public-properties">
                                                <i className="fa fa-align-justify"></i>
                                                <Trans>Reverifi Listings</Trans>
                                            </Link>
                                        </li>
                                        <li id="offers-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/lender-list">
                                                <i className="fa fa-user"></i>
                                                <Trans>My Lenders</Trans>
                                            </Link>
                                        </li>
                                        <li id="offers-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/realtor-list">
                                                <i className="fa fa-user"></i>
                                                <Trans>My Realtors</Trans>
                                            </Link>
                                        </li>
                                        <li id="closed-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/closed-deals">
                                                <i className="fa fa-times"></i>
                                                <Trans>Closed Deals</Trans>
                                            </Link>
                                        </li>
                                        <li id="profile-mt">
                                            <Link onClick={() => this.closeSidebar()} to="/notification-settings">
                                                <i className="fa fa-bell"></i>
                                                <Trans>Notification Settings</Trans>
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                                <div className="sidemenu-switchbox">
                                    <h1><Trans>Change Account Type</Trans></h1>
                                    {role_id != 2 && role_id != 3 ?
                                        <div className="switch">

                                            <input onClick={this.buyerbtnclicked} defaultChecked={localStorage.getItem('type') === "Buyer"} type="radio" id="buyer1" name="switch-two" value="Buyer1" />

                                            <label htmlFor="buyer1" className="switch__label switch__label_yes"><Trans>Buyer</Trans></label>
                                            <div className="radiobtnbox">
                                                <div className="radio-button-line" onClick={this.clickonindicator} ></div>
                                                <div className="switch__indicator" onClick={this.clickonindicator} ></div>
                                            </div>
                                            <input onClick={this.sellerbtnclicked} defaultChecked={localStorage.getItem('type') === "Seller"} type="radio" id="seller1" name="switch-two" value="Seller" />
                                            <label htmlFor="seller1" className="switch__label switch__label_no"><Trans>Seller</Trans></label>

                                        </div> : null
                                    }
                                </div>
                            </>
                        )
                    }
                </div>
                <div className="sidenav-option-list-box">
                    {(this.state.opensettingboxstate == true) && (
                        <div className="add-lender-popup-page">
                            <div className="arp-close-btn">
                                {(this.state.showconfirmpopupstate == false) && (
                                    <img src="../images/close-btn.svg" onClick={this.hidepopup} />
                                )}
                            </div>
                            <div className="add-lender-popup">
                                <div className="arp-title"><Trans>Select Language</Trans></div>
                                <div className="arp-content">
                                    <ul className="arp-inputfld-list">
                                        <li className="fullwidth">
                                            <ReactFlagsSelect countries={["US", "GB", "ES"]} defaultCountry="US" onSelect={this.handleChange} />
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                    <ul className="sidenav-option-list">
                        <li>
                            <img src="../images/user.png" />
                            <span>
                                <Link onClick={() => this.closeSidebar()} to="/edit-profile">
                                    <Trans>Account</Trans>
                                </Link>
                            </span>
                        </li>
                        <li onClick={() => this.opensettingbox()}>
                            <img src="../images/gear.png" />
                            <span><Trans>Language</Trans></span>
                        </li>
                        <li onClick={() => this.logOut()}>
                            <img src="../images/3-dot.png" />
                            <span><Trans>Logout</Trans></span>
                        </li>
                    </ul>

                    <ul className="sidenav-option-sublist">
                        <li>
                            <ul className="sos-list">
                                <li>
                                    <a><Trans>Account Settings</Trans></a>
                                </li>
                                <li>
                                    <a><Trans>Profile Settings</Trans></a>
                                </li>
                                <li>
                                    <a><Trans>Logout</Trans></a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <ul className="sos-list" id="">
                                <li>
                                    <a><Trans>App Settings</Trans></a>
                                </li>
                                <li>
                                    <a><Trans>Language</Trans></a>
                                </li>
                                <li>
                                    <a><Trans>Help</Trans></a>
                                </li>
                            </ul>
                        </li>

                    </ul>
                </div>
            </aside>
        );
    }
}

export default SideBar;