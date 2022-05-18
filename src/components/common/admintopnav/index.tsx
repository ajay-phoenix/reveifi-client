import React, { Component } from "react";
import { Link } from "react-router-dom";

import i18next from "../../../i18next";
import { toast } from 'react-toastify';

import { UserService, UrlService, CookieService } from "services/imports/index";

import 'react-flags-select/css/react-flags-select.css';
import 'react-flags-select/scss/react-flags-select.scss';
import "./_style.scss";

import { FormBuilder, AbstractControl } from "react-reactive-form";
import socketIOClient from "socket.io-client";
import { Trans } from "react-i18next";

let interval: any;
let chatInterval: any;
const role_id = CookieService.get('role_id');
const SOCKET_SERVER_URL = UrlService.chatAPIURL();

const userRoleName = ['User', 'Realtor', 'Lender'];

class AdminTopNav extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            notificationclickstate: false,
            name: '',
            notif: [],
            chatNotif: [],
            notifCount: 0,
            chatNotifCount: 0,
            last_name: '',
            page_url: '',
            user: {}
        };

    }

    async componentDidMount() {
        const user = await UserService.getCurrentUserProfile()
        this.setState({ user: user })

        this.getNotifications();
        this.getChatNotifications();
        const name = (localStorage.getItem('name') != null ? localStorage.getItem('name') : '');
        const last_name = (localStorage.getItem('last_name') != null ? localStorage.getItem('last_name') : '');
        this.setState({ name, last_name });
        this.setState({ page_url: window.location.pathname.split('/')[1] });
        // interval = setInterval(() => this.getNotifications(), 6500);
        // chatInterval = setInterval(() => this.getChatNotifications(), 6500);

    }

    async updateUser(val) {
        const postData = { role_id: val };
        const resp = await UserService.updateUserRole(postData);
        if (resp == 1) {
            window.location.href = "/dashboard";
        } else {
            toast.error("Some thing went wrong! Please try Login.");
        }
    }

    getNotification = response => {
        this.setState({ notif: response && response.data });
        this.setState({ notifCount: response && response.notifCount });
    }


    async getNotifications() {
        const socket = socketIOClient(SOCKET_SERVER_URL);
        var user_id = this.state.user.userProfile?.id
        socket.emit("notifications", ({ user_id }));
        socket.on("notifications", (this.getNotification));

        /* const response = await UserService.getUserNotifications();
        this.setState({ notif: response && response.data });
        this.setState({ notifCount: response && response.notifCount }); */
    }

    async getChatNotifications() {
        const response = await UserService.getChatNotifications();
        if (response && response.length > 0) {
            this.setState({ chatNotif: response });
            this.setState({ chatNotifCount: response.length });
        } else {
            this.setState({ chatNotif: [] });
            this.setState({ chatNotifCount: 0 });
        }
    }

    setUserRole = (AC: AbstractControl) => {
        let val = AC.value;
        let date = new Date();
        date.setTime(date.getTime() + 60 * 24 * 60 * 1000);
        const options = { path: "/", expires: date };
        CookieService.set("role_id", val, options);
        if (role_id !== val) {
            toast.success("Please Wait, Loading " + userRoleName[(parseInt(val) - 1)] + " Portal", { closeOnClick: true, pauseOnHover: true, });
            this.updateUser(val);
        }
    };
    roleChange = FormBuilder.group({
        role: [role_id, [this.setUserRole]]
    });

    public handleChange = value => {
        let newlang = "en";
        switch (value) {
            case "US":
                newlang = "en";
                break;
            case "GB":
                newlang = "gb";
                break;
            case "ES":
                newlang = "se";
                break;
        }
        this.setState(prevState => ({ value: newlang }));
        i18next.changeLanguage(newlang);
        if (this.props.handler) {
            this.props.handler();
        }
    };

    componentWillUnmount() {
        clearInterval(interval);
        clearInterval(chatInterval);
    }

    public async udpateNotificaions() {
        const response = await UserService.updateUserNotifications();
        if (response) {
            //this.setState({notifCount: 0});
        }
        if (this.state.notificationclickstate == true) {
            this.setState({ notificationclickstate: false })
        } else {
            this.setState({ notificationclickstate: true })
        }


    }

    render() {
        const { t, i18next } = this.props;
        return (
            <header className={'header ' + this.state.page_url}>
                <div className="left-menu-icon" data-widget="pushmenu" role="button">
                    <img src="../images/Hamburger-Menu.png" />
                </div>
                <div className="header-logo-box">
                    <a href="/dashboard">
                        <img src="../images/reverifi-logo.png" />
                    </a>
                </div>
                <div className="header-icon-box">
                    <div className="hib-notification-icon-box">
                        <div className="hib-icon-box hib-notification-box"
                            onClick={() => this.udpateNotificaions()}>
                            <img src="../images/bell.png" />
                            {(this.state.notifCount > 0) && (<span>{this.state.notifCount}</span>)}
                        </div>
                        {(this.state.notificationclickstate == true) && (
                            <div className="hib-notification-list-box">
                                <ul className="hib-notification-list">
                                    {
                                        this.state['notif'].map((noti, i) => {
                                            return <>
                                                {
                                                    noti.notification_type == 1
                                                        || noti.notification_type == 4
                                                        || noti.notification_type == 5
                                                        || (noti.notification_type == 6 && (noti.receiver == 'seller' || noti.receiver == 'buyer')) ?
                                                        global['sellerRole'] == role_id ?
                                                            noti.notification_type == 1 || noti.notification_type == 5 ?
                                                                <li><Link to={'/properties-invitations'}
                                                                    key={i}>{noti.notification_text}</Link></li> :
                                                                noti.receiver == 'seller' || noti.receiver == 'buyer' ?
                                                                    <li><Link to={`/buying-room/${noti.property_id}`}
                                                                        key={i}>{noti.notification_text}</Link></li> :
                                                                    <li><Link to={'/my-properties'}
                                                                        key={i}>{noti.notification_text}</Link></li>
                                                            :
                                                            <li><a key={i}>{noti.notification_text} <b> <Trans>Please login as User</Trans></b></a></li>
                                                        : noti.notification_type == 3 ?
                                                            global['lenderRole'] == role_id ?
                                                                <li><Link to={'/client-list'}
                                                                    key={i}>{noti.notification_text}</Link></li>
                                                                :
                                                                (noti.notification_type == 6 && noti.receiver == 'lender')
                                                                    ?
                                                                    <li><Link to={`/buying-room/${noti.property_id}`}
                                                                        key={i}>{noti.notification_text}</Link></li>
                                                                    :
                                                                    <li><a key={i}>{noti.notification_text}
                                                                        <b> <Trans>Please login as Lender</Trans></b>
                                                                    </a></li>
                                                            : noti.notification_type == 2 || (noti.notification_type == 6 && noti.receiver == 'realtor') ?
                                                                (global['realtorRole'] == role_id && noti.notification_type == 6 && noti.receiver == 'realtor') ?
                                                                    <li><Link to={`/buying-room/${noti.property_id}`}
                                                                        key={i}>{noti.notification_text}</Link></li>
                                                                    :
                                                                    (global['realtorRole'] == role_id && noti.notification_type != 6) ?
                                                                        <li><Link to={'/client-list'}
                                                                            key={i}>{noti.notification_text}</Link></li>
                                                                        :
                                                                        <li><a key={i}>{noti.notification_text}
                                                                            <b> <Trans>Please login as Realtor</Trans></b>
                                                                        </a></li>

                                                                : null
                                                }
                                            </>
                                        })
                                    }
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="hib-chat-icon-box">
                        <Link to={`/inbox`} className="hib-icon-box hib-chat-box">
                            <img src="../images/message.png" />
                            {
                                (this.state.chatNotifCount > 0)
                                    ?
                                    <>
                                        <span>{(this.state.chatNotifCount > 0) ? this.state.chatNotifCount : null}</span>
                                    </>
                                    :
                                    null
                            }
                        </Link>
                        {/* <a href="/inbox" className="hib-icon-box hib-chat-box">
                            <img src="../images/message.png" />
                            <span>{(this.state.chatNotifCount > 0) ? this.state.chatNotifCount : null}</span>
                        </a> */}
                    </div>
                </div>

                {/* <nav className="main-header navbar navbar-expand navbar-white navbar-light disnone" >
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link" data-widget="pushmenu" href="#" role="button"><i
                                className="fa fa-bars"></i></a>
                        </li>
                    </ul>

                    <ul className="navbar-nav ml-auto">
                        <li className="countries-dropdown">
                            <ul>
                                <li>
                                    <div className="language-upper">
                                        <div className="country-text">
                                            <p><Trans>Select Language</Trans>:</p>
                                        </div>
                                        <div className="country-flags">
                                            <ReactFlagsSelect countries={["US", "GB", "ES"]} defaultCountry="US"
                                                onSelect={this.handleChange} />
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li className="countries-dropdown">
                            <ul>
                                <li>
                                    <div className="language-upper">
                                       
                                        <div className="country-flags">
                                            <FieldGroup
                                                control={this.roleChange}
                                                render={({ invalid, pristine, pending, meta }) => (
                                                    <FieldControl
                                                        name="role"
                                                        render={SelectInput}
                                                        meta={{
                                                            label: "Select Role",
                                                            options: [
                                                                { lable: 'User', value: 1 },
                                                                { lable: 'Realtor', value: 2 },
                                                                { lable: 'Lender', value: 3 }
                                                            ]
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <div className="profile-section">
                                <div className="profile-desc">
                                    <p> </p>
                                </div>
                                <div className="profile-pic">
                                    <img src="../images/Capturess.png"></img>
                                </div>
                            </div>
                        </li>
                        <li>
                            <div className="dropdown notification-panel">
                                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <span> {this.state['notifCount'] > 0 ? this.state['notifCount'] : null}</span>
                                    <i className="fa fa-bell"></i>
                                </button>
                                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    {
                                        this.state['notif'].map((noti, i) => {
                                            return <p key={i}>{noti.notification_text}</p>
                                        })
                                    }
                                </div>
                            </div>
                        </li>
                    </ul>
                </nav> */}
            </header>
        );
    }
}

export default AdminTopNav;