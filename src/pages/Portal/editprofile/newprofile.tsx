import React, { Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { AdminTopNav, SideBar } from "../../../components/common/imports/navigations";
import TopNav from '../../../components/common/topnav';
import { UserService, CookieService } from "../../../services/imports/index";
import auth from "../../../components/common/router/protected/auth"
import addUserImage from "../../../assets/images/adduser.png"
import verifyImage from "../../../assets/images/verfied.png"
import callIcon from "../../../assets/images/call-icon.png"
import defaultImage from "../../../assets/images/defaultImage.png"
import mailIcon from "../../../assets/images/mail-icon.png"
import blackMailIcon from "../../../assets/images/mail-black-icon.png"
import whiteDropdown from "../../../assets/images/nl-down-icon-white.png"
import moment from "moment";

import { toast } from 'react-toastify';

import { Trans } from "react-i18next";

class Profile extends Component<RouteComponentProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            user: {},
            userBus: {},
            loader: false,
            loading: true,
            success: 'false',
            busSuccess: 'false',
            invalidAddress: 'false',
            enablealloweditstate: false,
            editdetailsstate: "Personal Details",
            isAuthenticated: auth.isAuthenticated(),
            showInvitestate: false,
            tags: [],
            inviteOption: 'lender',
            current_user: {},
            isInvited: false,
            realtor_additional_info: {}
        };
        this.handler = this.handler.bind(this);
        const userId = this.props.match.params['id'] || null;
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }

    async componentDidMount() {

        document.body.classList.add('disable-sidebar');
        let id: any = this.props.match.params;

        const current_user = await UserService.getCurrentUserProfile();
        var user_emails = [];
        var users = [];
        if(current_user?.userProfile.role_id!=2){
            var user_realtors = await UserService.getUserActsList(2)
            for(let i=0; i<user_realtors?.length; i++){
                if(user_realtors[i].email){
                    if(!user_emails.includes(user_realtors[i].email)){
                        users.push(user_realtors[i])
                        user_emails.push(user_realtors[i].email)
                    }
                } else{
                    if(!user_emails.includes(user_realtors[i].to_email)){
                        users.push(user_realtors[i])
                        user_emails.push(user_realtors[i].to_email)
                    }
                }
            }
        } else{
            var user_realtors = await UserService.getClientList()
            for(let i=0; i<user_realtors.length; i++){
                if(user_realtors[i].client.email){
                    if(!user_emails.includes(user_realtors[i].client.email)){
                        users.push(user_realtors[i].client)
                        user_emails.push(user_realtors[i].client.email)
                    }
                } else{
                    if(!user_emails.includes(user_realtors[i].client.to_email)){
                        users.push(user_realtors[i].client)
                        user_emails.push(user_realtors[i].client.to_email)
                    }
                }
            }
        }

        this.setState({ current_user: current_user?.userProfile || null });

        if (id && id.id) {
            const response = await UserService.getCurrentUserProfileWithoutLogin(id.id);
            var realtor_additional_info = await UserService.realtorAdditionalInfo(id.id);
            this.setState({ realtor_additional_info: realtor_additional_info })
            this.setState({ user: response || null });
        } else {
            const current_user_profile = await UserService.getCurrentUserProfile();
            this.setState({ user: current_user_profile || null });
            var realtor_additional_info = await UserService.realtorAdditionalInfo(current_user?.userProfile.id);
            this.setState({ realtor_additional_info: realtor_additional_info })
        }

        

        for(let i=0; i<users?.length; i++){
            var user = this.state.user;
            if(users[i].id === user.userProfile.id || CookieService.get('_id')===user.userProfile.id?.toString()){
                this.setState({ isInvited: true })
            } 
        }

        this.setState({ loading: false })
    }

    showInvitePopup = () => {
        this.setState({ tags: [] });
        this.setState({ showInvitestate: !this.state.showInvitestate })
    }

    handleChange(tags) {
        this.setState({ tags });
    }

    async handleFormSubmit(event: any, prop: any) {
        event.preventDefault();
        if (this.state['tags'].length > 0) {
            const role_id = parseInt(CookieService.get('role_id'));
            const data = {
                invitation: this.state['tags'],
                propId: 0,
                roleId: role_id === 1 ? this.state.inviteOption === 'lender' ? 3 : 2 : 1,
            };
            const response = await UserService.sendInvitations(data);
            if (response) {

                if (response['data'] !== 0) {
                    this.setState({ showInvitestate: false });
                    toast.success("Invitation Sent Successfuly", {
                        closeOnClick: true,
                        pauseOnHover: true,
                    });
                }

                if (response['onceInvited'].length > 0) {
                    response['onceInvited'].forEach((v) => {
                        toast.error("The user has already been invited: " + v.to_email, { autoClose: false, });
                    });
                    this.setState({ showInvitestate: false });
                }

            } else {
                toast.error("Something went wrong !");
            }
        } else {
            toast.error("No valid email provided !", { autoClose: false, });
            this.setState({ showInvitestate: false });
        }
    }

    async downloadFile(fileName) {
        try {
            const formData = new FormData();
            formData.append('fileName', fileName);
            
            const response = await UserService.downloadPreApprovFile(formData);
            const link = document.createElement('a');
            if(response && response.length > 0){
                link.href = response;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
            }else{
                toast.error('File not Found!');    
            }
            
        } catch (error) {
            toast.error('File not Found!');
        }
    }

    render() {
        const { user, inviteOption } = this.state;
        const userProfile = (user && user.userProfile) || null;
        const businessProfile = (user && user.businessProfile) || null;
        const userName = userProfile && userProfile.name || 'John Smith';
        const UserType = (userProfile && userProfile.role_id == 1 ? 'User' : userProfile && userProfile.role_id == 2 ? 'Realtor' : userProfile && userProfile.role_id == 3 ? 'Lender' : 'User Type');
        const EMAIL_VALIDATION_REGEX = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
        const role_id = parseInt(CookieService.get('role_id'));

        return (
            <React.Fragment>
                {this.state.isAuthenticated ? <>
                    <AdminTopNav handler={this.handler}></AdminTopNav>
                    <SideBar handler={this.handler}></SideBar>
                    </>: <TopNav />}
                


                {user && user.userProfile && this.state.realtor_additional_info.success ? <>
                <section className={this.state.isAuthenticated ? ' profile-page-seciton profileMargin' : 'profile-page-seciton'} >
                   {/*  {this.state.isAuthenticated ? */}
                        <div className="pps-header">
                            {/* <div className="pps-name-box"> */}
                            <div className="text-white">
                                <span><Trans>Profile</Trans> - {userName}</span>
                                <img src={whiteDropdown}  className="d-none"/>
                            </div>
                        </div>
                       {/*  : ''} */}
                    <div className="ndp-right-box">
                        {(this.state.isAuthenticated && !businessProfile && userProfile.role_id !== 1)   ?
                            <div className="alert alert-warning alert_section" role="alert">  <Link to="/edit-profile"><Trans>Please complete your business profile</Trans></Link></div> : null
                        }
                    </div>

                    <div className="row w-100">
                        <div className="col-12 col-lg-6 d-md-flex justify-content-md-around">
                            <div className="ppspd-image-message-box pb-5">
                                <div className="ppspd-image-box">
                                    <img src={userProfile && userProfile.avatar || defaultImage} />
                                    {this.state.isAuthenticated && this.state.current_user.id===user.userProfile.id ?
                                        <a href={'/edit-profile'} className="editButton"><i className="fa fa-pencil" aria-hidden="true"></i><span><Trans>Edit Profile</Trans> </span></a>    
                                    : null }
                                </div>
                                {this.state.isAuthenticated ?
                                    <Link to="/inbox">
                                        <div className="ppspd-message-box">
                                            <img src={blackMailIcon} />
                                            <span><Trans>Send message</Trans></span>
                                        </div>
                                    </Link>
                                : ''}
                            </div>
                            <div className="ppspd-content-box">
                                <div className="ppspd-name font-weight-bold">
                                    {userName}
                                </div>
                                {userProfile && userProfile.role_id != 1 ?
                                    <div className="ppspd-title-company">
                                        {businessProfile && businessProfile.title || "Title Company"}
                                    </div>
                                    : ''}
                                <div className="ppspd-usertye">
                                    <span><Trans>{UserType}</Trans></span>
                                    <img src={verifyImage} />
                                </div>
                                {userProfile && userProfile.role_id != 1 ?

                                    <div className="ppspd-companyname font-weight-bold">
                                        {businessProfile && businessProfile.office_name || "Company Name"}
                                    </div>
                                    : ''}

                                {userProfile && userProfile.role_id !== 1 ?
                                    <div className="ppspd-address">
                                        <span>{user && user.address}</span>
                                        <span> {businessProfile && businessProfile.city || "City"} {businessProfile && businessProfile.state || "State"} {businessProfile && businessProfile.zip || "Zip"}</span>
                                    </div>
                                    : ''}

                                    <div className="ppspd-phone">
                                        <img src={callIcon} />
                                        <a>{userProfile && userProfile.mobile_number || "555-555-5555"}</a>
                                    </div>

                                {/* {this.state.isAuthenticated ? */}
                                    <div className="ppspd-mail">
                                        <img src={mailIcon} />
                                        <a>{userProfile && userProfile.email || "myemail@test.com"}</a>
                                    </div>
                                    {/* : ''} */}

                                
                            </div>
                                    
                           

                            {/* {this.state.isAuthenticated && !this.state.isInvited ?
                                <div className="ppspd-invite-box invite-right-btn w-sm-100" onClick={() => this.showInvitePopup()}>
                                    <img src={addUserImage} />
                                    <span><Trans>Invite</Trans></span>
                                </div>
                            : ''} */}
                        </div>

                        <div className="col-12 col-lg-6">
                            <div className="row">
                                <div className="col-12">
                                    { userProfile.role_id==2 ?
                                        <div className="social-icons float-lg-right text-center mt-4 mt-md-0">
                                            { userProfile.instagram_profile_link ? <a href={userProfile.facebook_profile_link} target="_blank"><img src="/images/facebook.png" /></a> : null }
                                            { userProfile.instagram_profile_link ? <a href={userProfile.instagram_profile_link} target="_blank"><img src="/images/instagram.png" /></a> : null }
                                            { userProfile.linkedin_profile_link ? <a href={userProfile.linkedin_profile_link} target="_blank"><img src="/images/linkdin.png" /></a> : null }
                                            { userProfile.tiktok_profile_link ? <a href={userProfile.tiktok_profile_link} target="_blank"><img src="/images/tiktok.png" /></a> : null }
                                        </div>
                                    : null }
                                </div>
                                
                                    <div className="col-12">
                                        { userProfile.role_id==2 ?
                                            <div className="m-4 text-center">
                                                <div className="w-100">
                                                    <Link to={"/property-listings/"+userProfile.id} className="vmlbtn mx-auto float-lg-right btn theme-btn text-dark margin-right-px"><i className="fa fa-home mr-1" /> View My Listings</Link>
                                                </div>
                                            </div>
                                        : ''}
                                    </div>
                                </div>
                                <div className="row htmod w-100">
                                <div className="col-12 bottom-content text-dark">
                                    { userProfile.role_id==2 ?
                                        <div className="row w-100 no-gutters mr-3">
                                            <div className="col-md-4 pr-1">
                                                <div className="card">
                                                    <p className="pt-1 pl-3">Total Listings</p>
                                                    <h1 className="text-right font-weight-bold-italic pb-1 px-3">{ this.state.realtor_additional_info.total_properties-this.state.realtor_additional_info.closed_deals }</h1>
                                                </div>
                                            </div>
                                            <div className="col-md-4 pr-1">
                                                <div className="card">
                                                    <p className="pt-1 pl-3">Positive Feedback</p>
                                                    <h1 className="text-right font-weight-bold-italic pb-1 px-3">
                                                        {/* <img src="/images/thumb-up.png" width="30px" height="30px" className="thumb-up-image" /> */}
                                                        {/* &nbsp; */}
                                                        { this.state.realtor_additional_info.total_feedbacks }
                                                    </h1>
                                                </div>
                                            </div>
                                            <div className="col-md-4 pr-1">
                                                <div className="card">
                                                    <p className="pt-1 pl-3">Closed Deals</p>
                                                    <div className="d-flex justify-content-between px-3">
                                                        <label className="font-weight-bold ppspd-address mb-0">Sellers</label>
                                                        <label className="text-right font-weight-bold-italic mb-0">{ this.state.realtor_additional_info.selling_realtor_properties }</label>
                                                    </div>
                                                    <div className="d-flex justify-content-between px-3">
                                                        <label className="text-left ppspd-address font-weight-bold">Buyers</label>
                                                        <label className="text-right font-weight-bold-italic">{ this.state.realtor_additional_info.buying_realtor_properties }</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    : null }
                                </div>
                            </div>
                        </div>
                    </div>
                </section> 
                { userProfile.role_id==2 ?
                    <div className="profile-bottom-section">
                        <div className="row w-100">
                            <div className="col-md-6"></div>
                            <div className="col-md-3 mt-4">
                                {/* <h5>Revereifi Ranking: #{ this.state.realtor_additional_info.rank }</h5> */}
                            </div>
                            <div className="col-md-3 mt-4">
                                <h6 className="text-md-right font-weight-bold mr-4"><span className="font-weight-bold">Member Since:</span> 2020</h6>
                            </div>                        
                        </div>
                        <div className="row w-100">
                            <div className="col-md-6 p-md-5 pt-3">
                                <h5 className="font-weight-bold">About</h5>
                                <div className="card">
                                    <div className="card-body">
                                        <p className="text-black-50">{userProfile && userProfile.about || "Not added"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 p-md-5 pt-3">
                                <h5 className=" font-weight-bold">Areas of Service</h5>
                                <div className="card">
                                    <div className="card-body">
                                        <p className="text-black-50">{userProfile && userProfile.areas_of_service || "Not added"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                : null }
                </>: 
                this.state.loading==true ? <div className="profile-page-seciton">
                    <div className="user-error">
                        <Trans>Please wait ...</Trans>
                    </div>
                </div>: <div className="profile-page-seciton">
                    <div className="user-error">
                        <Trans>No user found</Trans>
                        <Link to="/login" className="redirect-login"> <Trans>Go To Login</Trans> </Link>
                    </div>
                </div>}
            </React.Fragment>
        )
    }
}


export default Profile;