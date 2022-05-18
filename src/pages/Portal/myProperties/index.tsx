import React, { Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { AdminTopNav, SideBar } from "components/common/imports/navigations";
import { UserService, UrlService, CookieService } from "services/imports/index";
import defaultImage from "../../../assets/images/defaultImage.png"

import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css'

import { Trans } from "react-i18next";

import moment from "moment";
import { toast } from "react-toastify";
import { FieldControl, FieldGroup, FormBuilder, Validators } from "react-reactive-form";
import Modal from "react-bootstrap/Modal";

const role_id = CookieService.get('role_id');
const current_user_id = CookieService.get('_id');


const NumberInput = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <input className="form-control" type="number" placeholder={`Enter ${meta.label}`} {...handler()} />
        <span className="help-block">
            {touched && hasError("required") && `${meta.label} is required`}
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
            {(touched && hasError('mismatch')) && "Down payment must be less than Offer price!"}
        </span>
    </div>
);

class MyProperties extends Component<RouteComponentProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            props: [],
            loading: 'true',
            tags: [],
            propId: 0,
            invitationSent: false,
            invitationLoader: false,
            viewofferstate: [],
            data: [],
            loader: false,
            key: 'offer',
            negotiationData: {},
            viewNegotiatedOfferState: [],
            invitationBuyerModal: false,
            invitationBuyerRealtorBuyerModal: false,
            invitationBuyerRealtorModal: false,
            negotiationModal: false,
            businessProfile: true,
            bidSubmitting: false,
            showAcceptBidButton: true,
            role_id: 0
        };
        this.setPropId = this.setPropId.bind(this);

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

    makeData(v, index) {
        return new Promise(async (resolve, reject) => {
            let maxBid = {};

            if (v['role_id'] == 4) {
                var bids = await UserService.getPropertyAllBids(v['user_property'].id)
                v['user_property']['maxBid'] = 0;
                v['user_property']['realtor_id'] = false;
                v['user_property']['lender_id'] = false;
                v['user_property']['seller_id'] = v['user_id'];
                v['user_property']['realtor_additional_role'] = 4;
                v['user_property']['prop_bids'] = bids;
                resolve(v['user_property'])
            } else {
                if (v['user_property'][0]['property_bids_association'].length > 0) {
                    maxBid = v['user_property'][0]['property_bids_association'].reduce(function (prev, current) {
                        return (prev['bids'][0].offer_price > current['bids'][0].offer_price) ? prev : current
                    })
                }
                v['user_property'][0]['maxBid'] = maxBid;
                if (v['user_property'][0].status == 1) {
                    v['user_property'][0]['realtor_id'] = v['realtor_id'] ? true : false;
                    v['user_property'][0]['lender_id'] = v['lender_id'] ? true : false;
                    v['user_property'][0]['seller_id'] = v['user_id'];
                    v['user_property'][0]['realtor_additional_role'] = 0;
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
                    v['user_property'][0]['seller_id'] = v['user_id'];
                    v['user_property'][0]['realtor_additional_role'] = 0;
                    resolve(v['user_property'][0])
                }
            }

        })
    }

    makePropertyData(response, realtorData?: any) {
        const resp = [];
        const promises = [];
        response.forEach((v, k) => {
            this.state['viewofferstate'].push(false);
            this.state['viewNegotiatedOfferState'].push(false);
            promises.push(this.makeData(v, k))
            // resp.push(v['user_property'][0]);
        });
        Promise.all(promises).then(res => {
            if (!realtorData) {
                resp.push(res);
                this.setState({ props: resp[0], loading: 'false' });
            } else {
                for(let i=0; i<res.length; i++){
                    this.state['props'].push(res[i]);
                }
                const newData = this.state['props'];
                this.setState({ props: newData, loading: 'false' });
            }

        })
    }

    async componentDidMount() {
        const response = await UserService.getCurrentUserProperties();
        var properties = [];
        var properties_ids = [];
        for (let i = 0; i < response.length; i++) {
            if (!properties_ids.includes(response[i].prop_id.toString())) {
                properties_ids.push(response[i].prop_id.toString())
                properties.push(response[i])
            }
        }

        this.makePropertyData(properties);
        const userProfile = await UserService.getCurrentUserProfile();
        this.setState({ user_role: userProfile.userProfile.role_id, businessProfile: userProfile.businessProfile });

        if (userProfile.userProfile.role_id == 2) {
            var invited_properties = [];

            const responseRealtorProp = await UserService.getRealtorProperties();
            if (responseRealtorProp.length > 0) {
                for(let i=0; i<responseRealtorProp.length; i++){
                    if (!properties_ids.includes(responseRealtorProp[i].prop_id.toString())) {
                        properties_ids.push(responseRealtorProp[i].prop_id.toString())
                        invited_properties.push(responseRealtorProp[i])
                    }
                }
                if(invited_properties.length>0){
                    this.makePropertyData(invited_properties, true);
                }
            }

        }
    }

    async handleFormSubmit(event: any, buyerRealtor) {
        event.preventDefault();
        this.setState({ invitationLoader: true });
        if (this.state['tags'].length > 0) {
            const data = {
                invitation: this.state['tags'],
                propId: this.state['propId'],
                roleId: 1,
            };

            let response = {};
            if (!buyerRealtor) {
                response = await UserService.sendPropertyInvitations(data);
            } else {
                response = await UserService.sendBuyerRealtorInvitations(data);
            }

            if (response) {

                if (response['data'] !== 0) {
                    this.setState({ invitationLoader: false });
                    this.setState({ invitationBuyerModal: false });
                    toast.success("Invitation sent successfully", {
                        closeOnClick: true,
                        pauseOnHover: true,
                    });
                }

                if (response['onceInvited'].length > 0) {
                    response['onceInvited'].forEach((v) => {
                        toast.error("The user has already been invited: " + v.to_email, { autoClose: false, });
                    });
                    this.setState({ invitationLoader: false });
                    this.setState({ invitationBuyerModal: false });
                }
            } else {
                this.setState({ invitationLoader: false });
                toast.error("Something went wrong !");
            }
        } else {
            toast.error("No valid email provided !", { autoClose: false, });
            this.setState({ invitationLoader: false });
            this.setState({ invitationBuyerModal: false });
        }
    }

    async handleFormSubmitBuyerRealtorBuyerModal(event: any, buyerRealtor) {
        event.preventDefault();
        this.setState({ invitationLoader: true });
        if (this.state['tags'].length > 0) {
            const data = {
                invitation: this.state['tags'],
                propId: this.state['propId'],
                roleId: 1,
            };
            const response = await UserService.sendBuyerRealtorBuyerInvitations(data);

            if (response) {
                if (response['data'] !== 0) {
                    this.setState({ invitationLoader: false });
                    this.setState({ invitationBuyerRealtorBuyerModal: false });
                    toast.success("Invitation sent successfully", {
                        closeOnClick: true,
                        pauseOnHover: true,
                    });
                }

                if (response['onceInvited'].length > 0) {
                    response['onceInvited'].forEach((v) => {
                        toast.error("The user has already been invited: " + v.to_email, { autoClose: false, });
                    });
                    this.setState({ invitationLoader: false });
                    this.setState({ invitationBuyerRealtorBuyerModal: false });
                }
            } else {
                this.setState({ invitationLoader: false });
                toast.error("Something went wrong !");
            }
        } else {
            toast.error("No valid email provided !", { autoClose: false, });
            this.setState({ invitationLoader: false });
            this.setState({ invitationBuyerRealtorBuyerModal: false });
        }
    }

    async closeModal(event: any) {
        event.preventDefault();
        this.setState({ tags: [] });
        this.setState({ invitationSent: false });
    }

    setPropId(id, buyerRealtor) {
        this.setState({ propId: id });
        this.showInvitationModal(buyerRealtor);
    }

    showviewoffer(i) {
        let clone = Object.assign({}, this.state.viewofferstate);
        switch (clone[i]) {
            case false:
                clone[i] = true;
                break;
            case true:
                clone[i] = false;
                break;
        }
        this.setState({ viewofferstate: clone });
    }

    /*offer changes*/


    async setBidStatus(status, id, i, ib, propId, chatroomDetail = []) {
        var seller_info = await UserService.getUserProfile(chatroomDetail[3]);
        if(status===9 && seller_info.created_by_realtor===1){
            status = 1;
        }

        this.setState({ bidSubmitting: true });
        this.setState({ loading: true });
        const data = {
            "status": status,
            "id": id,
            "prop_id": propId
        };
        /* if(this.state.loading===true){ */
        const response = await UserService.upDateBid(data);
        if (typeof response.id !== 'undefined') {
            this.state['props'][i]['property_bids'][ib].status = status;
            this.setState({ data: this.state['props'] });
            this.setState({ props: this.state['props'] });
            let users_arr = chatroomDetail.filter(i => i > 0);
            const users_id = users_arr.join(',');
            const chatroomData = {
                'property_id': propId
            }
            if (status == 1) {
                const property_buyer = new FormData();
                property_buyer.append('property_id', propId)
                property_buyer.append('buyer_id', chatroomDetail[0])
                // Delete property for another buyers and send email & sms to users
                const delete_property_for_another_buyers = await UserService.deletePropertyForAnotherBuyers(property_buyer);
                //return false;

                //if(delete_property_for_another_buyers.success==true){
                const buyingRoomRes = await UserService.createBuyingRoom(propId);
                if (typeof buyingRoomRes.id !== 'undefined') {
                    const res = await UserService.createChatroom(chatroomData);
                    if (typeof res.id !== 'undefined') {
                        const buying_room_response = await UserService.buyingRoom(propId);
                        if (buying_room_response.chat) {
                            this.setState({ chatId: buying_room_response.chat.id });
                            const formData = new FormData();
                            formData.append('message', 'Welcome to chat room');

                            try {
                                const response = await UserService.sendMessage(formData, buying_room_response.chat.id);
                                if (typeof response.id !== 'undefined') {
                                    this.setState({ loading: false });
                                    this.setState({ bidSubmitting: false });
                                    if (status == 1) {
                                        toast.success("You have successfully accepted the bid. You will be redirected to Transaction table", {
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                        });
                                    } else {
                                        toast.success("Bid sent to seller for approval", {
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                        });
                                    }
                                    window.location.href = `/buying-room/${propId}`;
                                } else {
                                    toast.error("Something went wrong ! Unable to send message.");
                                }
                            } catch (error) {
                                toast.error("Something went wrong ! Unable to send message.");
                            }
                        }
                    } else {
                        this.setState({ loading: false });
                        this.setState({ bidSubmitting: false });
                        toast.error("Something went wrong !");
                    }
                } else {
                    this.setState({ loading: false });
                    this.setState({ bidSubmitting: false });
                    toast.error("Something went wrong !");
                }

                /* } else{

                    this.setState({loading: false});
                    toast.error("Something went wrong ! Cannot delete property for another buyers");
                } */
            } else {
                this.setState({ loading: false });
                this.setState({ bidSubmitting: false });

                const text = status == 9 ? 'Bid sent to seller for approval' : "Offer sent to seller for approval";
                toast.success(text, {
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            }
        } else {
            this.setState({ loading: false });
            this.setState({ bidSubmitting: false });
            toast.error("Something went wrong !");
        }
        /* } */
    }

    showModal(offerPrice, bidId, propId, buyerId) {
        this.setState({
            negotiationData: { 'bid_price': offerPrice, 'bid_id': bidId, 'prop_id': propId, 'buyer_id': buyerId }
        });

        this.setState({ isOpen: true });
    }

    hideModal() {
        this.setState({ isOpen: false });
        this.setState({ tags: [] });
        this.setState({ invitationSent: false });
    }

    negoForm = FormBuilder.group({
        offer_price: ['', [Validators.required]]
    });

    async handleNegotiationSubmit(event: any) {
        event.preventDefault();
        var buyer_profile = await UserService.getUserProfile(this.state.negotiationData.buyer_id);

        this.hideModal();
        this.setState({ loading: true });

        const data = this.state['negotiationData'];
        data['negotiating_prices'] = Math.abs(this.negoForm.get('offer_price').value);

        const res = await UserService.negotiateBid(data);
        if (res.id) {
            const response = await UserService.getOffers();
            this.setState({ data: response, loading: false });
            this.setState({ loading: false });
            this.setState({ viewofferstate: [] });
            const resp = await UserService.getCurrentUserProperties();
            this.makePropertyData(resp);
            toast.success('counter offer sent to '+buyer_profile.name+' '+buyer_profile.last_name, {
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else {
            this.setState({ loading: false });
            if (res && res.message) {
                toast.error(res.message);
            } else {
                toast.error("Something went wrong!");
            }
        }
    }


    getContent(key) {
        this.setState({ key })
    }


    showInvitationModal = (buyerRealtor = false) => {
        this.setState({ tags: [] });
        this.setState({ invitationBuyerModal: false });
        this.setState({ invitationBuyerRealtorModal: false });

        if (!buyerRealtor) {
            if (this.state.invitationBuyerModal == true) {
                this.setState({ invitationBuyerModal: false });
            } else {
                this.setState({ invitationBuyerModal: true })
            }
        } else {
            if (this.state.invitationBuyerRealtorModal == true) {
                this.setState({ invitationBuyerRealtorModal: false });
            } else {
                this.setState({ invitationBuyerRealtorModal: true })
            }
        }
    }

    showInvitationBuyerRealtorBuyerModal = (id?: any) => {
        this.setState({ propId: id });
        this.setState({ tags: [] });
        if (this.state.invitationBuyerRealtorBuyerModal == true) {
            this.setState({ invitationBuyerRealtorBuyerModal: false });
        } else {
            this.setState({ invitationBuyerRealtorBuyerModal: true })
        }
    }


    showviewNegotiatedOffer(i) {
        let clone = Object.assign({}, this.state.viewNegotiatedOfferState);
        switch (clone[i]) {
            case false:
                clone[i] = true;
                break;
            case true:
                clone[i] = false;
                break;
        }
        this.setState({viewNegotiatedOfferState: clone});
    }

    async submitBid(params){
        this.setState({ bidSubmitting: true })
        var bid_details = await UserService.getBidDetail(params.prop_id);

        if(bid_details.length===0){
            bid_details = await UserService.getBidDetailForBuyingRealtor(params.prop_id);
        }

        
        var fd = new FormData();
        fd.append('previous_offer_price', params.previous_offer)
        fd.append('offer_price', params.offer_price)
        fd.append('loan_type', bid_details[0].loan_type)
        fd.append('loan_amount', bid_details[0].loan_type)
        fd.append('down_payment', bid_details[0].down_payment)
        fd.append('credit_score', bid_details[0].credit_score)
        fd.append('bank_balance', bid_details[0].bank_balance)
        fd.append('total_assets', bid_details[0].total_assets)
        fd.append('max_annual_prop_tax', '')
        fd.append('is_pre_approved', bid_details[0].is_pre_approved)
        fd.append('lender', params.lender_id)
        fd.append('realtor', params.buying_realtor_id)
        fd.append('buyer', params.buyer_id)
        fd.append('bank_name', bid_details[0].bank_name)
        fd.append('lender_email', bid_details[0].lender_email)
        fd.append('lender_phone', bid_details[0].lender_email)
        fd.append('file', bid_details[0].file)
        fd.append('prop_id', params.prop_id)
        
        const bid_response = await UserService.submitBid(fd);
        if (typeof bid_response.prop_id !== 'undefined') {
            this.setState({ bidSubmitting: false, showAcceptBidButton: false })
            toast.success('Counter Offer submitted successfully');
        } else{
            this.setState({ bidSubmitting: false })
            toast.error("Something went wrong!");
        }
    }
    
    render() {
        const EMAIL_VALIDATION_REGEX = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
        const buyingroom = this.state['props'].length > 0 ? this.state['props'].filter(prop => prop.status == 1) : [];
        const priceSplitter = (number) => (number && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <div className="my-properties-page">
                    <div className="page-title">
                        {
                            role_id == 1 ? <Trans>My Properties for sale</Trans> :
                                role_id == 2 ? <Trans>My Listings</Trans> :
                                    <Trans>My Properties</Trans>
                        }

                    </div>
                    <div className="my-properties-list-box">
                        <div className="ndp-right-box">
                            {!this.state['businessProfile'] && this.state.user_role !== 1 ?
                                <div className="alert alert-warning alert_box" role="alert"><Link
                                    to="/edit-profile"><Trans>Please complete your business profile</Trans></Link>
                                </div> : null
                            }
                        </div>
                        <ul className="my-properties-list">
                            {
                                this.state['props'].map((prop, i) => {

                                    let handleClick = () => {
                                        this.setPropId(prop.id, false);
                                    };
                                    let handleClickBuyeRealtor = () => {
                                        this.setPropId(prop.id, true);
                                    };
                                    let handleOffiers = () => {
                                        this.showviewoffer(i)
                                    };
                                    let handleNegotiatedOffers = () => {
                                        this.showviewNegotiatedOffer(i)
                                    };

                                    

                                    {
                                        return prop.realtor_additional_role !== 4 && prop.is_show===1 ?
                                            <> 
                                                <li key={i}>
                                                    <div className="mpl-data-box">
                                                        <div className="mpl-icon-box">
                                                            <img alt={prop.title}
                                                                src={UrlService.imagesPath() + '/' + prop.media}
                                                            />
                                                        </div>
                                                        <div className="mpl-dec-box">
                                                            <div className="mpl-left-box">
                                                                <div className="mpll-title">
                                                                    {/*{prop.title}*/}
                                                                    <Trans>{prop.address}</Trans>
                                                                    {role_id == 2 ? !prop.lender_id ? ' Seller Realtor' : ' Buyer Realtor' : null}
                                                                </div>
                                                                {/*<div className="mpll-dec"><Trans>{prop.address}</Trans></div>*/}
                                                                <div className="mpll-price">
                                                                    <b><Trans>List Price</Trans>:</b>
                                                                    <span>${priceSplitter(prop.price)}</span>
                                                                </div>
                                                                <div className="mpll-btn-row">
                                                                    <Link to={'property-detail/' + prop.id}>
                                                                        {
                                                                            role_id == 1 ?
                                                                                <Trans>View Property Details</Trans> :
                                                                                <Trans>View Full Detail</Trans>
                                                                        }
                                                                    </Link>
                                                                    {
                                                                        (prop.status == 1) ?
                                                                            <Link to={"/buying-room/" + prop.id}><Trans>Transaction Table</Trans></Link>
                                                                            :
                                                                            <>
                                                                                {
                                                                                    (prop.property_bids_association.length > 0 && role_id != 3 /* && !prop.lender_id */) ?
                                                                                        <>
                                                                                        <span onClick={handleOffiers}><Trans>View Offers</Trans></span>
                                                                                        {role_id == 2 ?
                                                                                                <Link to={'submit-bid/' + prop.id} role="menuitem"><Trans>Submit Bid</Trans></Link>
                                                                                            : null }
                                                                                            {/* {(role_id==2 && prop.maxBid.bids && prop.maxBid.bids_negotiations.length > 0) ?  */}
                                                                                            {(role_id!=3 && prop.maxBid.bids_negotiations.length > 0) ? 
                                                                                            <><a onClick={handleNegotiatedOffers}>
                                                                                                <Trans>View Counter Offers</Trans>
                                                                                            </a>
                                                                                            
                                                                                            {prop.lender_id ?
                                                                                                <Link to={'submit-bid/' + prop.id} role="menuitem">
                                                                                                    <Trans>Submit Counter Offers</Trans>
                                                                                                </Link>
                                                                                            : null }</> : null  }
                                                                                            
                                                                                            </>:
                                                                                        role_id==2 ? 
                                                                                            <>
                                                                                            {/* {prop.lender_id ? */}
                                                                                            <Link to={'submit-bid/' + prop.id} role="menuitem"><Trans>Submit Bid</Trans></Link>
                                                                                            {/* : null } */}
                                                                                            {(prop.maxBid.bids && prop.maxBid.bids_negotiations.length > 0) ? 
                                                                                            <a onClick={handleNegotiatedOffers}>
                                                                                                <Trans>View Counter Offers</Trans>
                                                                                            </a> : null }
                                                                                            </>
                                                                                        : null
                                                                                }
                                                                                {
                                                                                    role_id == 1 && prop.bidStatus !== 9 ?
                                                                                        <span onClick={handleClick}><Trans>Invite Buyers</Trans></span> :
                                                                                        <> {prop.bidStatus}

                                                                                            {prop.seller_id > 0 ?
                                                                                                <span onClick={handleClick}><Trans>Invite Buyers</Trans></span>
                                                                                                : null}
                                                                                            {!prop.lender_id ? 
                                                                                                <span onClick={handleClickBuyeRealtor}><Trans>Invite Realtor</Trans></span>
                                                                                            : null }
                                                                                        </>
                                                                                }
                                                                            </>
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="mpl-right-box">
                                                                {
                                                                    
                                                                    (prop.property_bids_association.length > 0) ?
                                                                        <>
                                                                            <div className="mplr-latestoffer-box">
                                                                                <Trans> Highest offer </Trans>
                                                                                ({prop.property_bids_association.length}
                                                                                <Trans> Offers</Trans>)
                                                                            </div>
                                                                            <div className="mplr-offermade-box">
                                                                                <Trans>Offer Made By</Trans>: &nbsp;
                                                                                {prop.maxBid.user?.name + " " + prop.maxBid.user?.last_name}
                                                                            </div>
                                                                            <div className="mplr-offerprice-box">
                                                                                <b><Trans>Offer Price</Trans> </b>
                                                                                <span>
                                                                                    ${priceSplitter(prop.maxBid.bids[0].offer_price)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="mplr-date-box">
                                                                                {moment(prop.maxBid.bids[0].created_at).format('MM/DD/YYYY hh:mm A')}
                                                                            </div>
                                                                            {
                                                                                (prop.progress_status) ?
                                                                                    <div className="mplr-status-box">
                                                                                        <Trans>Status</Trans>:&nbsp;{prop.progress_status}
                                                                                    </div>
                                                                                    : prop.bidStatus == 9 ?
                                                                                        <div className="mplr-status-box">
                                                                                            <Trans>Status</Trans>:&nbsp;
                                                                                            <Trans>
                                                                                                {
                                                                                                    role_id == 1 ? 'Realtor accepted the bid' : 'Waiting for seller approval'
                                                                                                }
                                                                                            </Trans>
                                                                                        </div>
                                                                                        :
                                                                                        <div className="mplr-status-box">
                                                                                            <Trans>Status</Trans>:&nbsp;
                                                                                        <Trans>No action taken yet</Trans>
                                                                                        </div>
                                                                            }

                                                                        </> : <div className="mplr-status-box">
                                                                            <Trans>Status</Trans>: <Trans>No Current offers</Trans>
                                                                        </div>
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="res-button-box">
                                                            <div className="mpll-btn-row">
                                                                <Link to={'property-detail/' + prop.id}>
                                                                    <Trans>View Full Detail</Trans>
                                                                </Link>
                                                                {
                                                                    (prop.status == 1) ?
                                                                        <Link to={"/buying-room/" + prop.id}><Trans>Transaction Table</Trans></Link>
                                                                        :
                                                                        <>
                                                                            {(prop.property_bids_association.length > 0) ?
                                                                                <span onClick={handleOffiers}><Trans>View Offers</Trans></span> : null}
                                                                                
                                                                            <div className="md-dropdown">
                                                                                <a id="menu1" data-toggle="dropdown">Take Action</a>
                                                                                <ul className="dropdown-menu py-0">
                                                                                    <li role="presentation">
                                                                                        {
                                                                                            prop.status === 0 ?
                                                                                                <a role="menuitem" className="invittedUser"
                                                                                                    onClick={() => {
                                                                                                        handleClick();
                                                                                                        this.showInvitationModal(false)
                                                                                                    }}
                                                                                                    data-toggle="modal" data-target="#myModal">
                                                                                                    <Trans>Invite Buyers</Trans>
                                                                                                    <span style={{ color: "#30CC98" }}>
                                                                                                        <i className="fa fa-check-circle"></i>
                                                                                                    </span>
                                                                                                </a>
                                                                                                :
                                                                                                <a role="menuitem"
                                                                                                    className="invittedUser"
                                                                                                    onClick={handleClick}>
                                                                                                    <Trans>Invite Buyers</Trans>
                                                                                                    <span style={{ color: "#30CC98" }}>
                                                                                                        <i className="fa fa-check-circle"></i>
                                                                                                    </span>
                                                                                                </a>
                                                                                        }
                                                                                    </li>
                                                                                    <li role="presentation">
                                                                                        {
                                                                                            prop.status === 0 ?
                                                                                                <a role="menuitem" className="invittedUser"
                                                                                                    onClick={() => {
                                                                                                        handleClickBuyeRealtor();
                                                                                                        this.showInvitationModal(true)
                                                                                                    }}
                                                                                                    data-toggle="modal" data-target="#myModal">
                                                                                                    <Trans>Invite Realtor</Trans>
                                                                                                    <span style={{ color: "#30CC98" }}>
                                                                                                        <i className="fa fa-check-circle"></i>
                                                                                                    </span>
                                                                                                </a>
                                                                                                :
                                                                                                <a role="menuitem"
                                                                                                    className="invittedUser"
                                                                                                    onClick={()=>{
                                                                                                        handleClickBuyeRealtor();
                                                                                                        this.showInvitationModal(true)
                                                                                                    }}>
                                                                                                    <Trans>Invite Realtor</Trans>
                                                                                                    <span style={{ color: "#30CC98" }}>
                                                                                                        <i className="fa fa-check-circle"></i>
                                                                                                    </span>
                                                                                                </a>
                                                                                        }
                                                                                    </li>
                                                                                    
                                                                                    {(prop.property_bids_association.length > 0 && role_id != 3 && !prop.lender_id) ?
                                                                                        <>                                                                                       
                                                                                            {(role_id==2 && prop.maxBid.bids && prop.maxBid.bids_negotiations.length > 0) ? 
                                                                                            <li><a role="menuitem" onClick={handleNegotiatedOffers}>
                                                                                                <Trans>View Counter Offers</Trans>
                                                                                            </a></li> : null  }
                                                                                            
                                                                                            </>:
                                                                                        role_id==2 ? 
                                                                                            <>
                                                                                            <li>
                                                                                                <Link to={'submit-bid/' + prop.id} role="menuitem"><Trans>Submit Bid</Trans></Link>
                                                                                            </li>

                                                                                            {(prop.maxBid.bids && prop.maxBid.bids_negotiations.length > 0) ? 
                                                                                            <li><a role="menuitem" onClick={handleNegotiatedOffers}>
                                                                                                <Trans>View Counter Offers</Trans>
                                                                                            </a></li> : null }
                                                                                            </>
                                                                                        : null
                                                                                    }

                                                                                    {
                                                                                        global['realtorRole'] != role_id ? <>
                                                                                            <li role="presentation" className="py-2">
                                                                                                <Link to="/offers" role="menuitem"><Trans>View Offers</Trans>
                                                                                                    <span style={{ color: "#30CC98" }}>
                                                                                                        <i className="fa fa-check-circle"></i>
                                                                                                    </span>
                                                                                                </Link>
                                                                                            </li>

                                                                                        </>
                                                                                            : null
                                                                                    }
                                                                                </ul>
                                                                            </div>
                                                                        </>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(this.state.viewofferstate[i] == true) && (
                                                        <ul className="mpl-dtl-list">
                                                            {
                                                                (prop.status != 1) ?
                                                                    (prop.property_bids.length > 0) ?
                                                                        prop.property_bids.map((propBid, bi) => {
                                                                            return <>
                                                                                <li key={'t-' + bi}>
                                                                                    <div className="mpl-dtl-list-row">
                                                                                        <div className="mpl-dtl-img">
                                                                                            <img src={propBid.user.avatar || defaultImage} />
                                                                                        </div>
                                                                                        <div className="mpl-dtl-content">
                                                                                            <div className="mpl-dtl-title">
                                                                                                {propBid.user.name + ' ' + propBid.user.last_name}
                                                                                            </div>
                                                                                            <div className="mpl-dtl-dec">
                                                                                                <b><Trans>Offer Price</Trans>:</b>
                                                                                                <span>${priceSplitter(propBid.offer_price)}</span>
                                                                                            </div>
                                                                                            <div
                                                                                                className="mpl-dtl-transaction">
                                                                                                <b><Trans>Status</Trans>:</b>
                                                                                                {
                                                                                                    propBid.status === 1 ?
                                                                                                        <span><Trans>Accepted</Trans></span>
                                                                                                        : propBid.status === -1 ?
                                                                                                            <span><Trans>Rejected</Trans></span>
                                                                                                            : propBid.status === 2 ?
                                                                                                                <span><Trans>Counter offer Requested</Trans></span>
                                                                                                                : propBid.status === 9 ?
                                                                                                                    <span><Trans>Accepted by realtor</Trans></span>
                                                                                                                    :
                                                                                                                    <span><Trans>Pending</Trans></span>
                                                                                                }

                                                                                            </div>
                                                                                        </div>
                                                                                        {
                                                                                            propBid.status === 0 || propBid.status === 9 ?
                                                                                                <div className="md-dropdown">
                                                                                                    {
                                                                                                        role_id == 1 ?
                                                                                                            <>
                                                                                                                {
                                                                                                                    propBid.status === 9 ?
                                                                                                                        <a className="mpl-dtl-buton"
                                                                                                                            onClick={() => this.setBidStatus(1, propBid.id, i, bi, propBid.prop_id, [
                                                                                                                                propBid.buyer_id,
                                                                                                                                propBid.buyer_realtor_id,
                                                                                                                                propBid.lender_id,
                                                                                                                                propBid.seller_id,
                                                                                                                                propBid.seller_realtor_id
                                                                                                                            ])}
                                                                                                                        >
                                                                                                                            <Trans>Accept</Trans>
                                                                                                                        </a> :
                                                                                                                        this.state.bidSubmitting === false ?
                                                                                                                            <a className="mpl-dtl-buton" id="menu2" data-toggle="dropdown">
                                                                                                                                <Trans>Take Action</Trans>
                                                                                                                            </a> : <a className="mpl-dtl-buton">
                                                                                                                                <Trans>Please wait ...</Trans>
                                                                                                                            </a>

                                                                                                                }

                                                                                                                {this.state.bidSubmitting === false ?
                                                                                                                    <ul className="dropdown-menu" role="menu" aria-labelledby="menu1">
                                                                                                                        <li role="presentation">
                                                                                                                            <a role="menuitem" className="invittedUser"
                                                                                                                                onClick={() => this.setBidStatus(-1, propBid.id, i, bi, propBid.prop_id)}>
                                                                                                                                <Trans>Reject</Trans>
                                                                                                                            </a>
                                                                                                                        </li>
                                                                                                                        <li role="presentation">
                                                                                                                            <a role="menuitem" className="invittedUser"
                                                                                                                                onClick={() => this.setBidStatus(1, propBid.id, i, bi, propBid.prop_id, [
                                                                                                                                    propBid.buyer_id,
                                                                                                                                    propBid.buyer_realtor_id,
                                                                                                                                    propBid.lender_id,
                                                                                                                                    propBid.seller_id,
                                                                                                                                    propBid.seller_realtor_id
                                                                                                                                ])}
                                                                                                                            >
                                                                                                                                <Trans>Accept</Trans>
                                                                                                                            </a>
                                                                                                                        </li>
                                                                                                                        {prop.buyer_bid_count[propBid.buyer_id]['count'] < 4 ?
                                                                                                                            <li role="presentation">
                                                                                                                                <a role="menuitem" className="invittedUser"
                                                                                                                                    onClick={() => this.showModal(propBid.offer_price, propBid.id, propBid.prop_id, propBid.buyer_id)}>
                                                                                                                                    <Trans>Counter Offer</Trans>
                                                                                                                                </a>
                                                                                                                            </li>
                                                                                                                            : null
                                                                                                                        }
                                                                                                                        <li role="presentation">
                                                                                                                            <Link to={"/bid-history/" + propBid.prop_id} role="menuitem" className="invittedUser">
                                                                                                                                <Trans>View Bid Detail</Trans>
                                                                                                                            </Link>
                                                                                                                        </li>
                                                                                                                    </ul>
                                                                                                                    : null}
                                                                                                            </> : 
                                                                                                            //prop.maxBid.realtor_id!=0 ? 
                                                                                                            <>
                                                                                                            {/* {role_id == 2 && !prop.lender_id && prop.maxBid.realtor_id!=current_user_id ? */} 
                                                                                                            {role_id == 2 && !prop.lender_id ? 
                                                                                                            <>
                                                                                                                <a className="mpl-dtl-buton" id="menu2" data-toggle="dropdown"><Trans>Take Action</Trans></a>
                                                                                                                <ul className="dropdown-menu" role="menu"
                                                                                                                    aria-labelledby="menu1">
                                                                                                                    <li role="presentation">
                                                                                                                        <a role="menuitem" className="invittedUser" onClick={ () => this.setBidStatus(-1, propBid.id, i, bi, propBid.prop_id)}>
                                                                                                                            <Trans>Reject</Trans>
                                                                                                                        </a>
                                                                                                                    </li>
                                                                                                                    <li role="presentation">
                                                                                                                        <a role="menuitem"
                                                                                                                            className="invittedUser"
                                                                                                                            onClick={() => this.setBidStatus(9, propBid.id, i, bi, propBid.prop_id, [
                                                                                                                                propBid.buyer_id,
                                                                                                                                propBid.buyer_realtor_id,
                                                                                                                                propBid.lender_id,
                                                                                                                                propBid.seller_id,
                                                                                                                                propBid.seller_realtor_id
                                                                                                                            ])}
                                                                                                                        >
                                                                                                                            <Trans>Accept</Trans>
                                                                                                                        </a>
                                                                                                                    </li>
                                                                                                                    {prop.buyer_bid_count[propBid.buyer_id]['count'] < 4 ?
                                                                                                                        <li role="presentation">
                                                                                                                            <a role="menuitem"
                                                                                                                                className="invittedUser"
                                                                                                                                onClick={() => this.showModal(propBid.offer_price, propBid.id, propBid.prop_id, propBid.buyer_id)}
                                                                                                                            >
                                                                                                                                <Trans>Counter Offer</Trans>
                                                                                                                            </a>
                                                                                                                        </li>
                                                                                                                        : null
                                                                                                                    }
                                                                                                                    <li role="presentation">
                                                                                                                        <Link to={"/bid-history/" + propBid.prop_id} role="menuitem" className="invittedUser">
                                                                                                                            <Trans>View Bid Detail</Trans>
                                                                                                                        </Link>
                                                                                                                    </li>
                                                                                                                </ul>
                                                                                                            </>
                                                                                                            : null }
                                                                                                            </>
                                                                                                            //: null
                                                                                                    }
                                                                                                </div>
                                                                                                : propBid.status === 1 ?
                                                                                                    <Link to={"/buying-room/" + propBid.prop_id} role="menuitem" className="buying-room">
                                                                                                        <Trans>Transaction Table</Trans>
                                                                                                    </Link>
                                                                                                    : null
                                                                                        }
                                                                                    </div>
                                                                                </li>
                                                                            </>
                                                                        })
                                                                        : null
                                                                    : null
                                                            }
                                                        </ul>
                                                        
                                                    )}

                                                    {(this.state.viewNegotiatedOfferState[i] == true) && (
                                                        <ul className="mpl-dtl-list">
                                                            {
                                                                (prop.maxBid.bids && prop.maxBid.bids_negotiations.length > 0) ?
                                                                    prop.maxBid.bids_negotiations.map((bid,bi) => {
                                                                        return <li>
                                                                            <div className="mpl-dtl-list-row">
                                                                                <div className="mpl-dtl-img"></div>
                                                                                <div className="mpl-dtl-content">
                                                                                    {/*<div className="mpl-dtl-title">*/}
                                                                                    {/*asd asdfa sdf*/}
                                                                                    {/*</div>*/}
                                                                                    <div className="mpl-dtl-dec">
                                                                                        <b><Trans>Offer Price</Trans>:</b>
                                                                                        <span>${priceSplitter(bid.bid_price)}</span>
                                                                                    </div>
                                                                                    <div className="mpl-dtl-dec">
                                                                                        <b><Trans>Counter Offer</Trans>:</b>
                                                                                        <span>${priceSplitter(bid.negotiating_prices)}</span>
                                                                                    </div>
                                                                                    <div className="mpl-dtl-transaction">
                                                                                        <b><Trans>Status</Trans>:</b>
                                                                                        {
                                                                                            bid.status === 1 ?
                                                                                                <span><Trans>Accepted</Trans></span>
                                                                                                : bid.status === 0 ?
                                                                                                <span><Trans>No action</Trans></span>
                                                                                                :   <span><Trans>Pending</Trans></span>
                                                                                        }
                                                                                    </div>
        
                                                                                </div>
                                                                                {
                                                                                    bid.status === 1 ?
                                                                                        null
                                                                                        : bid.status === 0 /* && !prop.lender_id */ && prop.maxBid.realtor_id==current_user_id ?
                                                                                        <div className="mpl-dtl-dropdown">
                                                                                           {/*  <a className="mpl-dtl-buton" id="buyer_accept_counter_offer" onClick={() => this.setBidStatus(1, bid.bid_id, i, bi, bid.prop_id, [
                                                                                                prop.property_bids[0].buyer_id,
                                                                                                prop.property_bids[0].buyer_realtor_id,
                                                                                                prop.property_bids[0].lender_id,
                                                                                                prop.property_bids[0].seller_id,
                                                                                                prop.property_bids[0].seller_realtor_id
                                                                                            ])}>Accept</a> */}
                                                                                            { !this.state.bidSubmitting && this.state.showAcceptBidButton ?
                                                                                                <a className="mpl-dtl-buton" id="buyer_accept_counter_offer" onClick={() => this.submitBid({
                                                                                                    prop_id: bid.prop_id, 
                                                                                                    buyer_id: prop.maxBid.user_id, 
                                                                                                    buying_realtor_id : prop.maxBid.realtor_id,
                                                                                                    lender_id: prop.maxBid.lender_id,
                                                                                                    previous_offer: bid.bid_price,
                                                                                                    offer_price: bid.negotiating_prices
                                                                                                    })}>Accept Counter Offer</a>
                                                                                                : null }
                                                                                        </div>
                                                                                        : null
                                                                                }
        
                                                                            </div>
                                                                        </li>
                                                                    })
                                                                    : null
                                                            }
                                                        </ul>
                                                    )}
                                                </li>
                                            </>
                                            : <>
                                                <li key={i}>
                                                    <div className="mpl-data-box">
                                                        <div className="mpl-icon-box">
                                                            <img alt={prop.title}
                                                                src={UrlService.imagesPath() + '/' + prop.media}
                                                            />
                                                        </div>
                                                        <div className="mpl-dec-box">
                                                            <div className="mpl-left-box">
                                                                <div className="mpll-title">
                                                                    {/*{prop.title}*/}
                                                                    <Trans>{prop.address}</Trans>
                                                                    (<Trans> Buyer Realtor Invited by Seller Realtor</Trans>)
                                                                </div>
                                                                {/*<div className="mpll-dec"><Trans>{prop.address}</Trans></div>*/}
                                                                <div className="mpll-price">
                                                                    <b><Trans>List Price</Trans>:</b>
                                                                    <span>${priceSplitter(prop.price)}</span>
                                                                </div>
                                                                <div className="mpll-btn-row">
                                                                    <Link to={'property-detail/' + prop.id}>
                                                                        <Trans>View Full Detail</Trans>
                                                                    </Link>
                                                                    {
                                                                        (prop.status == 1) ?
                                                                            <Link to={"/buying-room/" + prop.id}><Trans>Transaction Table</Trans></Link>
                                                                            :
                                                                            <>
                                                                                <span onClick={handleOffiers}><Trans>View Offers</Trans></span>

                                                                                <Link to={'submit-bid/' + prop.id} role="menuitem">
                                                                                    {prop.bids && prop.bids[prop.bids.length - 1]['bids_negotiations'].length > 0 ?
                                                                                        <Trans>Submit Counter Offers</Trans>
                                                                                        : <Trans>Submit Bid</Trans>
                                                                                    }
                                                                                </Link>
                                                                                
                                                                                {
                                                                                    (prop.property_bids_association?.length > 0 && role_id != 3 && !prop.lender_id) ?
                                                                                        <>
                                                                                        
                                                                                        
                                                                                            {(role_id==2 && prop.maxBid.bids && prop.maxBid.bids_negotiations.length > 0) ? 
                                                                                            <a onClick={handleNegotiatedOffers}>
                                                                                                <Trans>View Counter Offers</Trans>
                                                                                            </a> : null  }
                                                                                            
                                                                                            </>:
                                                                                        role_id==2 ? 
                                                                                            <>
                                                                                           
                                                                                            {(prop.maxBid.bids && prop.maxBid.bids_negotiations.length > 0) ? 
                                                                                            <a onClick={handleNegotiatedOffers}>
                                                                                                <Trans>View Counter Offers</Trans>
                                                                                            </a> : null }
                                                                                            </>
                                                                                        : null
                                                                                }
                                                                                
                                                                                <span onClick={(event) => this.showInvitationBuyerRealtorBuyerModal(prop.id)}><Trans>Invite Buyers</Trans></span>
                                                                            </>
                                                                    }
                                                                </div>
                                                            </div>

                                                        </div>

                                                    </div>

                                                                    
                                                    {(this.state.viewofferstate[i] == true) && (
                                                        <ul className="mpl-dtl-list">
                                                            { prop.prop_bids.map((propBid, i)=>{
                                                                return <li key={i}>
                                                                <div className="mpl-dtl-list-row">
                                                                    <div className="mpl-dtl-img">
                                                                        <img src={propBid.buyer?.avatar || defaultImage} />
                                                                    </div>
                                                                    <div className="mpl-dtl-content">
                                                                        <div className="mpl-dtl-title">
                                                                            {propBid.buyer?.name + ' ' + propBid.buyer?.last_name}
                                                                        </div>
                                                                        <div className="mpl-dtl-dec">
                                                                            <b><Trans>Offer Price</Trans>:</b>
                                                                            <span>${priceSplitter(propBid.offer_price)}</span>
                                                                        </div>
                                                                        <div
                                                                            className="mpl-dtl-transaction">
                                                                            <b><Trans>Status</Trans>:</b>
                                                                            {
                                                                                propBid.status === 1 ?
                                                                                    <span><Trans>Accepted</Trans></span>
                                                                                    : propBid.status === -1 ?
                                                                                        <span><Trans>Rejected</Trans></span>
                                                                                        : propBid.status === 2 ?
                                                                                            <span><Trans>Counter offer Requested</Trans></span>
                                                                                            : propBid.status === 9 ?
                                                                                                <span><Trans>Accepted by realtor</Trans></span>
                                                                                                :
                                                                                                <span><Trans>Pending</Trans></span>
                                                                            }

                                                                        </div>
                                                                    </div>
                                                                    </div>
                                                                </li>
                                                            }) }
                                                            
                                                        </ul>
                                                        
                                                    )}
                                                </li>
                                            </>

                                    }
                                })
                            }

                        </ul>
                    </div>
                </div>
                {(this.state.invitationBuyerModal == true) && (
                    <div className="add-realtor-popup-page">
                        <div className="arp-close-btn">
                            <img src="../images/close-btn.svg" onClick={(event) => this.showInvitationModal(false)} />
                        </div>
                        <div className="add-realtor-popup">
                            <div className="arp-title"><Trans>Invite My Buyer</Trans></div>
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
                                                        inputProps={{ placeholder: 'Add buyer email' }}
                                                        validationRegex={EMAIL_VALIDATION_REGEX}
                                                        pasteSplit={data => {
                                                            return data.replace(/[\r\n,;]/g, ' ').split(' ').map(d => d.trim())
                                                        }}
                                                        onChange={(event) => this.handleChange(event)} />
                                                </li>
                                                {!this.state['invitationLoader']
                                                    ?
                                                    <div className="arp-btn-row">
                                                        <span className="arp-submit-btn"
                                                            onClick={(event) => this.handleFormSubmit(event, false)}><Trans>Submit</Trans></span>
                                                    </div>
                                                    :
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
                {(this.state.invitationBuyerRealtorModal == true) && (
                    <div className="add-realtor-popup-page">
                        <div className="arp-close-btn">
                            <img src="../images/close-btn.svg" onClick={(event) => this.showInvitationModal(true)} />
                        </div>
                        <div className="add-realtor-popup">
                            <div className="arp-title"><Trans>Invite My Buyer Realtor</Trans></div>
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
                                                        inputProps={{ placeholder: 'Add buyer realtor email' }}
                                                        validationRegex={EMAIL_VALIDATION_REGEX}
                                                        pasteSplit={data => {
                                                            return data.replace(/[\r\n,;]/g, ' ').split(' ').map(d => d.trim())
                                                        }}
                                                        onChange={(event) => this.handleChange(event)} />
                                                </li>
                                                {!this.state['invitationLoader']
                                                    ?
                                                    <div className="arp-btn-row">
                                                        <span
                                                            className="arp-submit-btn"
                                                            onClick={(event) => this.handleFormSubmit(event, true)}><Trans>Submit</Trans></span>
                                                    </div>
                                                    :
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
                {(this.state.isOpen == true) && (
                    <div className="add-realtor-popup-page">
                        <div className="arp-close-btn">
                            <img src="../images/close-btn.svg" onClick={() => this.hideModal()} />
                        </div>
                        <div className="add-realtor-popup">
                            <div className="arp-title"><Trans>Negotiate</Trans></div>
                            <div className="arp-content">
                                <FieldGroup
                                    control={this.negoForm}
                                    render={({ invalid, pristine, pending, meta }) => (
                                        <form noValidate
                                            onSubmit={(event) => this.handleNegotiationSubmit(event)}>
                                            <ul className="arp-inputfld-list">
                                                <li className="fullwidth arp-margin30">
                                                    <FieldControl
                                                        name="offer_price"
                                                        render={NumberInput}
                                                        meta={{ label: "Counter Offer" }}
                                                    />
                                                </li>
                                                {
                                                    !this.state['invitationSent']
                                                        ?
                                                        <div className="modal-footer">
                                                            {
                                                                !this.state['invitationLoader']
                                                                    ?

                                                                    < div className="arp-btn-row">
                                                                        <input type="submit" name="submit"
                                                                            disabled={invalid}
                                                                            className="arp-submit-btn">
                                                                        </input>
                                                                    </div>
                                                                    :
                                                                    <button type="submit" name="submit" disabled
                                                                        className="btn btn-invite-buyers">
                                                                        <span
                                                                            className="spinner-grow spinner-grow-sm"
                                                                            role="status"
                                                                            aria-hidden="true">
                                                                        </span>
                                                                        <span
                                                                            className="sr-only"><Trans>Loading...</Trans></span>
                                                                    </button>
                                                            }
                                                        </div>
                                                        : null}
                                            </ul>
                                        </form>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                )}
                {(this.state.invitationBuyerRealtorBuyerModal == true) && (
                    <div className="add-realtor-popup-page">
                        <div className="arp-close-btn">
                            <img src="../images/close-btn.svg"
                                onClick={(event) => this.showInvitationBuyerRealtorBuyerModal()} />
                        </div>
                        <div className="add-realtor-popup">
                            <div className="arp-title"><Trans>Invite My Buyer</Trans></div>
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
                                                        inputProps={{ placeholder: 'Add buyer realtor email' }}
                                                        validationRegex={EMAIL_VALIDATION_REGEX}
                                                        pasteSplit={data => {
                                                            return data.replace(/[\r\n,;]/g, ' ').split(' ').map(d => d.trim())
                                                        }}
                                                        onChange={(event) => this.handleChange(event)} />
                                                </li>
                                                {!this.state['invitationLoader']
                                                    ?
                                                    <div className="arp-btn-row">
                                                        <span className="arp-submit-btn"
                                                            onClick={(event) => this.handleFormSubmitBuyerRealtorBuyerModal(event, true)}><Trans>Submit</Trans></span>
                                                    </div>
                                                    :
                                                    <div className="arp-btn-row">
                                                        <span className="arp-submit-btn spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                                    </div>
                                                }

                                            </>
                                            :
                                            <>
                                                <li className="fullwidth arp-margin30"><b><Trans>Invitation Sent
                                                    Successfully</Trans></b></li>
                                            </>
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

            </React.Fragment>
        )

    }

}


export default MyProperties;