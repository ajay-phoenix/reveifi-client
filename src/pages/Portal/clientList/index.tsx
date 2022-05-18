import React, { Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { AdminTopNav, SideBar } from "components/common/imports/navigations";
import { UserService, CookieService } from "services/imports/index";
import "./_style.scss";

import TagsInput from 'react-tagsinput';
import { Trans } from "react-i18next";
import { toast } from "react-toastify";

const role_id = CookieService.get('role_id');
const current_user_id = CookieService.get('_id');

class ClientList extends Component<RouteComponentProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            resp: [],
            tags: [],
            invitationSent: false,
            showinviterealtorstate: false,
            roleId: 0,
            disable_invitation_button: false,
            businessProfile: true,
            showtabledata: -1
        };

        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }

    handleChange(tags) {
        this.setState({ tags });
    }

    async handleFormSubmit(event: any, prop: any) {
        event.preventDefault();

        this.setState({ invitationLoader: true });
        const data = {
            invitation: this.state['tags'],
            propId: 0,
            roleId: this.state['roleId'],
        };
        this.setState({ disable_invitation_button: true })
        const response = await UserService.sendInvitations(data);
        if (response) {
            this.setState({ disable_invitation_button: false })

            if (response['data'] !== 0) {
                this.setState({ showinviterealtorstate: false });
                this.setState({ invitationLoader: false });
                if(response.data.success===false){
                    toast.error(response.data.message, { autoClose: false }); 
                } else{
                    toast.success("Invitation Sent Successfuly", {
                        closeOnClick: true,
                        pauseOnHover: true,
                    });
                }
                
                await this.getClients()
            }

            if (response['onceInvited'].length > 0) {
                response['onceInvited'].forEach((v) => {
                    if (v.msg) {
                        toast.error("Buyer already has a lender - Ask them to invite you to confirm swap", { autoClose: false, });
                    } else {
                        toast.error("The user has already been invited: " + v.to_email, { autoClose: false, });
                    }

                });
                this.setState({ invitationSent: false });
                this.setState({ invitationLoader: false });
                this.setState({ showrealtorpopupstate: false });
            }
        } else {
            this.setState({ invitationLoader: false });
            toast.error("Something went wrong !");
        }
        //console.log(data);
    }

    showinviterealtor = (role) => {
        this.setState({ tags: [] });
        if (this.state.showinviterealtorstate == true) {
            this.setState({ showinviterealtorstate: false });
            this.setState({ roleId: 0 });
        } else {
            this.setState({ roleId: role });
            this.setState({ showinviterealtorstate: true });
        }
    }

    async componentDidMount() {
        await this.getClients()
    }

    async getClients(){
        const all_clients = await UserService.getClientList();
        const userProfile = await UserService.getCurrentUserProfile();
        this.setState({ businessProfile: userProfile.businessProfile });
        const all_clients_with_buying_room = new Array();

        var client_emails = [];
        for (let i = 0; i < all_clients.length; i++) {
            if (all_clients[i].client.to_email!= userProfile.userProfile.email) {
                all_clients[i].buying_room = new Array();
                var get_client_buying_room = await UserService.getUserBuyingRoom(all_clients[i].client.id);

                if (get_client_buying_room.length > 0) {
                    all_clients[i].buying_room = get_client_buying_room[0];
                }

                if (all_clients[i].client.email && !client_emails.includes(all_clients[i].client.email)) {
                    client_emails.push(all_clients[i].client.email)
                    all_clients_with_buying_room.push(all_clients[i])
                } else if(all_clients[i].client.to_email && !client_emails.includes(all_clients[i].client.to_email)){
                    client_emails.push(all_clients[i].client.to_email)
                    all_clients_with_buying_room.push(all_clients[i])
                }
            }
        }

        this.setState({ resp: all_clients_with_buying_room, loading: 'false' });   
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
    showrow = async (id) => {
        var ID = id.target.id.split('Title')[1];
        if (this.state.showtabledata == ID) {
            await this.setState({ showtabledata: -1 })
        } else {
            await this.setState({ showtabledata: ID })
        }
    }

    render() {
        const priceSplitter = (number) => (number && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        const EMAIL_VALIDATION_REGEX = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}>

                </AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <section className="lender-page">
                    <div className="lb-title-box">
                        <h3>
                            <Trans>Client List</Trans>
                        </h3>
                        {/*<a role="menuitem" className="invittedUser" onClick={() => this.setPropId(0)}>*/}
                        {/*<Trans>Add lender</Trans>*/}
                        {/*</a>*/}
                        {this.state.businessProfile.role_id===2 ? <>
                            <Link to="/create-client">
                                <Trans>Create Buyer</Trans>
                            </Link>
                            <Link to="/create-client">
                                <Trans>Create Seller</Trans>
                            </Link>
                        </>: null }
                        <a role="menuitem" className="invittedUser" onClick={() => this.showinviterealtor(1)}>
                            <Trans>Invite Client</Trans>
                        </a>
                        {/*<a role="menuitem" className="invittedUser" onClick={() => this.showinviterealtor(3)}>*/}
                        {/*<Trans>Invite lender</Trans>*/}
                        {/*</a>*/}
                    </div>
                    <div className="ndp-right-box">
                        {!this.state['businessProfile'] ?
                            <div className="alert alert-warning alert_section" role="alert">  <Link to="/edit-profile"><Trans>Please complete your business profile</Trans></Link></div> : null
                        }
                    </div>
                    <div className="lender-box">
                        <div className="realtor-table-box">
                            <table className="lender-table" id="ResponsiveTable">
                                <thead>
                                    <tr>
                                        <th><Trans>Client Name</Trans></th>
                                        <th><Trans>Client Email</Trans></th>
                                        {(role_id && role_id == 3) ? <th><Trans>Pre-Approval Amount</Trans></th> : null}

                                        <th className="clientaction"><Trans>Actions</Trans></th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {
                                        this.state['resp'].map((rec, i) => {
                                            return <>
                                                <div className="ResponsiveTableTitle" id={"ResponsiveTableTitle" + i} onClick={this.showrow} >
                                                    <span>
                                                        {
                                                            rec && rec.client
                                                                ?
                                                                <Link role="menuitem"
                                                                    to={'/profile/' + rec.client.id}>
                                                                    <span className="getProfile">{rec.client.name} {rec.client.last_name}</span>
                                                                </Link>
                                                                : null
                                                        }
                                                    </span>
                                                    <img src="images/nl-down-icon-white.png" />
                                                </div>
                                                <tr key={i} id={"ResponsiveTableRow" + i} className={`ResponsiveTableRow ${this.state.showtabledata == i ? " active" : ""}`} >
                                                    <td>
                                                        {
                                                            rec && rec.client
                                                                ?
                                                                <Link role="menuitem"
                                                                    to={'/profile/' + rec.client.id}>
                                                                    <span className="getProfile">{rec.client.name} {rec.client.last_name}</span>
                                                                </Link>
                                                                : null
                                                        }
                                                    </td>
                                                    <td>{rec.client.email ? rec.client.email : rec.client.to_email}</td>
                                                    {(role_id && role_id == 3) && (
                                                        <td>{(rec.invitionsLendersRealters && rec.invitionsLendersRealters.length > 0) && (
                                                            rec.invitionsLendersRealters[0]['offer_price'] && <><span>
                                                                {'$ ' + priceSplitter(rec.invitionsLendersRealters[0]['offer_price'])}
                                                            </span>
                                                                {(rec.invitionsLendersRealters[0]['document_name'] ?
                                                                    <span>
                                                                        <a href="javascript:void(0)" role="menuitem" className="rt-icon-image" style={{ float: 'none' }}
                                                                            onClick={() => this.downloadFile(rec.invitionsLendersRealters[0]['document_name'])} >
                                                                            <img src="../images/document-download.png" />
                                                                        </a>
                                                                    </span>
                                                                    : null)}
                                                            </>)
                                                        }</td>
                                                    )}

                                                    <td>

                                                        {rec && rec.client ?
                                                            
                                                            <div className="rt-btns-box">
                                                                {
                                                                    rec && rec.buying_room && !rec.buying_room.id && rec.invitionsLendersRealters && rec.invitionsLendersRealters.length > 0
                                                                        ?

                                                                        
                                                                        <Link role="menuitem" to={role_id==3 ? '/submit-pre-approvals/' + rec.client.id: '#'}>
                                                                            <span className="pre-mortgage-dollar-sign">$</span>
                                                                        </Link>
                                                                        : null
                                                                }
                                                                {
                                                                    global['realtorRole'] != role_id && (!rec.invitionsLendersRealters || rec.invitionsLendersRealters.length <= 0) ?
                                                                        <Link role="menuitem" className="rt-start-conver-btn"
                                                                            to={'/submit-pre-approvals/' + rec.client.id}>
                                                                            <Trans>Pre-Approval</Trans>
                                                                        </Link> : null
                                                                }
                                                                {
                                                                    rec.buying_room ?
                                                                        rec.buying_room.id ?
                                                                            <Link to={"/buying-room/" + rec.buying_room.prop_id}
                                                                                role="menuitem" className="rt-icon-image">
                                                                                <img src="../images/home-icon.png" />
                                                                            </Link> : null

                                                                        : null
                                                                }
                                                                <a href={"tel:" + rec.client.mobile_number}
                                                                    className="rt-icon-image">
                                                                    <img src="../images/call-icon.png" />
                                                                </a>
                                                                <Link to={"/inbox?user_id=" + rec.client.id} role="menuitem"
                                                                    className="rt-icon-image">
                                                                    <img src="../images/chat-icon.png" />
                                                                </Link>
                                                            </div>
                                                            : <span className="epb-button" style={{ textAlign: 'center' }}>
                                                                Pending
                                                </span>}
                                                    </td>
                                                </tr>
                                            </>
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {(this.state.showinviterealtorstate == true) && (
                        <div className="add-realtor-popup-page">
                            <div className="arp-close-btn">
                                <img src="../images/close-btn.svg" onClick={this.showinviterealtor} />
                            </div>
                            <div className="add-realtor-popup">
                                <div className="arp-title"><Trans>Invite My Client</Trans></div>
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
                                                            addOnBlur
                                                            inputProps={{ placeholder: 'Add client email' }}
                                                            validationRegex={EMAIL_VALIDATION_REGEX}
                                                            pasteSplit={data => {
                                                                return data.replace(/[\r\n,;]/g, ' ').split(' ').map(d => d.trim())
                                                            }}
                                                            onChange={(event) => this.handleChange(event)} />
                                                    </li>
                                                    <div className="arp-btn-row">
                                                        <button className="arp-submit-btn"
                                                            onClick={(event) => this.handleFormSubmit(event, '')}
                                                            disabled={this.state.disable_invitation_button}>
                                                            <Trans>Submit</Trans></button>
                                                    </div>
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
                {/*<div className="content-wrapper">*/}
                {/*<div className="row">*/}
                {/*<div className="container">*/}
                {/*<div className="profile-inner">*/}
                {/*<div className="container">*/}
                {/*<div className="row">*/}
                {/*<div className="col-md-6">*/}
                {/*<h3 id="myinvites"><Trans>Client List</Trans></h3>*/}
                {/*</div>*/}
                {/*<div className="col-md-6">*/}

                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div className="container offers-table">*/}
                {/*<div className="table-responsive">*/}
                {/*<table className="table">*/}
                {/*<tbody>*/}
                {/*{*/}
                {/*this.state['resp'].map((rec, i) => {*/}
                {/*return <React.Fragment key={i}>*/}
                {/*{(rec.property !== null) ?*/}
                {/*<tr>*/}
                {/*<td colSpan={100}>*/}
                {/*<p>{rec.property.address}, {rec.property.city}, {rec.property.state}, {rec.property.country}</p>*/}
                {/*</td>*/}
                {/*</tr>*/}
                {/*: null}*/}
                {/*<tr>*/}
                {/*<td>*/}
                {/*<div className="property-img">*/}
                {/*<img*/}
                {/*src="http://reverifi.trisec.io/images/buyer-name.png"*/}
                {/*className="img-fluid"></img>*/}

                {/*</div>*/}
                {/*<div className="property-name">*/}
                {/*<p>{rec.client.name}</p>*/}
                {/*</div>*/}
                {/*</td>*/}
                {/*<td>*/}
                {/*<div className="property-name">*/}
                {/*<p>{rec.client.email}</p>*/}
                {/*</div>*/}
                {/*</td>*/}
                {/*<td>*/}
                {/*<div className="bid-now-btn" id="start-conversion">*/}

                {/*<Link*/}
                {/*to={"/inbox?user_id=" + rec.client.id}*/}
                {/*role="menuitem"*/}
                {/*className="btn btn-primary"*/}
                {/*>*/}
                {/*<Trans>Start Conversation</Trans>*/}
                {/*</Link>*/}

                {/*</div>*/}
                {/*{role_id == 3 ?*/}
                {/*<div className="bid-now-btn">*/}
                {/*<Link*/}
                {/*to={'/submit-pre-approvals/' + rec.client.id}>*/}
                {/*<Trans>Submit</Trans>*/}
                {/*</Link>*/}
                {/*</div> : null}*/}
                {/*</td>*/}
                {/*</tr>*/}
                {/*</React.Fragment>*/}
                {/*})*/}
                {/*}*/}
                {/*/!*<tr className="outer-tr">*!/*/}
                {/*/!*<td colSpan={100}>*!/*/}
                {/*/!*<p>34 Prospect Street #7 Jersey City NJ 07307 United States</p>*!/*/}
                {/*/!*</td>*!/*/}

                {/*/!*</tr>*!/*/}
                {/*/!*<tr>*!/*/}
                {/*/!*<td>*!/*/}
                {/*/!*<div className="property-img">*!/*/}
                {/*/!*<img src="http://reverifi.trisec.io/images/property-1.png"*!/*/}
                {/*/!*className="img-fluid"></img>*!/*/}
                {/*/!*</div>*!/*/}
                {/*/!*<div className="property-name">*!/*/}
                {/*/!*<p>Testing Property.</p>*!/*/}
                {/*/!*</div>*!/*/}
                {/*/!*</td>*!/*/}
                {/*/!*<td>*!/*/}
                {/*/!*<div className="property-img">*!/*/}
                {/*/!*<img src="http://reverifi.trisec.io/images/buyer-name.png"*!/*/}
                {/*/!*className="img-fluid"></img>*!/*/}
                {/*/!*</div>*!/*/}
                {/*/!*<div className="property-name">*!/*/}
                {/*/!*<p>Tris Pulford</p>*!/*/}
                {/*/!*</div>*!/*/}
                {/*/!*</td>*!/*/}
                {/*/!*<td>*!/*/}
                {/*/!*<div className="property-name">*!/*/}
                {/*/!*<p>Bid Price: $50,000</p>*!/*/}
                {/*/!*</div>*!/*/}
                {/*/!*</td>*!/*/}
                {/*/!*<td>*!/*/}
                {/*/!*<div className="bid-now-btn"><Link*!/*/}
                {/*/!*to="bid-detail-2">Status</Link></div>*!/*/}

                {/*/!*</td>*!/*/}
                {/*/!*</tr>*!/*/}
                {/*</tbody>*/}
                {/*</table>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*</div>*/}
            </React.Fragment>
        )

    }

}


export default ClientList;