import React from "react";
import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import useChat from "./useChat";
import { Trans } from "react-i18next";
import { Link } from "react-router-dom";
import UserService from "../../../services/UserService";

const ChatRoom = (props) => {
    var roomId = 1;
    const { messages, users, sendMessage } = useChat(roomId);
    const [ newMessage, setNewMessage ] = React.useState("");

    const handleNewMessageChange = (event) => {
        setNewMessage(event.target.value);
    };

    const handleSendMessage = () => {
        sendMessage(newMessage);
        setNewMessage("");
    };

    getUserProfile();

    async function getUserProfile() {
        const user = await UserService.getCurrentUserProfile()
        console.log(user)
    }
   
    

    return (<>
        <AdminTopNav />
        <SideBar />
        <div className="chat-page" id="chat-page">
            <div className="chat-left-box">
                <span><Trans>Inbox</Trans></span>
                <ul className="user-chat-listing">

                    <li className={` user-status odd-row`} >
                        <h5><Trans>Property Name</Trans></h5>
                        <div className="ucl-dec">
                            <span><Trans>Last Message</Trans></span>
                        </div>
                        <div className="ucl-sender-time">
                            <span><Trans>User Name</Trans></span>
                            <i><Trans>message time</Trans></i>
                        </div>
                    </li>

                </ul>
            </div>

            <div className="chat-right-box">
                <div className="ndp-right-box">
                    <div className="alert alert-warning alert_box" role="alert">  <Link to="/edit-profile"><Trans>Please complete your business profile</Trans></Link></div>
                </div>

                <span className="backbtn"><Trans>back</Trans></span>
                <><div className="chb-property-dtls">
                    <div className="chbp-image-box">
                        <img src="/images/Capturess.png" />
                    </div>
                    <div className="chbp-title-dec">
                        <div className="chbp-title">
                            <Trans>Property Title</Trans>
                        </div>
                        <div className="chbp-address"><Trans>(buyer, Sellers, Realtors, Lenders)</Trans></div>
                    </div>
                    <div className="chbp-icon-box">
                        <img src="../images/3-dot-icon.png" />
                    </div>
                </div>
                    <div className="chat-with-justin">
                        {messages.map((message, i) => (
                            <li key={i}>
                                {message.message}
                            </li>
                        ))}
                    </div></>

                <div className="chat-input-box">
                    <div className="chat-btn-alrt">
                        <button type="submit" name="submit" value="submit" className="msg_send_btn" onClick={handleSendMessage}><Trans>Send</Trans></button>
                        <input type="text" onChange={handleNewMessageChange} />
                    </div>
                </div>

            </div>
        </div>

    </>);
};

export default ChatRoom;
