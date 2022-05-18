import React, { Component } from "react";
import { Link } from "react-router-dom";
import queryString from 'query-string';

import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import footer from "../../../components/common/footer";
import { Trans } from "react-i18next";
import UserService from "../../../services/UserService";
import Skeleton from "react-loading-skeleton";
import {
    FormBuilder,
    AbstractControl,
    Validators,
    FieldGroup,
    FieldControl
} from "react-reactive-form";
import { toast } from 'react-toastify';
import moment from "moment";
import ScrollableFeed from 'react-scrollable-feed'
import './_style.scss'

const TextInput = ({ handler, touched, hasError, meta }: any) => (
    <>
        <input className="write_msg" type="text" placeholder={`Type message here...`} {...handler()} />
        <span className="help-block">
            {touched && hasError("required") && `${meta.label} is required`}
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </>
);

var interval: any;
class Inbox extends Component<{}, any> {
    constructor(props) {
        super(props)

        this.handler = this.handler.bind(this)
        this.state = {
            loading: true,
            receiver: null,
            chats: [],
            activeChat: null,
            user: null,
            businessProfile: true,
            user_role : 0
        }
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }

    async componentDidMount() {
        let exists = false;
        const user = await UserService.getCurrentUserProfile()
        const userChatrooms = await UserService.getUserChatRooms();
        if (userChatrooms.success) {
            this.setState({ chats: userChatrooms.data });
            this.activeChat((userChatrooms.data && userChatrooms.data[0]) || {});
        }

        this.setState({ user: user.userProfile });
        this.setState({ stats: user, user_role: user.userProfile.role_id, businessProfile: user.businessProfile });
        const parsed = queryString.parse(window.location.search);
        if (parsed.user_id != undefined) {
            let singleChat = this.state.chats.filter(i => i.users.length == 1);
            let acitveChat = singleChat.filter(i => i.users[0].user_id == parsed.user_id);

            if (acitveChat != undefined && acitveChat.length > 0) {
                exists = true;
                this.setState({ activeChat: acitveChat[0] });
            }

            const res = await UserService.getUserProfile(parsed.user_id);
            if (typeof res.id != undefined && res.id && !exists) {
                this.setState({ receiver: res });
                this.setState({ activeChat: res });
            }
        }
        if (this.state.chats.length > 0 && parsed.user_id == undefined && !exists) {
            this.setState({ activeChat: this.state.chats[0] });
            this.udpateChatNotificaions(this.state.activeChat.id)
        }
        this.setState({ loading: false });
        interval = setInterval(() => this.setActiveChat(), 3500);
        return;

    }

    componentWillUnmount() {
        clearInterval(interval);
    }

    async setActiveChat() {
        let exists = false;
        const userChatrooms = await UserService.getUserChatRooms();

        if (userChatrooms.success) {
            this.setState({ chats: userChatrooms.data, acitveChat: userChatrooms.data[0] || {} });

            let activeChat = this.state.chats.filter(i => this.state.activeChat && i.id == this.state.activeChat.id);
            const parsed = queryString.parse(window.location.search);
            if (activeChat.length > 0) {
                let singleChat = this.state.chats.filter(i => i.users.length == 2);
                let getAcitveChat = singleChat.filter(i => i.users[0].user_id == parsed.user_id);

                //console.log(`singleChat: ${singleChat.length}`)
                //console.log(`getAcitveChat: ${getAcitveChat.length}`)
                //console.log(this.state.chats)
                //console.log(activeChat[0].conversations)
                //if (getAcitveChat != undefined && getAcitveChat.length > 0) {
                //    exists = true;
                //    this.setState({ activeChat: activeChat[0] });
                //    this.setState({ receiver: null });
                //}

                const res = await UserService.getUserProfile(parsed.user_id);
                if (typeof res.id != undefined && res.id && !exists) {
                    this.setState({ receiver: null });
                    this.setState({ activeChat: res });
                }
                // if (singleChat.length > 0) {
                    this.setState({ activeChat: activeChat[0] });
                //     this.setState({ receiver: null });
                // }
            } else {
                const parsed = queryString.parse(window.location.search);
                if (parsed.user_id != undefined) {
                    let singleChat = this.state.chats.filter(i => i.users.length == 1);
                    let getAcitveChat = singleChat.filter(i => i.users[0].user_id == parsed.user_id);
                    if (getAcitveChat != undefined && getAcitveChat.length > 0) {
                        this.setState({ activeChat: getAcitveChat[0] });
                        this.setState({ receiver: null });
                    }
                }
            }

            this.udpateChatNotificaions(this.state.activeChat && this.state.activeChat.id)
            // this.getChatNotifications()
            this.setState({ loading: false });
        }
    }

    public async udpateChatNotificaions(id) {
        const response = await UserService.updateChatNotifications(id);
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

    activeChat(chat) {
        if (chat && chat != undefined) {
            this.setState({ activeChat: chat });
            this.setState({ receiver: null });
            this.udpateChatNotificaions(chat && chat.id)
            this.getChatNotifications()
        }
        var v = document.getElementById("chat-page");
        if (v && !v.classList.contains('addCSS')) {
            v.className += " addCSS";
        }
    }

    backtochat() {
        var v = document.getElementById("chat-page");
        if (v && v.classList.contains('addCSS')) {
            v.classList.remove('addCSS');
        }
    }

    chatForm = FormBuilder.group({
        message: ['', Validators.required],
        fileSource: []
    });

    async handleChatSubmit(event: any) {
        event.preventDefault();
        let chatId = this.state.activeChat.id;
        if (typeof this.state.activeChat.property_id == undefined || this.state.activeChat.property_id == undefined) {
            const chatroomData = {
                'user_id': this.state.activeChat.id
            }
            const res = await UserService.createChatroom(chatroomData);
            if (typeof res.id !== 'undefined') {
                chatId = res.id
            }
        }

        const formData = await this.prepareChatData();
        try {
            const response = await UserService.sendMessage(formData, chatId);
            if (typeof response.id !== 'undefined') {
                this.chatForm.patchValue({
                    message: ''
                });
                this.setActiveChat();
            } else {
                toast.error("Something went wrong ! Unable to send message.");
            }
        } catch (error) {
            toast.error("Something went wrong ! Unable to send message.");
        }
    }

    async prepareChatData() {
        const formData = new FormData();

        formData.append('message', this.chatForm.get('message').value);
        if (typeof this.chatForm.get('fileSource').value != 'undefined') {
            formData.append('attachment', this.chatForm.get('fileSource').value);
        }
        return formData;
    }

    onChatFileChange(event) {
        if (event.target.files && event.target.files.length) {
            const file = event.target.files[0];
            this.chatForm.patchValue({
                fileSource: file
            });
        }
    }

    messageBox = () => {
        return this.state.activeChat.conversations.map((message, i) => {
            return (
                <div className={message.user_id == this.state.user.id ? 'second' : 'first'} key={i}>
                    <h5 className="chat-title"> {message.message} </h5>
                    <p className="chat-person-time">
                        {(this.state.activeChat.property_id > 0)
                            ? <span> {`${message.user.name} ${message.user.last_name}`}  </span> : null
                        }
                        <span className="chat-time">{moment(message.updated_at).format('hh:mm A')}</span>
                    </p>
                </div>
            );
        })
    }

    render() {

        if (this.state.activeChat && this.state.activeChat != null) {
            // console.log('this.state.activeChat');
            // console.log(this.state.activeChat.conversations);
            // console.log('this.state.reciver');
            // console.log(this.state.receiver);
        }

        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler} ></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <section className="chat-section">
                    {(this.state.loading) ?
                        <div className="inbox-outer">
                            <div className="container">
                                <div className="row">
                                    <div className="col-md-4">
                                        <Skeleton count={6} circle={true} height={70} />
                                    </div>
                                    <div className="col-md-8">
                                        <Skeleton count={1} circle={true} height={500} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <div className="chat-page" id="chat-page">
                            <div className="chat-left-box">
                                <span><Trans>Inbox</Trans></span>
                                <ul className="user-chat-listing">
                                    {(this.state.receiver != null)
                                        ?
                                        // <h5><Trans>{`${this.state.receiver.name} ${this.state.receiver.last_name}`}</Trans></h5>
                                        //     <div className="ucl-dec">
                                        //         {
                                        //         (this.state.activeChat.conversations[this.state.activeChat.conversations.length - 1].message.length <= 18)
                                        //         ?
                                        //         this.state.activeChat.conversations[this.state.activeChat.conversations.length - 1].message
                                        //         :
                                        //         this.state.activeChat.conversations[this.state.activeChat.conversations.length - 1].message.substring(0,18)+' ...'
                                        //         }
                                        //         </div>
                                        //     <div className="ucl-sender-time">
                                        //         <span>{this.state.activeChat.conversations[this.state.activeChat.conversations.length - 1].name +' '+ this.state.activeChat.conversations[this.state.activeChat.conversations.length - 1].last_name}</span>
                                        //         <i>{moment(this.state.activeChat.conversations[this.state.activeChat.conversations.length - 1].nameupdated_at).format('hh:mm A')}</i>
                                        //     </div>
                                        <li className=" active_user ">

                                            <h5><Trans>{`${this.state.receiver.name} ${this.state.receiver.last_name}`}</Trans></h5>
                                            <div className="ucl-dec">
                                                <Trans>'HERE'</Trans>
                                                </div>
                                            <div className="ucl-sender-time">
                                                <span><Trans>Sender Name</Trans></span>
                                                <i>12:42PM</i>
                                            </div>

                                        </li>
                                        : null
                                    }
                                    {(this.state.chats.length > 0)
                                        ? this.state.chats.map((chat, i) => {
                                            let currentUser = chat.users.filter(u => u.user_id == this.state.user.id);
                                            return <li onClick={() => this.activeChat(chat)} className={`${(currentUser.length > 0 && currentUser[0].is_read == 0 ? 'bg-info' : '')} user-status odd-row ${(this.state.receiver == null && this.state.activeChat && chat.id === this.state.activeChat.id) ? 'active_user' : ''} `} key={i}>
                                                <h5>
                                                    <Trans>
                                                        {(chat.property_id == 0) ? `${chat.users[0].users[0].name} ${chat.users[0].users[0].last_name} ` : chat.property.title}
                                                    </Trans>
                                                </h5>
                                                <div className="ucl-dec">
                                                    {
                                                        (chat.conversations[chat.conversations.length - 1].message.length <= 18)
                                                            ?
                                                            <span className={(chat.users[0].is_read == 0 ? 'font-weight-bold' : '')}>{chat.conversations[chat.conversations.length - 1].message}</span>
                                                            :
                                                            <span className={(chat.users[0].is_read == 0 ? 'font-weight-bold' : '')}>{chat.conversations[chat.conversations.length - 1].message.substring(0, 18) + ' ...'}</span>
                                                    }
                                                </div>
                                                <div className="ucl-sender-time">
                                                    <span>{chat.conversations[chat.conversations.length - 1].name + ' ' + chat.conversations[chat.conversations.length - 1].last_name}</span>
                                                    <i>{moment(chat.conversations[chat.conversations.length - 1].updated_at).fromNow()}</i>
                                                </div>
                                            </li>
                                        }) : null
                                    }
                                </ul>
                            </div>

                            <div className="chat-right-box">
                                <div className="ndp-right-box">
                                    {!this.state['businessProfile'] && this.state.user_role!==1 ?
                                        <div className="alert alert-warning alert_box" role="alert">  <Link to="/edit-profile"><Trans>Please complete your business profile</Trans></Link></div> : null
                                    }
                                </div>

                                <span className="backbtn" onClick={() => this.backtochat()}>back</span>
                                {(this.state.chats.length > 0)
                                    ? <><div className="chb-property-dtls">
                                        <div className="chbp-image-box">
                                            <img src="/images/Capturess.png" />
                                        </div>
                                        <div className="chbp-title-dec">
                                            <div className="chbp-title">
                                                <Trans>
                                                    {(this.state.receiver != null)
                                                        ? ` ${this.state.receiver.name} ${this.state.receiver.last_name}`
                                                        : (this.state.activeChat && this.state.activeChat.property_id > 0) ? ` ${this.state.activeChat && this.state.activeChat.property.title}` : ` ${this.state.activeChat && this.state.activeChat.users && this.state.activeChat.users[0].users[0].name} ${this.state.activeChat && this.state.activeChat.users && this.state.activeChat.users[0].users[0].last_name}`}
                                                </Trans>
                                            </div>
                                            <div className="chbp-address"><Trans>(buyer, Sellers, Realtors, Lenders)</Trans></div>
                                        </div>
                                        <div className="chbp-icon-box">
                                            <img src="../images/3-dot-icon.png" />
                                        </div>
                                    </div>
                                        <div className="chat-with-justin">
                                            {((this.state.activeChat != null && this.state.activeChat.conversations != undefined) && this.state.activeChat.conversations.length > 0)
                                                ?
                                                <ScrollableFeed>
                                                    {this.messageBox()}
                                                </ScrollableFeed>
                                                : null}
                                        </div></>
                                    : 'Start Conversation'
                                }
                                <div className="chat-input-box">
                                    <FieldGroup control={this.chatForm} render={({ invalid, pristine, pending, meta }) => (
                                        <form noValidate onSubmit={(event) => this.handleChatSubmit(event)}>
                                            <div className="chat-btn-alrt">
                                                <button type="submit" name="submit" value="submit" className="msg_send_btn"><Trans>Send</Trans></button>
                                                <FieldControl name="message" render={TextInput} meta={{ label: "Chat" }} />
                                            </div>
                                        </form>
                                    )} />
                                </div>
                                {/* <div className="type_msg">
                                    <div className="input_msg_write">
                                        <input type="text" className="write_msg" placeholder="Type a message"></input>
                                        <button className="msg_send_btn" type="button"><i className="fa fa-paper-plane" aria-hidden="true"></i></button>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    }
                </section>
            </React.Fragment >
        )
    }
}

export default Inbox;