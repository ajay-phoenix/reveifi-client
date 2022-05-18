import React, { Component } from "react";
import { Link } from "react-router-dom";

import { Trans } from "react-i18next";
import moment from "moment";

import { AdminTopNav, SideBar } from "components/common/imports/navigations";
import { UserService, CookieService } from "services/imports/index";

import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css'

import "./_style.scss";
import { toast } from "react-toastify";

const role_id = CookieService.get('role_id');

class Dashboard extends Component<{}, any> {
    constructor(props) {
        super(props);

        this.state = {
            tags: [],
            showInvitationModalState: false,
            invitationLoader: false,
            businessProfile: true,
            hour: null,
            stats: {},
            buying: [],
            selling: [],
            invited_properties: [],

            my_properties: [],
            accepted_offers: [],
            notifications: [],
            seller_pending_offers: [],
            seller_rejected_offers: [],
            seller_accepted_offers: [],
            lender_clients_started: [],
            lender_clients_pre_approved: [],
            my_buyers: [],
            offers_sent: [],
            notifications_count: 0,
            userRole: 0,
            transactions_in_process: [],
            pending_offers: [],
            radiobtnstatus: localStorage.getItem("type") ? localStorage.getItem("type") : 'Buyer',
            showInviteRealtorState: false,
            showConfirmPopupState: false,
            invite_email_placeholder: 'Enter email address',
            childElement: React.createRef(),
            showtablevalue: ""
        };
        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({ updateLanguage: true })
    }

    makePropertyData(response) {
        const resp = [];
        const promises = [];
        response.forEach((v, k) => {
            promises.push(this.makeData(v, k))
            // resp.push(v['user_property'][0]);
        });
        Promise.all(promises).then(res => {
            resp.push(res);
            this.setState({ my_properties: resp[0], loading: 'false' });
        })
    }

    makeData(v, index) {
        return new Promise((resolve, reject) => {
            let maxBid = {};
            if (v['user_property'][0]['property_bids_association'].length > 0) {
                maxBid = v['user_property'][0]['property_bids_association'].reduce(function (prev, current) {
                    return (prev['bids'][0].offer_price > current['bids'][0].offer_price) ? prev : current
                })
            }
            v['user_property'][0]['maxBid'] = maxBid;
            if (v['user_property'][0].status == 1) {
                v['user_property'][0]['realtor_id'] = v['realtor_id'] ? true : false;
                v['user_property'][0]['lender_id'] = v['lender_id'] ? true : false;
                UserService.getBuyingroomStatus(v['user_property'][0].id)
                    .then(res => {
                        if (res.success && res.data != null && res.data.module != null) {
                            v['user_property'][0].progress_status = res.data.module;
                            resolve(v['user_property'][0])
                        } else {
                            v['user_property'][0].progress_status = 'Completed !';
                            resolve(v['user_property'][0])
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else {
                v['user_property'][0]['realtor_id'] = v['realtor_id'] ? true : false;
                v['user_property'][0]['lender_id'] = v['lender_id'] ? true : false;
                resolve(v['user_property'][0])
            }
        })
    }

    async componentDidMount() {
        this.getHour();
        const response = await UserService.getDashboardStats();
        const name = (localStorage.getItem('name') != null ? localStorage.getItem('name') : '');
        const last_name = (localStorage.getItem('last_name') != null ? localStorage.getItem('last_name') : '');

        // Buyer Dashboard
        const invited_properties = await UserService.getInvitedProperties();
        this.setState({ invited_properties: invited_properties });

        const notifications = await UserService.getUserNotifications();
        this.setState({ notifications: notifications.data, notifications_count: notifications.notifCount });

        const accepted_offers = new Array();

        for (let i = 0; i < invited_properties?.length; i++) {
            for (let j = 0; j < invited_properties[i].bids.length; j++) {
                if (invited_properties[i].bids[j].bids[0].status == 1) {
                    accepted_offers.push(invited_properties[i])
                }
            }
        }
        this.setState({ accepted_offers: accepted_offers });


        const pending_offers = new Array();
        for (let i = 0; i < invited_properties?.length; i++) {
            for (let j = 0; j < invited_properties[i].bids.length; j++) {
                if (invited_properties[i].bids[j].bids[0].status == 0) {
                    pending_offers.push(invited_properties[i])
                }
            }
        }
        this.setState({ pending_offers: pending_offers });

        const offers_sent = new Array();
        for (let i = 0; i < invited_properties?.length; i++) {
            for (let j = 0; j < invited_properties[i].bids.length; j++) {
                offers_sent.push(invited_properties[i])
            }
        }
        this.setState({ offers_sent: offers_sent });

        // Seller Dashboard
        var properties = await UserService.getCurrentUserProperties();
        var my_properties = [];
        var properties_ids = [];
        for(let i=0; i<properties.length; i++){
            if(!properties_ids.includes(properties[i].prop_id.toString())){
                properties_ids.push(properties[i].prop_id.toString())
                my_properties.push(properties[i])
            }
        }
        this.makePropertyData(my_properties);

        const seller_pending_offers = new Array();
        const seller_rejected_offers = new Array();
        const seller_accepted_offers = new Array();
        for (let i = 0; i < my_properties.length; i++) {
            if (my_properties[i].user_property[0].maxBid.bids) {
                if (my_properties[i].user_property[0].maxBid.bids[0].status == 0) {
                    seller_pending_offers.push(my_properties[i].user_property[0])
                } else if (my_properties[i].user_property[0].maxBid.bids[0].status == 1) {
                    seller_accepted_offers.push(my_properties[i].user_property[0])
                } else if (my_properties[i].user_property[0].maxBid.bids[0].status == -1) {
                    seller_rejected_offers.push(my_properties[i].user_property[0])
                }
            }
        }
        this.setState({
            seller_pending_offers: seller_pending_offers,
            seller_rejected_offers: seller_rejected_offers,
            seller_accepted_offers: seller_accepted_offers
        })
        this.setState({ name, last_name, stats: response, businessProfile: response?.businessProfile });
        this.setState({ name, last_name, buying: response?.buying });
        this.setState({ name, last_name, selling: response?.selling });
        this.setState({ name, last_name, transactions_in_process: response?.transactions_in_process });


        // Realtor Dashboard
        const userProfile = await UserService.getCurrentUserProfile();
        const my_buyers = await UserService.getClientList();
        const all_clients_with_buying_room = new Array();
        var client_emails = [];
        for (let i = 0; i < my_buyers.length; i++) {
            if (my_buyers[i].client.to_email!= userProfile.userProfile.email) {
                my_buyers[i].buying_room = new Array();
                var get_client_buying_room = await UserService.getUserBuyingRoom(my_buyers[i].client.id);

                if (get_client_buying_room.length > 0) {
                    my_buyers[i].buying_room = get_client_buying_room[0];
                }

                if (my_buyers[i].client.email && !client_emails.includes(my_buyers[i].client.email)) {
                    client_emails.push(my_buyers[i].client.email)
                    all_clients_with_buying_room.push(my_buyers[i])
                } else if(my_buyers[i].client.to_email && !client_emails.includes(my_buyers[i].client.to_email)){
                    client_emails.push(my_buyers[i].client.to_email)
                    all_clients_with_buying_room.push(my_buyers[i])
                }
            }
        }

        this.setState({ my_buyers: all_clients_with_buying_room });   

        // Lender Dashboard
        const lender_clients_started = new Array();
        const lender_clients_pre_approved = new Array();
        for (let i = 0; i < my_buyers.length; i++) {
            if (my_buyers[i].invitionsLendersRealters && my_buyers[i].invitionsLendersRealters.length > 0) {
                lender_clients_pre_approved.push(my_buyers[i])
            } else {
                lender_clients_started.push(my_buyers[i])
            }
        }

        this.setState({ lender_clients_started: lender_clients_started })
        this.setState({ lender_clients_pre_approved: lender_clients_pre_approved })
    }

    getHour = () => {
        const date = new Date();
        const hour = date.getHours();
        this.setState({ hour });
    }
    showbuyinglist = () => {
        if (this.state.showbuyingliststate == true) {
            this.setState({ showbuyingliststate: false })
        } else {
            this.setState({ showbuyingliststate: true })
        }
    }
    showsellinglist = () => {
        if (this.state.showsellingliststate == true) {
            this.setState({ showsellingliststate: false })
        } else {
            this.setState({ showsellingliststate: true })
        }
    }

    sellerbtnclicked = async () => {
        localStorage.setItem("type", "Seller");
        await this.setState({ radiobtnstatus: "Seller" });
        this.state.childElement.current.changeSellerRole();
    }
    buyerbtnclicked = async () => {
        localStorage.setItem("type", "Buyer");
        await this.setState({ radiobtnstatus: "Buyer" })
        this.state.childElement.current.changeSellerRole();
    }

    clickonindicator = async () => {
        if (this.state.radiobtnstatus == "Buyer") {
            localStorage.setItem("type", "Seller");
            await this.setState({ radiobtnstatus: "Seller" });
            this.state.childElement.current.changeSellerRole();
        } else {
            localStorage.setItem("type", "Buyer");
            await this.setState({ radiobtnstatus: "Buyer" })
            this.state.childElement.current.changeSellerRole();
        }
    }

    async downloadFile(fileName) {
        try {
            const formData = new FormData();
            formData.append('fileName', fileName);

            const response = await UserService.downloadPreApprovFile(formData);
            const link = document.createElement('a');
            if (response && response.length > 0) {
                link.href = response;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
            } else {
                toast.error('File not Found!');
            }

        } catch (error) {
            toast.error('File not Found!');
        }
    }

    handleChange(tags) {
        this.setState({ tags });
    }

    showInvitationModal = () => {
        this.setState({ tags: [] });
        if (this.state.showInvitationModalState == true) {
            this.setState({ showInvitationModalState: false })
        } else {
            this.setState({ showInvitationModalState: true })
        }
    }

    async handleFormSubmit(event: any, prop: any) {
        event.preventDefault();
        this.setState({ invitationLoader: true });

        if (this.state['tags'].length > 0) {
            const data = {
                invitation: this.state['tags'],
                propId: 0,
                roleId: 2,
            };
            const response = await UserService.sendReferrals(data);
            if (response) {

                // this.setState({showInvitationModalState: false});
                // this.setState({invitationLoader: false});
                this.setState({ showInviteRealtorState: false });
                this.setState({ invitationLoader: false });
                toast.success("Referral Invitation Sent Successfuly", {
                    closeOnClick: true,
                    pauseOnHover: true,
                });

            } else {
                this.setState({ invitationLoader: false });
                toast.error("Something went wrong !");
            }
        } else {
            toast.error("No valid email provided !", { autoClose: false, });
            // this.setState({showInvitationModalState: false});
            // this.setState({invitationLoader: false});
            this.setState({ showInviteRealtorState: false });
            this.setState({ invitationLoader: false });
        }
    }

    showInviteRealtor(userRole) {
        if (userRole == 2) {
            this.setState({ invite_email_placeholder: 'Add Realtor Email' })
        } else {
            this.setState({ invite_email_placeholder: 'Add Lender Email' })
        }
        this.setState({ userRole: userRole })
        this.setState({ tags: [] });
        if (this.state.showInviteRealtorState == true) {
            this.setState({ showInviteRealtorState: false })
        } else {
            this.setState({ showInviteRealtorState: true })
        }
    }

    showConfirmPopup = () => {
        if (this.state.showConfirmPopupState == true) {
            this.setState({ showConfirmPopupState: false })
        } else {
            this.setState({ showConfirmPopupState: true })
        }
    }

    async handleInvitationFormSubmit(event: any, prop: any) {
        event.preventDefault();
        if (role_id == 3) {
            this.handleFormSubmit(event, prop);
        } else {
            this.setState({ invitationLoader: true });
            if (this.state['tags'].length > 0) {
                const data = {
                    invitation: this.state['tags'],
                    propId: 0,
                    roleId: this.state.userRole,
                };
                const response = await UserService.sendInvitations(data);
                if (response) {
                    if (response['data'] !== 0) {
                        const resp = await UserService.getUserActsList(this.state.userRole);
                        this.setState({ resp: resp });
                        this.setState({ showInviteRealtorState: false });
                        this.setState({ invitationLoader: false });
                        toast.success("Invitation Sent Successfuly", {
                            closeOnClick: true,
                            pauseOnHover: true,
                        });
                    }

                    if (response['onceInvited'].length > 0) {
                        response['onceInvited'].forEach((v) => {
                            toast.error("The user has already been invited: " + v.to_email, { autoClose: false, });
                        });
                        this.setState({ showInviteRealtorState: false });
                        this.setState({ invitationLoader: false });
                    }
                } else {
                    this.setState({ invitationLoader: false });
                    toast.error("Something went wrong !");
                }
            } else {
                toast.error("No valid email provided !", { autoClose: false, });
                this.setState({ showInviteRealtorState: false });
                this.setState({ invitationLoader: false });
            }
        }
    }

    showtable = async (value) => {
        var value = value;
        await this.setState({ showtablevalue: value });
        if (value == 5) {
            await UserService.updateUserNotifications();
        }
    }
    public closelistingbox = async () => {
        await this.setState({ showtablevalue: 6 });
    }


    render() {
        const EMAIL_VALIDATION_REGEX = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
        const priceSplitter = (number) => (number && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));

        const realtor_closed_deals = new Array();
        const deals_under_contract = new Array();
        const realtor_properties = new Array();
        for (let i = 0; i < this.state.my_properties.length; i++) {
            if (this.state.my_properties[i].progress_status == 'Completed !') {
                realtor_closed_deals.push(this.state.my_properties[i])
            } else{
                if(this.state.my_properties[i].status==1){
                    deals_under_contract.push(this.state.my_properties[i])
                }
                realtor_properties.push(this.state.my_properties[i])
            }
        }

        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar ref={this.state.childElement} handler={this.handler}></SideBar>


                <section className="section">
                    <div className="new-dashboard-page">
                        <div className="ndp-message-toggle-btn-row">
                            <h3>
                                <Trans>{this.state.hour < 12 ? `Good Morning` : this.state.hour >= 12 && this.state.hour < 15 ? `Good Afternoon` : `Good Evening`}</Trans> {this.state.name}!
                            </h3>
                            <div className="ndp-right-box">
                                {!this.state['businessProfile'] ?
                                    <div className="alert alert-warning" role="alert"><Link to="/edit-profile"><Trans>Please complete your business profile</Trans></Link></div> : null
                                }
                                {role_id != 2 && role_id != 3 ?
                                    <div className="switch">
                                        <input onClick={this.buyerbtnclicked}
                                            checked={this.state.radiobtnstatus === "Buyer"} type="radio" id="buyer"
                                            name="switch-one" value="Buyer1" />
                                        <label htmlFor="buyer" className="switch__label switch__label_yes"><Trans>Buyer</Trans></label>
                                        <div className="radiobtnbox">
                                        <div className="radio-button-line" onClick={this.clickonindicator}></div>
                                        <div className="switch__indicator" onClick={this.clickonindicator}></div>
                                        </div>
                                        <input onClick={this.sellerbtnclicked}
                                            checked={this.state.radiobtnstatus === "Seller"} type="radio" id="seller"
                                            name="switch-one" value="Seller" />
                                        <label htmlFor="seller" className="switch__label switch__label_no"><Trans>Seller</Trans></label>
                                    </div> : null
                                }
                            </div>
                        </div>
                        <div className="ndp-buttons-row">
                            {
                                (role_id == 1) && (this.state.radiobtnstatus == "Buyer") ?
                                    <div className="ndp-button">
                                        <Link to="/view-profile">
                                            <img src="images/viewprofile.png" />
                                            <span><Trans>View Profile</Trans></span>
                                        </Link>
                                    </div> :
                                (role_id == 3) ?
                                    <div className="ndp-button">
                                        <Link to="/view-profile">
                                            <img src="images/viewprofile.png" />
                                            <span><Trans>View Profile</Trans></span>
                                        </Link>
                                    </div> :
                                <div className="ndp-button">
                                    <Link to="/submit-property">
                                        <img src="images/add.png" />
                                        <span><Trans>Create Listing</Trans></span>
                                    </Link>
                                </div>
                            }

                            { role_id===1 ?
                                <>
                                    <div className="ndp-button margin-left-auto">
                                        <Link to="#!" onClick={() => this.showInviteRealtor(3)}>
                                            <img src="images/invite.png" alt="" />
                                            <span><Trans>Invite Lender</Trans></span>
                                        </Link>
                                    </div>
                                    <div className="ndp-button">
                                        <Link to="#!" onClick={() => this.showInviteRealtor(2)}>
                                            <img src="images/invite.png" alt="" />
                                            <span><Trans>Invite Realtor</Trans></span>
                                        </Link>
                                    </div>
                                </>
                            : null }
                            
                        </div>

                        {(this.state.radiobtnstatus == "Buyer") && (role_id == 1) && (
                            <div className="ndp-dashboard-listing-box">
                                <ul className="ndp-dashboard-listing">
                                    <li className={` ${this.state.showtablevalue == "1" ? "ndp-dl-big-box active" : "ndp-dl-big-box"}`}
                                        onClick={() => this.showtable(1)} id="greenbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/Home.png" />
                                            </div>
                                            <b>{this.state['invited_properties'].length}</b>
                                        </div>
                                        <span><Trans>Properties of Interest</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "2" ? "ndp-dl-big-box active" : "ndp-dl-big-box"}`}
                                        onClick={() => this.showtable(2)} id="greenbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/ionic-ios-paper.png" />
                                            </div>
                                            <b>{this.state.pending_offers.length}</b>
                                        </div>
                                        <span><Trans>Pending Offers</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "3" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(3)} id="bluebox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/blue-home.png" />
                                            </div>
                                            <b>{this.state.offers_sent.length}</b>
                                        </div>
                                        <span><Trans>Offers Sent</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "4" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(4)} id="orangebox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/in-process.png" />
                                            </div>
                                            <b>{this.state.accepted_offers.length}</b>
                                        </div>
                                        <span><Trans>Transactions in Progress</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "5" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(5)} id="peachbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/peach-home.png" />
                                            </div>
                                            <b>{this.state.notifications_count}</b>
                                        </div>
                                        <span><Trans>Needs Action</Trans></span>
                                    </li>
                                </ul>
                                <ul className="ndp-dashboard-content-listing">
                                    <li className={` ${this.state.showtablevalue == "1" ? "active" : ""}`}
                                        id="greenbox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Property Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Amount</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state['invited_properties'].map((prop, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{prop.title}</td>
                                                            <td>{prop.address + ', ' + prop.city + ', ' + prop.state}</td>
                                                            <td>${priceSplitter(prop.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                <Link to={'property-detail/' + prop.id}>
                                                                    <Trans>View Full Detail</Trans>
                                                                </Link>
                                                                {(prop.status == 1) ?
                                                                    <Link to={"/buying-room/" + prop.id}><Trans>Transaction Table</Trans></Link>
                                                                : null}
                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "2" ? "active" : ""}`}
                                        id="greenbox2">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Property Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Price</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state['pending_offers'].map((offer, i) => {
                                                        return <tr>
                                                            <td>{i + 1}</td>
                                                            <td>{offer.title}</td>
                                                            <td>{offer.address + ', ' + offer.city + ', ' + offer.state}</td>
                                                            <td>${priceSplitter(offer.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                <Link to={'property-detail/' + offer.id}>
                                                                    <Trans>View Full Detail</Trans>
                                                                </Link>
                                                                <Link to={'/properties-invitations'}>
                                                                    <Trans>View Offers</Trans>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "3" ? "active" : ""}`} id="bluebox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Property Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Price</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state['offers_sent'].map((offer, i) => {
                                                        return <tr>
                                                            <td>{i + 1}</td>
                                                            <td>{offer.title}</td>
                                                            <td>{offer.address + ', ' + offer.city + ', ' + offer.state}</td>
                                                            <td>${priceSplitter(offer.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                <Link to={'property-detail/' + offer.id}>
                                                                    <Trans>View Full Detail</Trans>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "4" ? "active" : ""}`}
                                        id="orangebox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Property Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Price</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state['accepted_offers'].map((offer, i) => {
                                                        return <tr>
                                                            <td>{i + 1}</td>
                                                            <td>{offer.title}</td>
                                                            <td>{offer.address + ', ' + offer.city + ', ' + offer.state}</td>
                                                            <td>${priceSplitter(offer.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                {/* <Link to={'property-detail/' + offer.id}>
                                                                <Trans>View Detail</Trans>
                                                            </Link> */}
                                                                {(offer.status == 1) ?
                                                                    <Link to={"/buying-room/" + offer.id}><Trans>Transaction Table</Trans></Link>
                                                                    : null}

                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "5" ? "active" : ""}`}
                                        id="peachbox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Title</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state['notifications'].map((noti, i) => {
                                                        return noti.notification_text ? <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            {noti.notification_type == 1 || noti.notification_type == 4 || noti.notification_type == 5 || (noti.notification_type == 6 && (noti.receiver == 'seller' || noti.receiver == 'buyer')) ?
                                                                global['sellerRole'] == role_id ?
                                                                    noti.notification_type == 1 || noti.notification_type == 5 ?
                                                                        <td><Link to={'/properties-invitations'}>{noti.notification_text}</Link></td> :
                                                                        noti.receiver == 'seller' || noti.receiver == 'buyer' ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            <td><Link to={'/my-properties'}>{noti.notification_text}</Link></td>
                                                                    :
                                                                    <td><a>{noti.notification_text} <b> <Trans>Please login as User</Trans></b></a></td>
                                                                : noti.notification_type == 3 ?
                                                                    global['lenderRole'] == role_id ?
                                                                        <td><Link to={'/client-list'}>{noti.notification_text}</Link></td> :
                                                                        (noti.notification_type == 6 && noti.receiver == 'lender') ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            <td><a>{noti.notification_text}<b> <Trans>Please login as Lender</Trans></b></a></td>
                                                                    : noti.notification_type == 2 || (noti.notification_type == 6 && noti.receiver == 'realtor') ?
                                                                        (global['realtorRole'] == role_id && noti.notification_type == 6 && noti.receiver == 'realtor') ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            (global['realtorRole'] == role_id && noti.notification_type != 6) ?
                                                                                <td><Link to={'/client-list'}>{noti.notification_text}</Link></td> :
                                                                                <td><a>{noti.notification_text}<b> <Trans>Please login as Realtor</Trans></b></a></td>
                                                                        : <td>{noti.notification_text}</td>
                                                            }
                                                        </tr>
                                                            : null
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {(this.state.radiobtnstatus == "Seller") && (role_id == 1) && (
                            <div className="ndp-dashboard-listing-box">
                                <ul className="ndp-dashboard-listing">
                                    <li className={` ${this.state.showtablevalue == "1" ? "ndp-dl-big-box active" : "ndp-dl-big-box"}`}
                                        onClick={() => this.showtable(1)} id="greenbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/Home.png" />
                                            </div>
                                            <b>{this.state['my_properties'].length}</b>
                                        </div>
                                        <span><Trans>Listed Properties</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "2" ? "ndp-dl-big-box active" : "ndp-dl-big-box"}`}
                                        onClick={() => this.showtable(2)} id="greenbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/ionic-ios-paper.png" />
                                            </div>
                                            <b>{this.state.seller_pending_offers.length}</b>
                                        </div>
                                        <span><Trans>Pending Offers</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "3" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(3)} id="bluebox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/blue-home.png" />
                                            </div>
                                            <b>{this.state.seller_rejected_offers.length}</b>
                                        </div>
                                        <span><Trans>Rejected Offers</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "4" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(4)} id="orangebox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/in-process.png" />
                                            </div>
                                            <b>{this.state.seller_accepted_offers.length}</b>
                                        </div>
                                        <span><Trans>Transactions in Progress</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "5" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(5)} id="peachbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/peach-home.png" />
                                            </div>
                                            <b>{this.state.notifications_count}</b>
                                        </div>
                                        <span><Trans>Needs Action</Trans></span>
                                    </li>
                                </ul>
                                <ul className="ndp-dashboard-content-listing">
                                    <li className={` ${this.state.showtablevalue == "1" ? "active" : ""}`}
                                        id="greenbox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Property Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Amount</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state['my_properties'].map((prop, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{prop.title}</td>
                                                            <td>{prop.address + ', ' + prop.city + ', ' + prop.state}</td>
                                                            <td>${priceSplitter(prop.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                <Link to={'property-detail/' + prop.id}>
                                                                    <Trans>View Full Detail</Trans>
                                                                </Link>
                                                                {(prop.status == 1) ?
                                                                    <Link to={"/buying-room/" + prop.id}><Trans>Transaction Table</Trans></Link>
                                                                    : null}
                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "2" ? "active" : ""}`}
                                        id="greenbox2">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Property Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Amount</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state['seller_pending_offers'].map((prop, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{prop.title}</td>
                                                            <td>{prop.address + ', ' + prop.city + ', ' + prop.state}</td>
                                                            <td>${priceSplitter(prop.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                <Link to={'property-detail/' + prop.id}>
                                                                    <Trans>View Full Detail</Trans>
                                                                </Link>
                                                                <Link to={'/my-properties'}>
                                                                    <Trans>View Offers</Trans>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    })}

                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "3" ? "active" : ""}`} id="bluebox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Property Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Amount</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state['seller_rejected_offers'].map((prop, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{prop.title}</td>
                                                            <td>{prop.address + ', ' + prop.city + ', ' + prop.state}</td>
                                                            <td>${priceSplitter(prop.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                <Link to={'property-detail/' + prop.id}>
                                                                    <Trans>View Full Detail</Trans>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "4" ? "active" : ""}`}
                                        id="orangebox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Property Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Amount</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.seller_accepted_offers.map((prop, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{prop.title}</td>
                                                            <td>{prop.address + ', ' + prop.city + ', ' + prop.state}</td>
                                                            <td>${priceSplitter(prop.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                {/* <Link to={'property-detail/' + prop.id}>
                                                                <Trans>View Detail</Trans>
                                                            </Link> */}
                                                                {(prop.status == 1) ?
                                                                    <Link to={"/buying-room/" + prop.id}><Trans>Transaction Table</Trans></Link>
                                                                    : null}

                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "5" ? "active" : ""}`}
                                        id="peachbox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Title</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state['notifications'].map((noti, i) => {
                                                        return noti.notification_text ? <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            {noti.notification_type == 1 || noti.notification_type == 4 || noti.notification_type == 5 || (noti.notification_type == 6 && (noti.receiver == 'seller' || noti.receiver == 'buyer')) ?
                                                                global['sellerRole'] == role_id ?
                                                                    noti.notification_type == 1 || noti.notification_type == 5 ?
                                                                        <td><Link to={'/properties-invitations'}>{noti.notification_text}</Link></td> :
                                                                        noti.receiver == 'seller' || noti.receiver == 'buyer' ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            <td><Link to={'/my-properties'}>{noti.notification_text}</Link></td>
                                                                    :
                                                                    <td><a>{noti.notification_text} <b> <Trans>Please login as User</Trans></b></a></td>
                                                                : noti.notification_type == 3 ?
                                                                    global['lenderRole'] == role_id ?
                                                                        <td><Link to={'/client-list'}>{noti.notification_text}</Link></td> :
                                                                        (noti.notification_type == 6 && noti.receiver == 'lender') ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            <td><a>{noti.notification_text}<b> <Trans>Please login as Lender</Trans></b></a></td>
                                                                    : noti.notification_type == 2 || (noti.notification_type == 6 && noti.receiver == 'realtor') ?
                                                                        (global['realtorRole'] == role_id && noti.notification_type == 6 && noti.receiver == 'realtor') ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            (global['realtorRole'] == role_id && noti.notification_type != 6) ?
                                                                                <td><Link to={'/client-list'}>{noti.notification_text}</Link></td> :
                                                                                <td><a>{noti.notification_text}<b> <Trans>Please login as Realtor</Trans></b></a></td>
                                                                        : <td>{noti.notification_text}</td>
                                                                }
                                                            </tr>
                                                        : null
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {(role_id == 3) && (
                            <div className="ndp-dashboard-listing-box">
                                <ul className="ndp-dashboard-listing">
                                    <li className={` ${this.state.showtablevalue == "1" ? "ndp-dl-big-box active" : "ndp-dl-big-box"}`}
                                        onClick={() => this.showtable(1)} id="greenbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/Home.png" />
                                            </div>
                                            <b>{this.state.my_buyers.length}</b>
                                        </div>
                                        <span><Trans>All Clients</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "2" ? "ndp-dl-big-box active" : "ndp-dl-big-box"}`}
                                        onClick={() => this.showtable(2)} id="greenbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/ionic-ios-paper.png" />
                                            </div>
                                            <b>{this.state.lender_clients_started.length}</b>
                                        </div>
                                        <span><Trans>Leads</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "3" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(3)} id="bluebox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/blue-home.png" />
                                            </div>
                                            <b>{this.state.lender_clients_pre_approved.length}</b>
                                        </div>
                                        <span><Trans>Pre-Approved</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "4" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(4)} id="orangebox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/in-process.png" />
                                            </div>
                                            <b>{this.state.seller_accepted_offers.length}</b>
                                        </div>
                                        <span><Trans>In Proccess</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "5" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(5)} id="peachbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/peach-home.png" />
                                            </div>
                                            <b>{this.state.notifications_count}</b>
                                        </div>
                                        <span><Trans>Needs Action</Trans></span>
                                    </li>
                                </ul>
                                <ul className="ndp-dashboard-content-listing">
                                    <li className={` ${this.state.showtablevalue == "1" ? "active" : ""}`}
                                        id="greenbox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="lender-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Client Name</Trans></th>
                                                        <th><Trans>Client Email</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.my_buyers.map((user, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{user.client.name ? user.client.name + ' ' + user.client.last_name : ''}</td>
                                                            <td>{user.client.email ? user.client.email : user.client.to_email}</td>
                                                            <td>
                                                                {user.invitionsLendersRealters && user.invitionsLendersRealters.length > 0 ?
                                                                    <div className="rt-btns-box w-50">
                                                                        {user.invitionsLendersRealters && user.invitionsLendersRealters.length > 0 ?
                                                                            <Link to={'/submit-pre-approvals/' + user.client.id}><span className="pre-mortgage-dollar-sign">$</span></Link> : null
                                                                        }
                                                                        <a href="javascript:void(0)" role="menuitem" className="rt-icon-image" style={{ float: 'none' }}
                                                                            onClick={() => this.downloadFile(user.invitionsLendersRealters[0]['document_name'])} >
                                                                            <img src="../images/document-download.png" />
                                                                        </a>

                                                                        {global['realtorRole'] != role_id && (!user.invitionsLendersRealters || user.invitionsLendersRealters.length <= 0) ?
                                                                            <Link role="menuitem"
                                                                                className="rt-start-conver-btn"
                                                                                to={'/submit-pre-approvals/' + user.client.id}>
                                                                                <Trans>Pre-Approval</Trans>
                                                                            </Link> : null
                                                                        }
                                                                        <a href={"tel:" + user.client.mobile_number}
                                                                            className="rt-icon-image">
                                                                            <img src="../images/call-icon.png" />
                                                                        </a>
                                                                        <Link to={"/inbox?user_id=" + user.client.id}
                                                                            role="menuitem" className="rt-icon-image">
                                                                            <img src="../images/chat-icon.png" />
                                                                        </Link>
                                                                    </div> :
                                                                    <div className="rt-btns-box w-75">
                                                                        {user.invitionsLendersRealters && user.invitionsLendersRealters.length > 0 ?
                                                                            <a href="javascript:void(0)" onClick={() => this.downloadFile(user.invitionsLendersRealters[0]['document_name'])}><span className="pre-mortgage-dollar-sign">$</span></a> : null
                                                                        }
                                                                        {global['realtorRole'] != role_id && (!user.invitionsLendersRealters || user.invitionsLendersRealters.length <= 0) ?
                                                                            <Link role="menuitem"
                                                                                className="rt-start-conver-btn"
                                                                                to={'/submit-pre-approvals/' + user.client.id}>
                                                                                <Trans>Pre-Approval</Trans>
                                                                            </Link> : null
                                                                        }
                                                                        <a href={"tel:" + user.client.mobile_number}
                                                                            className="rt-icon-image">
                                                                            <img src="../images/call-icon.png" />
                                                                        </a>
                                                                        <Link to={"/inbox?user_id=" + user.client.id}
                                                                            role="menuitem" className="rt-icon-image">
                                                                            <img src="../images/chat-icon.png" />
                                                                        </Link>
                                                                    </div>
                                                                }
                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "2" ? "active" : ""}`}
                                        id="greenbox2">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="lender-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Client Name</Trans></th>
                                                        <th><Trans>Client Email</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.lender_clients_started.map((user, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{user.client.name ? user.client.name + ' ' + user.client.last_name : ''}</td>
                                                            <td>{user.client.email ? user.client.email : user.client.to_email}</td>
                                                            <td>
                                                                <div className="rt-btns-box">
                                                                    {user.invitionsLendersRealters && user.invitionsLendersRealters.length > 0 ?
                                                                        <a href="javascript:void(0)" onClick={() => this.downloadFile(user.invitionsLendersRealters[0]['document_name'])}><span className="pre-mortgage-dollar-sign">$</span></a> : null
                                                                    }
                                                                    {global['realtorRole'] != role_id && (!user.invitionsLendersRealters || user.invitionsLendersRealters.length <= 0) ?
                                                                        <Link role="menuitem"
                                                                            className="rt-start-conver-btn"
                                                                            to={'/submit-pre-approvals/' + user.client.id}>
                                                                            <Trans>Pre-Approval</Trans>
                                                                        </Link> : null
                                                                    }
                                                                    <a href={"tel:" + user.client.mobile_number}
                                                                        className="rt-icon-image">
                                                                        <img src="../images/call-icon.png" />
                                                                    </a>
                                                                    <Link to={"/inbox?user_id=" + user.client.id}
                                                                        role="menuitem" className="rt-icon-image">
                                                                        <img src="../images/chat-icon.png" />
                                                                    </Link>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "3" ? "active" : ""}`} id="bluebox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="lender-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Client Name</Trans></th>
                                                        <th><Trans>Client Email</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.lender_clients_pre_approved.map((user, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{user.client.name ? user.client.name + ' ' + user.client.last_name : ''}</td>
                                                            <td>{user.client.email ? user.client.email : user.client.to_email}</td>
                                                            <td>
                                                                <div className="rt-btns-box">
                                                                    {user.invitionsLendersRealters && user.invitionsLendersRealters.length > 0 ?
                                                                        <Link to={'/submit-pre-approvals/' + user.client.id}><span className="pre-mortgage-dollar-sign">$</span></Link> : null
                                                                    }
                                                                    <a href="javascript:void(0)" role="menuitem" className="rt-icon-image" style={{ float: 'none' }}
                                                                        onClick={() => this.downloadFile(user.invitionsLendersRealters[0]['document_name'])} >
                                                                        <img src="../images/document-download.png" />
                                                                    </a>
                                                                    {global['realtorRole'] != role_id && (!user.invitionsLendersRealters || user.invitionsLendersRealters.length <= 0) ?
                                                                        <Link role="menuitem"
                                                                            className="rt-start-conver-btn"
                                                                            to={'/submit-pre-approvals/' + user.client.id}>
                                                                            <Trans>Pre-Approval</Trans>
                                                                        </Link> : null
                                                                    }
                                                                    <a href={"tel:" + user.client.mobile_number}
                                                                        className="rt-icon-image">
                                                                        <img src="../images/call-icon.png" />
                                                                    </a>
                                                                    <Link to={"/inbox?user_id=" + user.client.id}
                                                                        role="menuitem" className="rt-icon-image">
                                                                        <img src="../images/chat-icon.png" />
                                                                    </Link>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "4" ? "active" : ""}`}
                                        id="orangebox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Property Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Amount</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.seller_accepted_offers.map((prop, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{prop.title}</td>
                                                            <td>{prop.address + ', ' + prop.city + ', ' + prop.state}</td>
                                                            <td>${priceSplitter(prop.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                <Link to={'property-detail/' + prop.id}>
                                                                    <Trans>View Full Detail</Trans>
                                                                </Link>
                                                                {(prop.status == 1) ?
                                                                    <Link to={"/buying-room/" + prop.id}><Trans>Transaction Table</Trans></Link>
                                                                    : null}
                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "5" ? "active" : ""}`}
                                        id="peachbox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Title</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state['notifications'].map((noti, i) => {
                                                        return noti.notification_text ? <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            {noti.notification_type == 1 || noti.notification_type == 4 || noti.notification_type == 5 || (noti.notification_type == 6 && (noti.receiver == 'seller' || noti.receiver == 'buyer')) ?
                                                                global['sellerRole'] == role_id ?
                                                                    noti.notification_type == 1 || noti.notification_type == 5 ?
                                                                        <td><Link to={'/properties-invitations'}>{noti.notification_text}</Link></td> :
                                                                        noti.receiver == 'seller' || noti.receiver == 'buyer' ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            <td><Link to={'/my-properties'}>{noti.notification_text}</Link></td>
                                                                    :
                                                                    <td><a>{noti.notification_text} <b> <Trans>Please login as User</Trans></b></a></td>
                                                                : noti.notification_type == 3 ?
                                                                    global['lenderRole'] == role_id ?
                                                                        <td><Link to={'/client-list'}>{noti.notification_text}</Link></td> :
                                                                        (noti.notification_type == 6 && noti.receiver == 'lender') ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            <td><a>{noti.notification_text}<b> <Trans>Please login as Lender</Trans></b></a></td>
                                                                    : noti.notification_type == 2 || (noti.notification_type == 6 && noti.receiver == 'realtor') ?
                                                                        (global['realtorRole'] == role_id && noti.notification_type == 6 && noti.receiver == 'realtor') ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            (global['realtorRole'] == role_id && noti.notification_type != 6) ?
                                                                                <td><Link to={'/client-list'}>{noti.notification_text}</Link></td> :
                                                                                <td><a>{noti.notification_text}<b> <Trans>Please login as Realtor</Trans></b></a></td>
                                                                        : <td>{noti.notification_text}</td>
                                                            }
                                                        </tr>
                                                            : null
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        )}


                        {(role_id == 2) && (
                            <div className="ndp-dashboard-listing-box">
                                <ul className="ndp-dashboard-listing">
                                    <li className={` ${this.state.showtablevalue == "1" ? "ndp-dl-big-box active" : "ndp-dl-big-box"}`}
                                        onClick={() => this.showtable(1)} id="greenbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/Home.png" />
                                            </div>
                                            <b>{realtor_properties.length}</b>
                                        </div>
                                        <span><Trans>My Listings</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "2" ? "ndp-dl-big-box active" : "ndp-dl-big-box"}`}
                                        onClick={() => this.showtable(2)} id="greenbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/ionic-ios-paper.png" />
                                            </div>
                                            <b>{this.state.my_buyers.length}</b>
                                        </div>
                                        <span><Trans>My Clients</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "3" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(3)} id="bluebox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/blue-home.png" />
                                            </div>
                                            <b>{deals_under_contract.length}</b>
                                        </div>
                                        <span><Trans>Deals Under Contract</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "4" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(4)} id="orangebox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/orange-home.png" />
                                            </div>
                                            <b>{realtor_closed_deals.length}</b>
                                        </div>
                                        <span><Trans>Closed Deals</Trans></span>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "5" ? "ndp-dl-small-box active" : "ndp-dl-small-box"}`}
                                        onClick={() => this.showtable(5)} id="peachbox">
                                        <div className="ndp-nl-icon-count-box">
                                            <div className="ndp-dl-icon-box">
                                                <img src="images/peach-home.png" />
                                            </div>
                                            <b>{this.state.notifications_count}</b>
                                        </div>
                                        <span><Trans>Needs Action</Trans></span>
                                    </li>
                                </ul>
                                <ul className="ndp-dashboard-content-listing">
                                    <li className={` ${this.state.showtablevalue == "1" ? "active" : ""}`}
                                        id="greenbox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Amount</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {realtor_properties.map((prop, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{prop.title}</td>
                                                            <td>{prop.address + ', ' + prop.city + ', ' + prop.state}</td>
                                                            <td>${priceSplitter(prop.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                <Link to={'property-detail/' + prop.id}>
                                                                    <Trans>View Full Detail</Trans>
                                                                </Link>
                                                                {(prop.status == 1) ?
                                                                    <Link to={"/buying-room/" + prop.id}><Trans>Transaction Table</Trans></Link>
                                                                    : null}

                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "2" ? "active" : ""}`}
                                        id="greenbox2">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Client Name</Trans></th>
                                                        <th><Trans>Client Email</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.my_buyers.map((user, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{user.client.name ? user.client.name + ' ' + user.client.last_name : ''}</td>
                                                            <td>{user.client.email ? user.client.email : user.client.to_email}</td>
                                                            <td>
                                                                <div className="rt-btns-box w-75">
                                                                    {user.invitionsLendersRealters && user.invitionsLendersRealters.length > 0 ?
                                                                       <a href="javascript:void(0)" onClick={() => this.downloadFile(user.invitionsLendersRealters[0]['document_name'])}><span className="pre-mortgage-dollar-sign">$</span></a> : null
                                                                    }
                                                                    <a href={"tel:" + user.client.mobile_number} className="rt-icon-image">
                                                                        <img src="../images/call-icon.png" />
                                                                    </a>
                                                                    <Link to={"/inbox?user_id=" + user.client.id} role="menuitem" className="rt-icon-image">
                                                                        <img src="../images/chat-icon.png" />
                                                                    </Link>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "3" ? "active" : ""}`} id="bluebox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Property Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Amount</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {deals_under_contract.map((prop, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{prop.title}</td>
                                                            <td>{prop.address + ', ' + prop.city + ', ' + prop.state}</td>
                                                            <td>${priceSplitter(prop.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                <Link to={'property-detail/' + prop.id}>
                                                                    <Trans>View Full Detail</Trans>
                                                                </Link>

                                                                {(prop.status == 1) ?
                                                                    <Link to={"/buying-room/" + prop.id}><Trans>Transaction Table</Trans></Link>
                                                                    : null}

                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "4" ? "active" : ""}`}
                                        id="orangebox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Property Title</Trans></th>
                                                        <th><Trans>Address</Trans></th>
                                                        <th><Trans>Amount</Trans></th>
                                                        <th><Trans>Action</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {realtor_closed_deals.map((prop, i) => {
                                                        return <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            <td>{prop.title}</td>
                                                            <td>{prop.address + ', ' + prop.city + ', ' + prop.state}</td>
                                                            <td>${priceSplitter(prop.price)}</td>
                                                            <td className="mpll-btn-row">
                                                                <Link to={'property-detail/' + prop.id}>
                                                                    <Trans>View Full Detail</Trans>
                                                                </Link>
                                                                {(prop.status == 1) ?
                                                                    <Link to={"/buying-room/" + prop.id}><Trans>Transaction Table</Trans></Link>
                                                                    : null}

                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                    <li className={` ${this.state.showtablevalue == "5" ? "active" : ""}`}
                                        id="peachbox">
                                        <div className="ndp-dc-button-row">
                                            <span><Trans>Sort Status</Trans></span>
                                            <span><Trans>Sort Role</Trans></span>
                                            <span><Trans>Sort Time</Trans></span>
                                            <div className="ndp-dc-close-btn" onClick={this.closelistingbox}>
                                                <img src="images/closemenu.png" />
                                            </div>
                                        </div>
                                        <div className="ndp-dc-table-box">
                                            <table className="ndp-dc-table">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th><Trans>Title</Trans></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state['notifications'].map((noti, i) => {
                                                        return noti.notification_text ? <tr key={i}>
                                                            <td>{i + 1}</td>
                                                            {noti.notification_type == 1 || noti.notification_type == 4 || noti.notification_type == 5 || (noti.notification_type == 6 && (noti.receiver == 'seller' || noti.receiver == 'buyer')) ?
                                                                global['sellerRole'] == role_id ?
                                                                    noti.notification_type == 1 || noti.notification_type == 5 ?
                                                                        <td><Link to={'/properties-invitations'}>{noti.notification_text}</Link></td> :
                                                                        noti.receiver == 'seller' || noti.receiver == 'buyer' ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            <td><Link to={'/my-properties'}>{noti.notification_text}</Link></td>
                                                                    :
                                                                    <td><a>{noti.notification_text} <b> <Trans>Please login as User</Trans></b></a></td>
                                                                : noti.notification_type == 3 ?
                                                                    global['lenderRole'] == role_id ?
                                                                        <td><Link to={'/client-list'}>{noti.notification_text}</Link></td> :
                                                                        (noti.notification_type == 6 && noti.receiver == 'lender') ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            <td><a>{noti.notification_text}<b> <Trans>Please login as Lender</Trans></b></a></td>
                                                                    : noti.notification_type == 2 || (noti.notification_type == 6 && noti.receiver == 'realtor') ?
                                                                        (global['realtorRole'] == role_id && noti.notification_type == 6 && noti.receiver == 'realtor') ?
                                                                            <td><Link to={`/buying-room/${noti.property_id}`}>{noti.notification_text}</Link></td> :
                                                                            (global['realtorRole'] == role_id && noti.notification_type != 6) ?
                                                                                <td><Link to={'/client-list'}>{noti.notification_text}</Link></td> :
                                                                                <td><a>{noti.notification_text}<b> <Trans>Please login as Realtor</Trans></b></a></td>
                                                                        : <td>{noti.notification_text}</td>
                                                            }
                                                        </tr>
                                                            : null
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* <div className="dp-message-status-row">
                            <div>
                                <input onClick={this.showInvitationModal}
                                    checked={true} type="radio" id="radio-three"
                                    name="switch-one1" value="Buyer11" />
                                <label htmlFor="radio-three">Send Referral</label>
                            </div>
                        </div> */}


                        {
                            role_id != 3 ?
                                <ul className={`dashboard-button-listing disnone ${this.state.radiobtnstatus != "Buyer" ? "" : "dashboard-button-listing-only3"}`}>
                                    {(this.state.radiobtnstatus == "Seller") && (
                                        <li>
                                            <div className="dbl-icon-number">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                                    width="512"
                                                    height="512">
                                                    <g id="Document">
                                                        <path
                                                            d="M429.657,74.343l-64-64A8,8,0,0,0,360,8H88a8,8,0,0,0-8,8V496a8,8,0,0,0,8,8H424a8,8,0,0,0,8-8V80A8,8,0,0,0,429.657,74.343ZM368,35.313,404.687,72H368ZM96,488V24H352V80a8,8,0,0,0,8,8h56V488Z" />
                                                        <path d="M152,464H112a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Z" />
                                                        <path d="M184,464h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z" />
                                                        <path
                                                            d="M384,120H128a8,8,0,0,0-8,8v32a8,8,0,0,0,8,8H384a8,8,0,0,0,8-8V128A8,8,0,0,0,384,120Zm-8,32H136V136H376Z" />
                                                        <path
                                                            d="M384,184H128a8,8,0,0,0-8,8v32a8,8,0,0,0,8,8H384a8,8,0,0,0,8-8V192A8,8,0,0,0,384,184Zm-8,32H136V200H376Z" />
                                                        <path
                                                            d="M384,248H128a8,8,0,0,0-8,8v32a8,8,0,0,0,8,8H384a8,8,0,0,0,8-8V256A8,8,0,0,0,384,248Zm-8,32H136V264H376Z" />
                                                        <path d="M280,312H128a8,8,0,0,0,0,16H280a8,8,0,0,0,0-16Z" />
                                                        <path d="M232,336H128a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16Z" />
                                                        <path d="M144,376a8,8,0,0,0,0-16H128a8,8,0,0,0,0,16Z" />
                                                        <path d="M176,376a8,8,0,0,0,0-16h-8a8,8,0,0,0,0,16Z" />
                                                    </g>
                                                </svg>
                                                <span>{this.state.stats.listed_properties}</span>
                                            </div>
                                            <div className="dbl-title"><Trans>My Listed Properties</Trans></div>
                                            <a href={"/my-properties/"}>
                                                <Trans>View Details</Trans>
                                                <img src="../images/nextarrow.png" />
                                            </a>
                                        </li>
                                    )}
                                    <li>
                                        <div className="dbl-icon-number">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                                width="512"
                                                height="512">
                                                <g id="Setting">
                                                    <path
                                                        d="M429.657,74.343l-64-64A8,8,0,0,0,360,8H88a8,8,0,0,0-8,8V496a8,8,0,0,0,8,8H424a8,8,0,0,0,8-8V80A8,8,0,0,0,429.657,74.343ZM368,35.313,404.687,72H368ZM96,488V24H352V80a8,8,0,0,0,8,8h56V488Z" />
                                                    <path d="M152,464H112a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Z" />
                                                    <path d="M184,464h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z" />
                                                    <path
                                                        d="M392,216H286.987a32,32,0,0,0-61.974,0H120a8,8,0,0,0,0,16H225.013a32,32,0,0,0,61.974,0H392a8,8,0,0,0,0-16ZM256,240a16,16,0,1,1,16-16A16.019,16.019,0,0,1,256,240Z" />
                                                    <path
                                                        d="M392,344H222.987a32,32,0,0,0-61.974,0H120a8,8,0,0,0,0,16h41.013a32,32,0,0,0,61.974,0H392a8,8,0,0,0,0-16ZM192,368a16,16,0,1,1,16-16A16.019,16.019,0,0,1,192,368Z" />
                                                    <path
                                                        d="M392,152H350.987a32,32,0,0,0-61.974,0H120a8,8,0,0,0,0,16H289.013a32,32,0,0,0,61.974,0H392a8,8,0,0,0,0-16Zm-72,24a16,16,0,1,1,16-16A16.019,16.019,0,0,1,320,176Z" />
                                                    <path
                                                        d="M392,280H350.987a32,32,0,0,0-61.974,0H120a8,8,0,0,0,0,16H289.013a32,32,0,0,0,61.974,0H392a8,8,0,0,0,0-16Zm-72,24a16,16,0,1,1,16-16A16.019,16.019,0,0,1,320,304Z" />
                                                </g>
                                            </svg>
                                            <span>{this.state.stats?.offers_received}</span>
                                        </div>
                                        <div className="dbl-title"><Trans>My Pending Offers</Trans></div>
                                        <a href={"/my-properties/"}>
                                            <Trans>View Details</Trans>
                                            <img src="../images/nextarrow.png" />
                                        </a>
                                    </li>
                                    {(this.state.radiobtnstatus == "Seller") && (
                                        <li>
                                            <div className="dbl-icon-number">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                                    width="512"
                                                    height="512">
                                                    <g id="Download">
                                                        <path d="M112,464H72a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Z" />
                                                        <path d="M144,464h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z" />
                                                        <path
                                                            d="M88,152H344a8,8,0,0,0,8-8V112a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,152Zm8-32H336v16H96Z" />
                                                        <path
                                                            d="M88,216H344a8,8,0,0,0,8-8V176a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,216Zm8-32H336v16H96Z" />
                                                        <path
                                                            d="M88,280H344a8,8,0,0,0,8-8V240a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,280Zm8-32H336v16H96Z" />
                                                        <path d="M240,296H88a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16Z" />
                                                        <path d="M192,320H88a8,8,0,0,0,0,16H192a8,8,0,0,0,0-16Z" />
                                                        <path d="M104,360a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16Z" />
                                                        <path d="M136,360a8,8,0,0,0,0-16h-8a8,8,0,0,0,0,16Z" />
                                                        <path
                                                            d="M480,384a96.127,96.127,0,0,0-88-95.664V80a8,8,0,0,0-2.343-5.657l-64-64A8,8,0,0,0,320,8H48a8,8,0,0,0-8,8V496a8,8,0,0,0,8,8H384a8,8,0,0,0,8-8V479.664A96.127,96.127,0,0,0,480,384ZM328,35.313,364.687,72H328ZM56,488V24H312V80a8,8,0,0,0,8,8h56V288.336a96,96,0,0,0,0,191.328V488Zm328-24a80,80,0,1,1,80-80A80.091,80.091,0,0,1,384,464Z" />
                                                        <path
                                                            d="M432,376H416V336a8,8,0,0,0-8-8H360a8,8,0,0,0-8,8v40H336a8,8,0,0,0-5.657,13.657l48,48a8,8,0,0,0,11.314,0l48-48A8,8,0,0,0,432,376Zm-48,44.687L355.313,392H360a8,8,0,0,0,8-8V344h32v40a8,8,0,0,0,8,8h4.687Z" />
                                                    </g>
                                                </svg>
                                                <span>{this.state.stats.offers_received}</span>
                                            </div>
                                            <div className="dbl-title"><Trans>Offers to Review</Trans></div>
                                            <a href={"/my-properties/"}>
                                                <Trans>View Details</Trans>
                                                <img src="../images/nextarrow.png" />
                                            </a>
                                        </li>
                                    )}
                                    <li>
                                        <div className="dbl-icon-number">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                                width="512"
                                                height="512">
                                                <g id="Accept">
                                                    <path d="M112,464H72a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Z" />
                                                    <path d="M144,464h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z" />
                                                    <path
                                                        d="M88,152H344a8,8,0,0,0,8-8V112a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,152Zm8-32H336v16H96Z" />
                                                    <path
                                                        d="M88,216H344a8,8,0,0,0,8-8V176a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,216Zm8-32H336v16H96Z" />
                                                    <path
                                                        d="M88,280H344a8,8,0,0,0,8-8V240a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,280Zm8-32H336v16H96Z" />
                                                    <path d="M240,296H88a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16Z" />
                                                    <path d="M192,320H88a8,8,0,0,0,0,16H192a8,8,0,0,0,0-16Z" />
                                                    <path d="M104,360a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16Z" />
                                                    <path d="M136,360a8,8,0,0,0,0-16h-8a8,8,0,0,0,0,16Z" />
                                                    <path
                                                        d="M480,384a96.127,96.127,0,0,0-88-95.664V80a8,8,0,0,0-2.343-5.657l-64-64A8,8,0,0,0,320,8H48a8,8,0,0,0-8,8V496a8,8,0,0,0,8,8H384a8,8,0,0,0,8-8V479.664A96.127,96.127,0,0,0,480,384ZM328,35.313,364.687,72H328ZM56,488V24H312V80a8,8,0,0,0,8,8h56V288.336a96,96,0,0,0,0,191.328V488Zm328-24a80,80,0,1,1,80-80A80.091,80.091,0,0,1,384,464Z" />
                                                    <path
                                                        d="M445.657,354.343a8,8,0,0,0-11.314,0L382.76,405.926,348.116,385.14a8,8,0,1,0-8.232,13.72l40,24a8,8,0,0,0,9.773-1.2l56-56A8,8,0,0,0,445.657,354.343Z" />
                                                </g>
                                            </svg>
                                            <span>{this.state.stats?.accepted_offers}</span>
                                        </div>
                                        <div className="dbl-title"><Trans>Accepted Offers</Trans></div>
                                        <a href={"/my-properties/"}>
                                            <Trans>View Details</Trans>
                                            <img src="../images/nextarrow.png" />
                                        </a>
                                    </li>
                                    <li>
                                        <div className="dbl-icon-number">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                                width="512"
                                                height="512">
                                                <g id="Decline">
                                                    <path d="M112,464H72a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Z" />
                                                    <path d="M144,464h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z" />
                                                    <path
                                                        d="M88,152H344a8,8,0,0,0,8-8V112a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,152Zm8-32H336v16H96Z" />
                                                    <path
                                                        d="M88,216H344a8,8,0,0,0,8-8V176a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,216Zm8-32H336v16H96Z" />
                                                    <path
                                                        d="M88,280H344a8,8,0,0,0,8-8V240a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,280Zm8-32H336v16H96Z" />
                                                    <path d="M240,296H88a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16Z" />
                                                    <path d="M192,320H88a8,8,0,0,0,0,16H192a8,8,0,0,0,0-16Z" />
                                                    <path d="M104,360a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16Z" />
                                                    <path d="M136,360a8,8,0,0,0,0-16h-8a8,8,0,0,0,0,16Z" />
                                                    <path
                                                        d="M480,384a96.127,96.127,0,0,0-88-95.664V80a8,8,0,0,0-2.343-5.657l-64-64A8,8,0,0,0,320,8H48a8,8,0,0,0-8,8V496a8,8,0,0,0,8,8H384a8,8,0,0,0,8-8V479.664A96.127,96.127,0,0,0,480,384ZM328,35.313,364.687,72H328ZM56,488V24H312V80a8,8,0,0,0,8,8h56V288.336a96,96,0,0,0,0,191.328V488Zm328-24a80,80,0,1,1,80-80A80.091,80.091,0,0,1,384,464Z" />
                                                    <path
                                                        d="M429.657,338.343a8,8,0,0,0-11.314,0L384,372.686l-34.343-34.343a8,8,0,0,0-11.314,11.314L372.686,384l-34.343,34.343a8,8,0,0,0,11.314,11.314L384,395.314l34.343,34.343a8,8,0,0,0,11.314-11.314L395.314,384l34.343-34.343A8,8,0,0,0,429.657,338.343Z" />
                                                </g>
                                            </svg>
                                            <span>{this.state.stats?.rejected_offers}</span>
                                        </div>
                                        <div className="dbl-title"><Trans>Rejected Offers</Trans></div>
                                        <a href={"/my-properties/"}>
                                            <Trans>View Details</Trans>
                                            <img src="../images/nextarrow.png" />
                                        </a>
                                    </li>
                                </ul>
                                :
                                <ul className="dashboard-button-listing disnone dashboard-button-listing-only3">
                                    <li>
                                        <div className="dbl-icon-number">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                                width="512"
                                                height="512">
                                                <g id="Document">
                                                    <path
                                                        d="M429.657,74.343l-64-64A8,8,0,0,0,360,8H88a8,8,0,0,0-8,8V496a8,8,0,0,0,8,8H424a8,8,0,0,0,8-8V80A8,8,0,0,0,429.657,74.343ZM368,35.313,404.687,72H368ZM96,488V24H352V80a8,8,0,0,0,8,8h56V488Z" />
                                                    <path d="M152,464H112a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Z" />
                                                    <path d="M184,464h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z" />
                                                    <path
                                                        d="M384,120H128a8,8,0,0,0-8,8v32a8,8,0,0,0,8,8H384a8,8,0,0,0,8-8V128A8,8,0,0,0,384,120Zm-8,32H136V136H376Z" />
                                                    <path
                                                        d="M384,184H128a8,8,0,0,0-8,8v32a8,8,0,0,0,8,8H384a8,8,0,0,0,8-8V192A8,8,0,0,0,384,184Zm-8,32H136V200H376Z" />
                                                    <path
                                                        d="M384,248H128a8,8,0,0,0-8,8v32a8,8,0,0,0,8,8H384a8,8,0,0,0,8-8V256A8,8,0,0,0,384,248Zm-8,32H136V264H376Z" />
                                                    <path d="M280,312H128a8,8,0,0,0,0,16H280a8,8,0,0,0,0-16Z" />
                                                    <path d="M232,336H128a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16Z" />
                                                    <path d="M144,376a8,8,0,0,0,0-16H128a8,8,0,0,0,0,16Z" />
                                                    <path d="M176,376a8,8,0,0,0,0-16h-8a8,8,0,0,0,0,16Z" />
                                                </g>
                                            </svg>
                                            <span>{this.state.stats.clients}</span>
                                        </div>
                                        <div className="dbl-title"><Trans>Clients </Trans></div>
                                        <a href={"/client-list/"}>
                                            <Trans>View Details</Trans>
                                            <img src="../images/nextarrow.png" />
                                        </a>
                                    </li>
                                    <li>
                                        <div className="dbl-icon-number">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                                width="512"
                                                height="512">
                                                <g id="Accept">
                                                    <path d="M112,464H72a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Z" />
                                                    <path d="M144,464h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z" />
                                                    <path
                                                        d="M88,152H344a8,8,0,0,0,8-8V112a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,152Zm8-32H336v16H96Z" />
                                                    <path
                                                        d="M88,216H344a8,8,0,0,0,8-8V176a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,216Zm8-32H336v16H96Z" />
                                                    <path
                                                        d="M88,280H344a8,8,0,0,0,8-8V240a8,8,0,0,0-8-8H88a8,8,0,0,0-8,8v32A8,8,0,0,0,88,280Zm8-32H336v16H96Z" />
                                                    <path d="M240,296H88a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16Z" />
                                                    <path d="M192,320H88a8,8,0,0,0,0,16H192a8,8,0,0,0,0-16Z" />
                                                    <path d="M104,360a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16Z" />
                                                    <path d="M136,360a8,8,0,0,0,0-16h-8a8,8,0,0,0,0,16Z" />
                                                    <path
                                                        d="M480,384a96.127,96.127,0,0,0-88-95.664V80a8,8,0,0,0-2.343-5.657l-64-64A8,8,0,0,0,320,8H48a8,8,0,0,0-8,8V496a8,8,0,0,0,8,8H384a8,8,0,0,0,8-8V479.664A96.127,96.127,0,0,0,480,384ZM328,35.313,364.687,72H328ZM56,488V24H312V80a8,8,0,0,0,8,8h56V288.336a96,96,0,0,0,0,191.328V488Zm328-24a80,80,0,1,1,80-80A80.091,80.091,0,0,1,384,464Z" />
                                                    <path
                                                        d="M445.657,354.343a8,8,0,0,0-11.314,0L382.76,405.926,348.116,385.14a8,8,0,1,0-8.232,13.72l40,24a8,8,0,0,0,9.773-1.2l56-56A8,8,0,0,0,445.657,354.343Z" />
                                                </g>
                                            </svg>
                                            <span>{this.state.stats.pre_approved_mortgages}</span>
                                        </div>
                                        <div className="dbl-title"><Trans>Pre approved Mortgages</Trans></div>
                                        <a href={"/client-list/"}>
                                            <Trans>View Details</Trans>
                                            <img src="../images/nextarrow.png" />
                                        </a>
                                    </li>
                                    <li>
                                        <div className="dbl-icon-number">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                                                width="512"
                                                height="512">
                                                <g id="Setting">
                                                    <path
                                                        d="M429.657,74.343l-64-64A8,8,0,0,0,360,8H88a8,8,0,0,0-8,8V496a8,8,0,0,0,8,8H424a8,8,0,0,0,8-8V80A8,8,0,0,0,429.657,74.343ZM368,35.313,404.687,72H368ZM96,488V24H352V80a8,8,0,0,0,8,8h56V488Z" />
                                                    <path d="M152,464H112a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Z" />
                                                    <path d="M184,464h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z" />
                                                    <path
                                                        d="M392,216H286.987a32,32,0,0,0-61.974,0H120a8,8,0,0,0,0,16H225.013a32,32,0,0,0,61.974,0H392a8,8,0,0,0,0-16ZM256,240a16,16,0,1,1,16-16A16.019,16.019,0,0,1,256,240Z" />
                                                    <path
                                                        d="M392,344H222.987a32,32,0,0,0-61.974,0H120a8,8,0,0,0,0,16h41.013a32,32,0,0,0,61.974,0H392a8,8,0,0,0,0-16ZM192,368a16,16,0,1,1,16-16A16.019,16.019,0,0,1,192,368Z" />
                                                    <path
                                                        d="M392,152H350.987a32,32,0,0,0-61.974,0H120a8,8,0,0,0,0,16H289.013a32,32,0,0,0,61.974,0H392a8,8,0,0,0,0-16Zm-72,24a16,16,0,1,1,16-16A16.019,16.019,0,0,1,320,176Z" />
                                                    <path
                                                        d="M392,280H350.987a32,32,0,0,0-61.974,0H120a8,8,0,0,0,0,16H289.013a32,32,0,0,0,61.974,0H392a8,8,0,0,0,0-16Zm-72,24a16,16,0,1,1,16-16A16.019,16.019,0,0,1,320,304Z" />
                                                </g>
                                            </svg>
                                            <span>{this.state.transactions_in_process.length}</span>
                                        </div>
                                        <div className="dbl-title"><Trans>Transactions in process</Trans></div>
                                        <a href={"/my-properties/"}>
                                            <Trans>View Details</Trans>
                                            <img src="../images/nextarrow.png" />
                                        </a>
                                    </li>
                                </ul>
                        }
                        {
                            role_id != 3 ?
                                <ul className="dp-buying-selling-listing">
                                    {/* {(this.state.radiobtnstatus == "Seller") && ( */}
                                    <li className="fullwidth">
                                        <div className="dbbsl-title-plus-box">
                                            <div className="dbbsl-title">
                                                <span><Trans>Buying</Trans></span>
                                                <sup>({this.state['buying']?.length} <Trans>items</Trans>)</sup>
                                                <div className="dbbsl-nextarrow">
                                                    <img src="../images/biddetail-arrow.png" />
                                                </div>
                                            </div>
                                            <div className="dbbsl-plus-box" onClick={this.showbuyinglist}>+
                                                </div>
                                        </div>
                                        {(this.state.showbuyingliststate == true) && (
                                            <div className="dbbsl-listing-box">
                                                <ul className="dbbsl-listing">
                                                    {
                                                        role_id != 2 ?
                                                            this.state['buying'].map((v, i) => {
                                                                return <li>
                                                                    <div className="dbbsl-status-time-row">
                                                                        <div className="str-icon"></div>
                                                                        <span><Trans>Status</Trans></span>
                                                                        <div
                                                                            className="str-time">{moment(v.created_at).format('hh:mm A')}</div>
                                                                    </div>
                                                                    <div className="dbbsl-title-row">
                                                                        <b>{v.title}</b>
                                                                        <span>$<Trans>{priceSplitter(v.price)}</Trans></span>
                                                                    </div>
                                                                    <ul className="dbbsl-sub-listing">
                                                                        <li>
                                                                            <Link to={'/property-detail/' + v.id}>
                                                                                <Trans>Details</Trans>
                                                                            </Link>
                                                                        </li>
                                                                        <li>
                                                                            <Link to={'/bid-history/' + v.id}>
                                                                                <Trans>Bid Details</Trans>
                                                                            </Link>
                                                                        </li>
                                                                        {(v.bids && v.bids.length > 0)
                                                                            ?
                                                                            v.bids.map(bid => {
                                                                                return (bid.bids[0].status == 1)
                                                                                    ?
                                                                                    <li>
                                                                                        <Link
                                                                                            to={'/buying-room/' + v.id}>
                                                                                            <Trans>Go to the
                                                                                            transaction
                                                                                                    table</Trans>
                                                                                        </Link>
                                                                                    </li>
                                                                                    :
                                                                                    (bid.bids[0].status == -1)
                                                                                        ?
                                                                                        <li>
                                                                                            <a>
                                                                                                <Trans>Rejected</Trans>
                                                                                            </a>
                                                                                        </li>
                                                                                        :
                                                                                        (bid.bids[0].status == 0 && v.status == 1)
                                                                                            ?
                                                                                            <li>
                                                                                                <Link
                                                                                                    to={'/buying-room/' + v.id}>
                                                                                                    <Trans>Go to the
                                                                                                    transaction
                                                                                                            table</Trans>
                                                                                                </Link>
                                                                                            </li>
                                                                                            : null

                                                                            }) : null
                                                                        }
                                                                    </ul>
                                                                </li>
                                                            })
                                                            : this.state['buying'].map((v, i) => {
                                                                return <li>
                                                                    <div className="dbbsl-status-time-row">
                                                                        <div className="str-icon"></div>
                                                                        <span><Trans>Status</Trans></span>
                                                                        <div
                                                                            className="str-time">{moment(v.user_property[0].created_at).format('hh:mm A')}</div>
                                                                    </div>
                                                                    <div className="dbbsl-title-row">
                                                                        <b>{v.user_property[0].title}</b>
                                                                        <span>$<Trans>{priceSplitter(v.user_property[0].price)}</Trans></span>
                                                                    </div>
                                                                    <ul className="dbbsl-sub-listing">
                                                                        <li>
                                                                            <Link
                                                                                to={'/property-detail/' + v.user_property[0].id}>
                                                                                <Trans>Details</Trans>
                                                                            </Link>
                                                                        </li>
                                                                        <li>
                                                                            <Link to={'/my-properties'}>
                                                                                <Trans>Offers</Trans>
                                                                            </Link>
                                                                        </li>
                                                                        {
                                                                            (v.user_property[0].status == 1)
                                                                                ?
                                                                                <li>
                                                                                    <Link
                                                                                        to={'/buying-room/' + v.user_property[0].id}>
                                                                                        <Trans>Go to the transaction
                                                                                                table</Trans>
                                                                                    </Link>
                                                                                </li>
                                                                                : null
                                                                        }
                                                                        <li><a><Trans>Messeges</Trans></a></li>
                                                                    </ul>
                                                                </li>
                                                            })
                                                    }
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                    {/*  )}
                                    {(this.state.radiobtnstatus == "Buyer") && ( */}
                                    <li className="fullwidth">
                                        <div className="dbbsl-title-plus-box">
                                            <div className="dbbsl-title">
                                                <span><Trans>Selling</Trans></span>
                                                <sup>({this.state['selling']?.length} <Trans>items</Trans>)</sup>
                                                <div className="dbbsl-nextarrow">
                                                    <img src="../images/biddetail-arrow.png" />
                                                </div>
                                            </div>
                                            <div className="dbbsl-plus-box" onClick={this.showsellinglist}>
                                                +
                                                </div>
                                        </div>
                                        {(this.state.showsellingliststate == true) && (
                                            <div className="dbbsl-listing-box">
                                                <ul className="dbbsl-listing">
                                                    {
                                                        this.state['selling'].map((v, i) => {
                                                            return <li>
                                                                <div className="dbbsl-status-time-row">
                                                                    <div className="str-icon"></div>
                                                                    <span><Trans>Status</Trans></span>
                                                                    <div
                                                                        className="str-time">{moment(v.user_property[0].created_at).format('hh:mm A')}</div>
                                                                </div>
                                                                <div className="dbbsl-title-row">
                                                                    <b>{v.user_property[0].title}</b>
                                                                    <span>$<Trans>{priceSplitter(v.user_property[0].price)}</Trans></span>
                                                                </div>
                                                                <ul className="dbbsl-sub-listing">
                                                                    <li>
                                                                        <Link
                                                                            to={'/property-detail/' + v.user_property[0].id}>
                                                                            <Trans>Details</Trans>
                                                                        </Link>
                                                                    </li>
                                                                    <li>
                                                                        <Link to={'/my-properties'}>
                                                                            <Trans>Offers</Trans>
                                                                        </Link>
                                                                    </li>
                                                                    {
                                                                        (v.user_property[0].status == 1)
                                                                            ?
                                                                            <li>
                                                                                <Link
                                                                                    to={'/buying-room/' + v.user_property[0].id}>
                                                                                    <Trans>Go to the transaction
                                                                                            table</Trans>
                                                                                </Link>
                                                                            </li>
                                                                            : null
                                                                    }
                                                                    <li><a><Trans>Messeges</Trans></a></li>
                                                                </ul>
                                                            </li>
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                    {/* )} */}
                                </ul>
                                : <ul className="dp-buying-selling-listing">
                                    <li className="fullwidth">
                                        <div className="dbbsl-title-plus-box">
                                            <div className="dbbsl-title">
                                                <span><Trans>Transactions in process</Trans></span>
                                                <sup>({this.state['transactions_in_process'].length}<Trans>items</Trans>)</sup>
                                            </div>
                                            <div className="dbbsl-plus-box" onClick={this.showsellinglist}>+</div>
                                        </div>
                                        {(this.state.showsellingliststate == true) && (
                                            <div className="dbbsl-listing-box">
                                                <ul className="dbbsl-listing">
                                                    {
                                                        this.state['transactions_in_process'].map((v, i) => {
                                                            return <li>
                                                                <div className="dbbsl-status-time-row">
                                                                    <div className="str-icon"></div>
                                                                    <span><Trans>Status</Trans></span>
                                                                    <div
                                                                        className="str-time">{moment(v.created_at).format('hh:mm A')}</div>
                                                                </div>
                                                                <div className="dbbsl-title-row">
                                                                    <b>{v.title}</b>
                                                                    <span>$<Trans>{priceSplitter(v.price)}</Trans></span>
                                                                </div>
                                                                <ul className="dbbsl-sub-listing">
                                                                    <li>
                                                                        <Link
                                                                            to={'/property-detail/' + v.id}>
                                                                            <Trans>Details</Trans>
                                                                        </Link>
                                                                    </li>
                                                                    <li>
                                                                        <Link
                                                                            to={'/buying-room/' + v.id}>
                                                                            <Trans>Go to the transaction table</Trans>
                                                                        </Link>
                                                                    </li>

                                                                </ul>
                                                            </li>
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                </ul>
                        }

                    </div>

                    {(this.state.showInvitationModalState == true) && (
                        <div className="add-realtor-popup-page">
                            <div className="arp-close-btn">
                                <img src="../images/close-btn.svg" onClick={this.showInvitationModal} />
                            </div>
                            <div className="add-realtor-popup">
                                <div className="arp-title"><Trans>Invite My Referral</Trans></div>
                                <div className="arp-content">
                                    <ul className="arp-inputfld-list">

                                        {!this.state['invitationSent']
                                            ?
                                            <>
                                                <li className="fullwidth arp-margin30">
                                                    <TagsInput value={this.state['tags']}
                                                        addKeys={[9, 13, 32, 186, 188]}
                                                        onlyUnique addOnPaste addOnBlur
                                                        inputProps={{ placeholder: 'Add Referral Email' }}
                                                        validationRegex={EMAIL_VALIDATION_REGEX}
                                                        pasteSplit={data => {
                                                            return data.replace(/[\r\n,;]/g, ' ').split(' ').map(d => d.trim())
                                                        }} onChange={(event) => this.handleChange(event)} />
                                                </li>
                                                {
                                                    !this.state['invitationLoader']
                                                        ?
                                                        <div className="arp-btn-row">
                                                            <button
                                                                className="arp-submit-btn"
                                                                onClick={(event) => this.handleFormSubmit(event, '')}>
                                                                <Trans>Submit</Trans>
                                                            </button>
                                                        </div> :
                                                        <div className="arp-btn-row">
                                                            <span
                                                                className="arp-submit-btn spinner-grow spinner-grow-sm"
                                                                role="status"
                                                                aria-hidden="true">
                                                            </span>
                                                        </div>
                                                }
                                            </> :
                                            <li className="fullwidth arp-margin30"><b><Trans>Invitation Sent Successfully</Trans></b></li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}


                    {(this.state.showInviteRealtorState == true) && (
                        <div className="add-realtor-popup-page">
                            <div className="arp-close-btn">
                                {(this.state.showConfirmPopupState == false) && (
                                    <img src="../images/close-btn.svg"
                                        onClick={() => this.showInviteRealtor(this.state.userRole)} />
                                )}
                            </div>
                            <div className="add-realtor-popup">
                                <div className="arp-title"><Trans>Invite
                                    My {this.state.userRole == 2 ? 'Realtor' : 'Lender'}</Trans></div>
                                <div className="arp-content">
                                    <ul className="arp-inputfld-list">
                                        {
                                            !this.state['invitationSent']
                                                ?
                                                <>
                                                    <li className="fullwidth arp-margin30">

                                                        <TagsInput
                                                            value={this.state['tags']}
                                                            addKeys={[9, 13, 32, 186, 188]}
                                                            onlyUnique
                                                            addOnPaste
                                                            addOnBlur
                                                            inputProps={{ placeholder: this.state.invite_email_placeholder }}
                                                            validationRegex={EMAIL_VALIDATION_REGEX}
                                                            pasteSplit={data => {
                                                                return data.replace(/[\r\n,;]/g, ' ').split(' ').map(d => d.trim())
                                                            }}
                                                            onChange={(event) => this.handleChange(event)} />
                                                    </li>
                                                    {/*<div className="arp-btn-row">*/}
                                                    {/*<span className="arp-submit-btn"*/}
                                                    {/*onClick={(event) => this.handleFormSubmit(event, '')}><Trans>Submit</Trans></span>*/}
                                                    {/*</div>*/}
                                                    {
                                                        !this.state['invitationLoader']
                                                            ?
                                                            <div className="arp-btn-row">
                                                                <span
                                                                    className="arp-submit-btn"
                                                                    onClick={(event) => this.handleInvitationFormSubmit(event, '')}>Submit
                                                                </span>
                                                            </div> :
                                                            <div className="arp-btn-row">
                                                                <span
                                                                    className="arp-submit-btn spinner-grow spinner-grow-sm"
                                                                    role="status"
                                                                    aria-hidden="true">
                                                                </span>
                                                            </div>
                                                    }
                                                </>
                                                :
                                                <>
                                                    <li className="fullwidth arp-margin30"><b><Trans>Invitation Sent Successfully</Trans></b></li>
                                                </>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </React.Fragment>
        )

    }
}

export default Dashboard;