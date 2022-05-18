import React, { Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { AdminTopNav, SideBar } from "components/common/imports/navigations";
import { UserService } from "services/imports/index";

import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css'

import { Trans } from "react-i18next";
import { toast } from "react-toastify";

class Realtor extends Component<RouteComponentProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            resp: [],
            propId: 0,
            tags: [],
            invitationSent: false,
            invalidEmail: false,
            invitationLoader: false,
            showrealtorpopupstate: false,
            showconfirmpopupstate: false,
            showinviterealtorstate: false,
            showtabledata: -1
        };
        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({ updateLanguage: true })
    }


    async componentDidMount() {
        this.getRealtors()
    }

    async getRealtors(){
        const response = await UserService.getUserActsList(2);
        var realtor_emails = [];
        var realtors = [];
        for(let i=0; i<response.length; i++){
            if(response[i].email){
                if(!realtor_emails.includes(response[i].email)){
                    realtors.push(response[i])
                    realtor_emails.push(response[i].email)
                }
            } else{
                if(!realtor_emails.includes(response[i].to_email)){
                    realtors.push(response[i])
                    realtor_emails.push(response[i].to_email)
                }
            }
        }
        this.setState({ resp: realtors });
    }

    handleChange(tags) {
        this.setState({ tags });
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
            const response = await UserService.sendInvitations(data);
            if (response) {

                if (response['data'] !== 0) {
                    const resps = await UserService.getUserActsList(2);
                    this.setState({ resp: resps });
                    this.setState({ showinviterealtorstate: false });
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
                    this.setState({ showinviterealtorstate: false });
                    this.setState({ invitationLoader: false });
                }

            } else {
                this.setState({ invitationLoader: false });
                toast.error("Something went wrong !");
            }
        } else {
            toast.error("No valid email provided !", { autoClose: false, });
            this.setState({ showinviterealtorstate: false });
            this.setState({ invitationLoader: false });
        }

        //console.log(data);
    }

    async closeModal(event: any) {
        event.preventDefault();
        this.setState({ tags: [] });
        this.setState({ invitationSent: false });
    }

    setPropId = (id) => {
        this.setState({ propId: id });
        this.setState({ showrealtorpopupstate: true })
    }

    showconfirmpopup = () => {
        if (this.state.showconfirmpopupstate == true) {
            this.setState({ showconfirmpopupstate: false })
        } else {
            this.setState({ showconfirmpopupstate: true })
        }
    }

    showinviterealtor = () => {
        this.setState({ tags: [] });
        if (this.state.showinviterealtorstate == true) {
            this.setState({ showinviterealtorstate: false })
        } else {
            this.setState({ showinviterealtorstate: true })
        }
    }

    hidepopuo = () => {
        this.setState({ showrealtorpopupstate: false })
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
        const EMAIL_VALIDATION_REGEX = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
        return (
            <React.Fragment>
                <AdminTopNav></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <section className="realtor-page">
                    <div className="rb-title-box">
                        <h3>
                            <Trans>Realtor List</Trans>
                        </h3>
                        <a role="menuitem" className="invittedUser" onClick={this.showinviterealtor}>
                            <Trans>Invite My Realtor</Trans>
                        </a>
                        {/*<a role="menuitem" className="invittedUser" onClick={() => this.setPropId(0)}>*/}
                        {/*<Trans>Add Realtor</Trans>*/}
                        {/*</a>*/}
                    </div>
                    <div className="realtor-box">
                        <div className="realtor-table-box">
                            <table className="realtor-table" id="ResponsiveTable">
                                <thead>
                                    <tr>
                                        <th><Trans>First Name</Trans></th>
                                        <th><Trans>Last Name</Trans></th>
                                        <th><Trans>Email</Trans></th>
                                        <th><Trans>Company Name</Trans></th>
                                        <th><Trans>Address</Trans></th>
                                        <th className="rt-btn-td"><Trans>Actions</Trans></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state['resp'].map((prop, i) => {
                                        let handleClick = () => {
                                            this.setPropId(0);
                                        };
                                        return <>
                                            <div className="ResponsiveTableTitle" id={"ResponsiveTableTitle" + i} onClick={this.showrow} >
                                                <span>
                                                    {prop.name} {prop.last_name}
                                                </span>
                                                <img src="images/nl-down-icon-white.png" />
                                            </div>
                                            <tr key={i} id={"ResponsiveTableRow" + i} className={`ResponsiveTableRow ${this.state.showtabledata == i ? " active" : ""}`}  >
                                                <td>{prop.name}</td>
                                                <td>{prop.last_name}</td>
                                                <td>{prop.email ? prop.email : prop.to_email}</td>
                                                <td>{prop.business_profiles ? prop.business_profiles.office_name : ''}</td>
                                                <td>{prop.business_profiles ? prop.business_profiles.address : ''}</td>
                                                <td>
                                                    {prop.email && prop.business_profiles ?
                                                        <div className="rt-btns-box">
                                                            <a href={"tel:" + prop.mobile_number} className="rt-icon-image">
                                                                <img src="../images/call-icon.png" />
                                                            </a>
                                                            <Link to={"/inbox?user_id=" + prop.id} role="menuitem" className="rt-icon-image">
                                                                <img src="../images/chat-icon.png" />
                                                            </Link>
                                                        </div> : <span className="epb-button" style={{ textAlign: 'center' }}>
                                                            Pending
                                            </span>}
                                                </td>
                                            </tr>
                                        </>
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {(this.state.showinviterealtorstate == true) && (
                        <div className="add-realtor-popup-page">
                            <div className="arp-close-btn">
                                {(this.state.showconfirmpopupstate == false) && (
                                    <img src="../images/close-btn.svg" onClick={this.showinviterealtor} />
                                )}
                            </div>
                            <div className="add-realtor-popup">
                                <div className="arp-title"><Trans>Invite My Realtor</Trans></div>
                                <div className="arp-content">
                                    <ul className="arp-inputfld-list">

                                        {!this.state['invitationSent']
                                            ?
                                            <>
                                                <li className="fullwidth arp-margin30">
                                                    <TagsInput value={this.state['tags']}
                                                        addKeys={[9, 13, 32, 186, 188]}
                                                        onlyUnique addOnPaste addOnBlur
                                                        inputProps={{ placeholder: 'Add Realtor Email' }}
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
                                                                Submit
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
                                            <li className="fullwidth arp-margin30"><b><Trans>Invitation Sent
                                                Successfully</Trans></b></li>
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

export default Realtor;