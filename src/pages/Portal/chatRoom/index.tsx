import React, { Component, createRef } from "react";
import { Link } from "react-router-dom";

import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import { Trans } from "react-i18next";
import UserService from "../../../services/UserService";
import Skeleton from "react-loading-skeleton";
import { UrlService } from "services/imports/index";
import socketIOClient from "socket.io-client";
import moment from "moment";

const SOCKET_SERVER_URL = UrlService.chatAPIURL();

class Inbox extends Component<{}, any> {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            user: {},
            chats: [],
            messages: [],
            updatingChat: true,
            user_role: 1,
            user_id: 0,
            activeChatId: 0,
            message: null,
            new_messages: []
        }

        this.handler = this.handler.bind(this)
    }

    async componentDidMount() {
        const user = await UserService.getCurrentUserProfile()
        this.setState({ user: user, user_role: user.userProfile.role_id, user_id: user.userProfile.id })
        this.getChat()
    }

    getChats = chats => {
        this.state.chats.push(chats);
        this.setState({ updatingChat: true, loading: false })
        if (this.state.activeChatId === 0) {
            this.setActiveChat(chats.chat.id)
        }
    };

    getMessages = messages => {
        this.state.messages.push(messages);
        this.setState({ updatingChat: true })
        var objDiv = document.getElementById("chat-scroll");
        objDiv.scrollTop = objDiv.scrollHeight;
    };


    getNewMessage = new_message => {
        if (new_message[0]) {
            for (let i = 0; i < this.state.chats?.length; i++) {
                if (this.state.chats[i].chat.id === new_message[new_message.length - 1].chat_id) {
                    if (this.state.chats[i].chat.id !== this.state.activeChatId) {

                        for (let j = 0; j < this.state.chats[i].chat_users.length; j++) {
                            if (this.state.chats[i].chat_users[j].user_id === this.state.user_id) {
                                this.state.chats[i].isRead = 0;
                            }
                        }
                    }
                    this.state.chats[i].conversations.push(new_message[new_message.length - 1])
                    this.setState({ updatingChat: true })
                }
            }

            if (new_message[0].chat_id === this.state.activeChatId) {
                this.setState({ updatingChat: true, new_messages: new_message })
                var objDiv = document.getElementById("chat-scroll");
                objDiv.scrollTop = objDiv.scrollHeight;
            }
        }
    }

    getChat() {
        var user_id = this.state.user.userProfile.id;
        const socket = socketIOClient(SOCKET_SERVER_URL);
        socket.emit("user", (this.getChats, { user_id }));
        socket.on("chats", this.getChats);
        socket.on('new_chat_message', this.getNewMessage)
    }

    handler() {
        this.setState({ updateLanguage: true })
    }

    async setActiveChat(chat_id) {
        this.setState({ messages: [], new_messages: [], activeChatId: chat_id })
        const socket = socketIOClient(SOCKET_SERVER_URL);
        var user_id = this.state.user_id;
        socket.emit("room", (this.getMessages, { chat_id, user_id }));
        socket.on('messages', this.getMessages)

        var v = document.getElementById("chat-page");
        if (v && !v.classList.contains('addCSS')) {
            v.className += " addCSS";
        }

        for (let i = 0; i < this.state.chats.length; i++) {
            if (this.state.chats[i].chat.id === chat_id) {
                this.state.chats[i].isRead = 1;
            }
        }

    }

    backtochat() {
        var v = document.getElementById("chat-page");
        if (v && v.classList.contains('addCSS')) {
            v.classList.remove('addCSS');
        }
    }

    sendMessage(e) {
        e.preventDefault()
        const socket = socketIOClient(SOCKET_SERVER_URL);
        socket.emit('new_chat_message', ({
            message: this.state.message,
            user_id: this.state.user_id,
            chat_id: this.state.activeChatId,
            name: this.state.user.userProfile.name,
            last_name: this.state.user.userProfile.last_name
        }));

        this.setState({ message: '' })
    }
    render() {
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
                                    {this.state.chats.map((chat, i) => {
                                        var currentUserIsRead = 0;

                                        chat.chat_users.map((user) => {
                                            if (user.user_id === this.state.user_id) {
                                                currentUserIsRead = user.is_read
                                            }

                                        })
                                        return (<li onClick={() => this.setActiveChat(chat.chat.id)} className={`${(currentUserIsRead === 0 || chat.isRead == 0 ? 'bg-info' : null)} user-status odd-row ${(chat.chat.id === this.state.activeChatId) ? 'active_user' : ''}`} key={i}>
                                            <h5><Trans>{chat.property.title} </Trans></h5>
                                            <div className="ucl-dec">
                                                {(chat.conversations[chat.conversations.length - 1].message.length <= 18) ?
                                                    <span>{chat.conversations[chat.conversations.length - 1].message}</span> :
                                                    <span>{chat.conversations[chat.conversations.length - 1].message.substring(0, 18) + ' ...'}</span>
                                                }
                                            </div>
                                            <div className="ucl-sender-time">
                                                <span>{chat.conversations[chat.conversations.length - 1].name + ' ' + chat.conversations[chat.conversations.length - 1].last_name}</span>
                                                <i>{moment(chat.conversations[chat.conversations.length - 1].updated_at).fromNow()}</i>
                                            </div>
                                        </li>)
                                    })}


                                </ul>
                            </div>

                            <div className="chat-right-box">
                                {!this.state.user.businessProfile && this.state.user_role !== 1 ?
                                    <div className="ndp-right-box">
                                        <div className="alert alert-warning alert_box" role="alert">  <Link to="/edit-profile"><Trans>Please complete your business profile</Trans></Link></div>
                                    </div>
                                    : null}

                                <span className="backbtn" onClick={() => this.backtochat()}><Trans>back</Trans></span>
                                <>
                                    {this.state.messages[0] ?
                                        <div className="chb-property-dtls">
                                            <div className="chbp-image-box">
                                                <img src={UrlService.imagesPath() + '/' + this.state.messages[0].property.media} style={{ height: '100%' }} />
                                            </div>
                                            <div className="chbp-title-dec">
                                                <div className="chbp-title">
                                                    <Trans>{this.state.messages[0].property.title}</Trans>
                                                </div>
                                                <div className="chbp-address"><Trans>(buyer, Sellers, Realtors, Lenders)</Trans></div>
                                            </div>
                                            <div className="chbp-icon-box">
                                                <img src="../images/3-dot-icon.png" />
                                            </div>
                                        </div>
                                        : null}

                                    <div className="chat-with-justin" id="chat-scroll">

                                        {this.state.messages[0] ?
                                            this.state.messages[0].conversations.map((message, i) => (
                                                <div className={message.user_id == this.state.user_id ? 'second' : 'first'} key={i}>
                                                    <h5 className="chat-title">{message.message}</h5>
                                                    <p className="chat-person-time">
                                                        {/* {(this.state.activeChat.property_id > 0)
                                                        ? */} <span> {`${message.name} ${message.last_name}`}  </span> {/* : null
                                                    } */}
                                                        <span className="chat-time">{moment(message.updated_at).format('hh:mm A')}</span>
                                                    </p>
                                                </div>
                                            ))
                                            : null}

                                        {this.state.new_messages.map((message, i) => (
                                            <div className={message.user_id == this.state.user_id ? 'second' : 'first'} key={i}>
                                                <h5 className="chat-title">{message.message}</h5>
                                                <p className="chat-person-time">
                                                    {/* {(this.state.activeChat.property_id > 0)
                                                        ? */} <span> {`${message.name} ${message.last_name}`}  </span> {/* : null
                                                    } */}
                                                    <span className="chat-time">{moment(message.updated_at).format('hh:mm A')}</span>
                                                </p>
                                            </div>
                                        ))
                                        }
                                    </div></>

                                <div className="chat-input-box">
                                    <form onSubmit={(e) => this.sendMessage(e)}>
                                        <div className="chat-btn-alrt">
                                            <button type="submit" name="submit" value="submit" className="msg_send_btn" disabled={!this.state.message}><Trans>Send</Trans></button>
                                            <input type="text" className="write_msg" placeholder={`Type message here`} value={this.state.message} onChange={(e) => this.setState({ message: e.target.value })} />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    }
                </section>
            </React.Fragment >
        )
    }
}

export default Inbox;