import React, {Component} from "react";
import {Link, RouteComponentProps} from "react-router-dom";
import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import "./_style.scss";
import UserService from "../../../services/UserService";
import UrlService from "../../../services/UrlService";
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css'

import Skeleton from 'react-loading-skeleton';
import {Trans} from "react-i18next";
import moment from "moment";
import {CookieService} from "../../../services/imports";
import {toast} from "react-toastify";
const role_id = CookieService.get('role_id');

class PropertyInvitations extends Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            props: [],
            loading: 'true',
            tags: [],
            viewofferstate: [],
            viewNegotiatedOfferState: [],
            propId: 0,
            data : [],
            bidSubmitting: false,
            showAcceptBidButton: true
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
        this.setState({tags});

    }

    async componentDidMount() {
        var properties = [];
        var properties_ids = [];
        const response = await UserService.getInvitedProperties();
        for (let i = 0; i < response.length; i++) {
            if (!properties_ids.includes(response[i].id.toString())) {
                properties_ids.push(response[i].id.toString())
                properties.push(response[i])
            }
        }

        properties.forEach((v, k) => {
            this.state['viewofferstate'].push(false);
            this.state['viewNegotiatedOfferState'].push(false);
        });
        this.setState({props: properties, loading: 'false'});
    }

    async handleFormSubmit(event: any) {
        event.preventDefault();
        const data = {
            invitation: this.state['tags'],
            propId: this.state['propId']
        };
        const response = await UserService.sendInvitations(data);
        if (response) {
            //this.props.history.push("/my-properties");
        } else {
            alert("Some thing went wrong please try again.");
        }
    }

    setPropId(id) {
        this.setState({propId: id});
    }

    getNegotiatedPrice(negoTiationArray) {

        return 123123
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
        this.setState({viewofferstate: clone});
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
    async setBidStatus(status, bidId, i, ib, propId, chatroomDetail = []) {        
        this.setState({bidSubmitting: true});
        this.setState({loading: true});
        if(this.state.loading==='false' || this.state.loading===false){
            const data = {
                "status": status,
                "id": bidId,
                "prop_id": propId
            };
            const response = await UserService.upDateBid(data);
            if (typeof response.id !== 'undefined') {

                if(this.state['props'][i]['bids'][ib]){
                    this.state['props'][i]['bids'][ib]['bids_negotiations'][ib].status = status;
                }
                
                this.setState({data: this.state['props']});
                this.setState({props: this.state['props']});
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
    
                    //if(delete_property_for_another_buyers.success==true){
                    const buyingRoomRes = await UserService.createBuyingRoom(propId);
                    if (typeof buyingRoomRes.id !== 'undefined') {
                        const res = await UserService.createChatroom(chatroomData);
                        if (typeof res.id !== 'undefined') {
                            const buying_room_response = await UserService.buyingRoom(propId);
                            if (buying_room_response.chat) {
                                this.setState({chatId: buying_room_response.chat.id});
                                const formData = new FormData();
                                formData.append('message', 'Welcome to chat room');
    
                                try {
                                    const response = await UserService.sendMessage(formData, buying_room_response.chat.id);
                                    if (typeof response.id !== 'undefined') {
                                        this.setState({loading: false});
                                        this.setState({bidSubmitting: false});
                                        if(role_id==2){
                                            toast.success("Bid sent to seller for approval", {
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                            });
                                        } else{
                                            toast.success("You have successfully accepted the bid. You will be redirected to Transaction table", {
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                            });
                                        }
                                        window.location.href = `/buying-room/${propId}`;
                                    } else {
                                        toast.error("Something went wrong6 ! Unable to send message.");
                                    }
                                } catch (error) {
                                    toast.error("Something went wrong 5! Unable to send message.");
                                }
                            }
                        } else {
                            this.setState({loading: false});
                            this.setState({bidSubmitting: false});
                            toast.error("Something went wrong2 !");
                        }
                    } else {
                        this.setState({loading: false});
                        this.setState({bidSubmitting: false});
                        toast.error("Something went wrong 1!");
                    }
                }else{
                    this.setState({loading: false});
                    this.setState({bidSubmitting: false});
                    toast.error("Something went wrong to accept offer!");
                }
            }else{
                this.setState({loading: false});
                this.setState({bidSubmitting: false});
                toast.error("Something went wrong 3!");
            }
        } else{
            console.log("don't submit form")
        }
    }

    async submitBid(params){
        this.setState({ bidSubmitting: true })
        const negotiationData = await UserService.getBidNegotiation(params.prop_id);
        var fd = new FormData();
        fd.append('previous_offer_price', params.previous_offer)
        fd.append('offer_price', params.offer_price)
        fd.append('loan_type', negotiationData.bidNegotiation[0].bid[0].loan_type)
        fd.append('loan_amount', negotiationData.bidNegotiation[0].bid[0].loan_type)
        fd.append('down_payment', negotiationData.bidNegotiation[0].bid[0].down_payment)
        fd.append('credit_score', negotiationData.bidNegotiation[0].bid[0].credit_score)
        fd.append('bank_balance', negotiationData.bidNegotiation[0].bid[0].bank_balance)
        fd.append('total_assets', negotiationData.bidNegotiation[0].bid[0].total_assets)
        fd.append('max_annual_prop_tax', '')
        fd.append('is_pre_approved', negotiationData.bidNegotiation[0].bid[0].is_pre_approved)
        fd.append('lender', params.lender_id)
        fd.append('realtor', params.buying_realtor_id)
        fd.append('buyer', params.buyer_id)
        fd.append('bank_name', negotiationData.bidNegotiation[0].bid[0].bank_name)
        fd.append('lender_email', negotiationData.bidNegotiation[0].bid[0].lender_email)
        fd.append('lender_phone', negotiationData.bidNegotiation[0].bid[0].lender_email)
        fd.append('file', negotiationData.bidNegotiation[0].bid[0].file)
        fd.append('prop_id', params.prop_id)


        const bid_response = await UserService.submitBid(fd);
        if (typeof bid_response.prop_id !== 'undefined') {
            this.setState({ bidSubmitting: false, showAcceptBidButton: false })
            toast.success('Counter Offer accepted successfully');
        } else{
            this.setState({ bidSubmitting: false })
            toast.error("Something went wrong!");
        }
    }

    render() {
        const EMAIL_VALIDATION_REGEX = /^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i
        const priceSplitter = (number) => (number && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>

                <div className="my-properties-page">
                    <div className="page-title">
                        <Trans>Properties Invitations</Trans>
                    </div>
                    <div className="my-properties-list-box">
                        <ul className="my-properties-list">
                            {
                                this.state['props'].map((prop, i) => {
                                    let handleOffiers = () => {
                                        this.showviewoffer(i)
                                    };
                                    let handleNegotiatedOffiers = () => {
                                        this.showviewNegotiatedOffer(i)
                                    };
                                    return prop.is_show===1 ?  <>
                                        <li key={i}>
                                            <div className="mpl-data-box">
                                                <div className="mpl-icon-box">
                                                    <img alt={prop.title} src={UrlService.imagesPath() + '/' + prop.media} />
                                                </div>
                                                <div className="mpl-dec-box">
                                                    <div className="mpl-left-box">
                                                        <div className="mpll-title"><Trans>{prop.address}</Trans></div>
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
                                                                (prop.bids && prop.bids.length>0 && !prop.buyingRoom) ?
                                                                    <a onClick={handleOffiers}>
                                                                        <Trans>View Offer {prop.bids[0].status}</Trans>
                                                                    </a>
                                                                    : null
                                                            }
                                                            {
                                                                /* (prop.bids && prop.bids[0]['bids_negotiations'].length > 0 && prop.bids[0]['bids_negotiations'][0].status != 1)  ? */
                                                                (prop.bids && prop.bids[0]['bids_negotiations'].length>0 && prop.bids[0].status!=1 && !prop.buyingRoom)  ?
                                                                    <a onClick={handleNegotiatedOffiers}>
                                                                        <Trans>View Counter Offers</Trans>
                                                                    </a>
                                                                    :
                                                                    null
                                                            }

                                                            {
                                                                prop.invitation_status != 2 &&
                                                                !prop.buyingRoom &&
                                                                !prop.bidRejected &&
                                                                !prop.bidSubmited &&
                                                                !prop.realtorAccepted ?
                                                                    <div className="md-dropdown">
                                                                        <Link to={'submit-bid/' + prop.id} role="menuitem">
                                                                            {prop.bids && prop.bids[prop.bids.length - 1]['bids_negotiations'].length > 0 ?
                                                                                <Trans>Submit Counter Offers</Trans>
                                                                                : <Trans>Submit Bid</Trans>
                                                                            }

                                                                        </Link>
                                                                    </div>
                                                                    : (prop.bids && prop.bids.length > 0)
                                                                    ? (prop.buyingRoom)
                                                                        ?
                                                                        <Link to={"/buying-room/" + prop.id}><Trans>Transaction table</Trans></Link>
                                                                        : (prop.bidRejected)
                                                                            ?
                                                                            <> <a>Rejected</a>
                                                                                {
                                                                                    (prop.totalBids < 4)
                                                                                        ?
                                                                                        <Link to={'submit-bid/' + prop.id} role="menuitem">
                                                                                            <Trans>Submit Bid</Trans>
                                                                                        </Link>
                                                                                        : null
                                                                                }
                                                                            </>
                                                                            : null
                                                                    :
                                                                    <Link to={'submit-bid/' + prop.id} role="menuitem">
                                                                        <Trans>Submit Bid</Trans>
                                                                    </Link>
                                                            }

                                                        </div>
                                                    </div>
                                                    <div className="mpl-right-box">
                                                        {
                                                            (prop.bids && prop.bids.length > 0) ?
                                                                prop.bids.map(bid => {
                                                                    return (bid.bids[0].status == 2) ?
                                                                        <div className="mplr-status-box">Status: <Trans>Counter Offer Requested: </Trans>
                                                                            ${priceSplitter((bid.bids_negotiations.length > 0) ? bid.bids_negotiations[bid.bids_negotiations.length - 1].negotiating_prices : 0)}
                                                                        </div>
                                                                        : prop.realtorAccepted ?
                                                                            <div className="mplr-status-box">
                                                                                Status : <Trans>Waiting for seller approval</Trans>
                                                                            </div> : null
                                                                }) : null
                                                        }
                                                    </div>
                                                </div>
                                                <div className="pl-button-box">
                                                    <div className="mpll-btn-row">
                                                        <Link to={'property-detail/' + prop.id}>
                                                            <Trans>View Full Detail</Trans>
                                                        </Link>
                                                        {
                                                            (prop.bids && prop.bids.length>0 && prop.bids[0].status!=1) ?
                                                                <a onClick={handleOffiers}>
                                                                    <Trans>View Offer</Trans>
                                                                </a>
                                                                : null
                                                        }
                                                        {
                                                            (prop.bids && prop.bids[0]['bids_negotiations'].length>0 && prop.bids[0].status!=1) ?
                                                                <a onClick={handleNegotiatedOffiers}>
                                                                    <Trans>View Counter Offers</Trans>
                                                                </a>
                                                                :
                                                                null
                                                        }

                                                        {
                                                            prop.invitation_status != 2 ?
                                                                <div className="md-dropdown">
                                                                    {/*<a id="menu1" data-toggle="dropdown">Take*/}
                                                                    {/*Action</a>*/}
                                                                    <Link to={'submit-bid/' + prop.id} role="menuitem"><Trans>Submit Bid</Trans>
                                                                    </Link>
                                                                    {/*<ul className="dropdown-menu"*/}
                                                                    {/*role="menu"*/}
                                                                    {/*aria-labelledby="menu1">*/}
                                                                    {/*<li role="presentation"*/}
                                                                    {/*className="py-2">*/}
                                                                    {/*<Link to={'submit-bid/' + prop.id}*/}
                                                                    {/*role="menuitem"><Trans>Submit</Trans>*/}
                                                                    {/*</Link>*/}
                                                                    {/*</li>*/}
                                                                    {/*</ul>*/}
                                                                </div>
                                                                : (prop.bids && prop.bids.length > 0)
                                                                ?
                                                                prop.bids.map(bid => {
                                                                        return (bid.bids[0].status == 1)
                                                                            ?
                                                                            <Link to={"/buying-room/" + prop.id}><Trans>Transaction table</Trans></Link>
                                                                            :
                                                                            (bid.bids[0].status == -1)
                                                                                ?
                                                                                <a><Trans>Rejected</Trans></a>
                                                                                :
                                                                                (bid.bids[0].status == 0 && prop.status == 1)
                                                                                    ?
                                                                                    <a><Trans>Stalled</Trans></a>
                                                                                    : null
                                                                    },
                                                                    // (prop.bids && prop.bids.length > 0) ?
                                                                    //     prop.bids.map(bid => {
                                                                    //         return (bid.bids[0].status == 2) ?
                                                                    //             <div
                                                                    //                 className="upper-accepted">
                                                                    //                 <div
                                                                    //                     className="buying-room-btn">
                                                                    //                     <Link
                                                                    //                         to={'submit-bid/' + prop.id}
                                                                    //                         className="btn-buying-room">
                                                                    //                         <Trans>Submit
                                                                    //                             Bid</Trans></Link>
                                                                    //                 </div>
                                                                    //                 <div
                                                                    //                     className="accepted-btn-upper">
                                                                    //                     <Link to={'#'}
                                                                    //                           className="btn-success btn-detail">
                                                                    //                         <Trans>Accepted</Trans></Link>
                                                                    //                 </div>
                                                                    //             </div> : null
                                                                    //     })
                                                                    //     : null
                                                                )
                                                                :
                                                                <Link to={'property-detail/' + prop.id} className="btn-primary btn-detail">
                                                                    <Trans>Bid Submitted</Trans></Link>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            {(this.state.viewofferstate[i] == true) && (
                                                <ul className="mpl-dtl-list">
                                                    {
                                                        (prop.bids && prop.bids.length > 0) ?
                                                            prop.bids.map(bid => {
                                                                return <li>
                                                                    <div className="mpl-dtl-list-row">
                                                                        <div className="mpl-dtl-img"></div>
                                                                        <div className="mpl-dtl-content">
                                                                            {/*<div className="mpl-dtl-title">*/}
                                                                            {/*asd asdfa sdf*/}
                                                                            {/*</div>*/}
                                                                            <div className="mpl-dtl-dec">
                                                                                <b><Trans>Offer Price</Trans>:</b>
                                                                                <span>${priceSplitter(bid['bids'][0].offer_price)}</span>
                                                                            </div>
                                                                            <div className="mpl-dtl-transaction">
                                                                                <b><Trans>Status</Trans>:</b>
                                                                                {
                                                                                    bid['bids'][0].status === 1 ?
                                                                                        <span><Trans>Accepted</Trans></span>
                                                                                        : bid['bids'][0].status === -1 ?
                                                                                        <span><Trans>Rejected</Trans></span>
                                                                                        : bid['bids'][0].status === 2 ?
                                                                                            <span><Trans>Counter Offer Requested</Trans></span>
                                                                                            : bid['bids'][0].status === 0 && bid['bids_negotiations'].length === 3 ?
                                                                                                <span><Trans>Expired</Trans></span>
                                                                                                : <span><Trans>Pending</Trans></span>
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            })
                                                            : null
                                                    }
                                                </ul>
                                            )}
                                            {(this.state.viewNegotiatedOfferState[i] == true) && (
                                                <ul className="mpl-dtl-list">
                                                    {
                                                        (prop.bids && prop.bids[0]['bids_negotiations'].length > 0) ?
                                                            prop.bids[0]['bids_negotiations'].map((bid,bi) => {
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
                                                                                        : null
                                                                                }
                                                                            </div>

                                                                        </div>
                                                                        {/* {
                                                                            bid.status === 1 ?
                                                                                null
                                                                                : bid.status === 0 ?
                                                                                <div className="mpl-dtl-dropdown">
                                                                                    <a className="mpl-dtl-buton" id="buyer_accept_counter_offer" onClick={() => this.setBidStatus(1, bid.bid_id, i, bi, bid.prop_id, [
                                                                                        prop.bids[0].user_id,
                                                                                        prop.bids[0].buyer_realtor_id,
                                                                                        prop.bids[0].lender_id,
                                                                                        prop.bids[0].seller_id,
                                                                                        prop.bids[0].seller_realtor_id
                                                                                    ])}>Accept</a>
                                                                                </div>
                                                                                : null
                                                                        } */}
                                                                        {
                                                                            bid.status === 1 ?
                                                                                null
                                                                                : bid.status === 0 && this.state.showAcceptBidButton ?
                                                                                <div className="mpl-dtl-dropdown">
                                                                                    { !this.state.bidSubmitting ?
                                                                                        <a className="mpl-dtl-buton" id="buyer_accept_counter_offer" onClick={() => this.submitBid({
                                                                                            prop_id: bid.prop_id, 
                                                                                            buyer_id: prop.bids[0].user_id, 
                                                                                            buying_realtor_id : prop.bids[0].realtor_id,
                                                                                            lender_id: prop.bids[0].lender_id,
                                                                                            previous_offer: bid.bid_price,
                                                                                            offer_price: bid.negotiating_prices
                                                                                            })}>Accept Counter Offer</a>
                                                                                        : <a className="mpl-dtl-buton" id="buyer_accept_counter_offer">Please wait ...</a> }
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
                                    : null
                                })}
                        </ul>
                    </div>

                </div>
                <div className="container disnone">
                    <div className="modal fade" id="myModal" role="dialog">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5><Trans>Invite Buyers</Trans></h5>
                                    <button type="button" className="close" data-dismiss="modal">&times;</button>
                                </div>
                                <div className="modal-body">
                                    <div className="invite-buyer-upper">
                                        <div className="tag_list_wrapper">
                                            <div className="popup-btns">
                                                <TagsInput
                                                    value={this.state['tags']}
                                                    addKeys={[9, 13, 32, 186, 188]}
                                                    onlyUnique
                                                    addOnPaste
                                                    addOnBlur
                                                    validationRegex={EMAIL_VALIDATION_REGEX}
                                                    pasteSplit={data => {
                                                        return data.replace(/[\r\n,;]/g, ' ').split(' ').map(d => d.trim())
                                                    }}
                                                    onChange={(event) => this.handleChange(event)}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <input type="submit" name="submit"
                                           onClick={(event) => this.handleFormSubmit(event)}
                                           className="btn btn-invite-buyers">
                                    </input>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="profile-inner">
                        <div className="container">

                            <div className="properties-upper">
                                <div className="row property-row">
                                    {
                                        (this.state['loading'] === 'true')
                                            ?
                                            <div className="col-md-12">
                                                <Skeleton count={6} circle={true} height={40}/>
                                            </div>
                                            :
                                            <div className="col-md-12">
                                                {
                                                    this.state['props'].map((prop, i) => {
                                                        let handleClick = () => {
                                                            this.setPropId(prop.id);
                                                        };

                                                        return <div className="row propertyinner-row" key={i}>

                                                            <div className="col-lg-4 col-md-12 col-sm-12">
                                                                <img className="img-fluid" alt={prop.title}
                                                                     src={UrlService.imagesPath() + '/' + prop.media}
                                                                />
                                                            </div>
                                                            <div className="col-lg-6 col-md-12 col-sm-12">
                                                                <div className="property-desc">
                                                                    <h3> {prop.title} <span><i
                                                                        className="fa fa-arrows"></i></span>
                                                                    </h3>
                                                                    <h4>
                                                                        <Trans>List price:</Trans>
                                                                        <span>$ {priceSplitter(prop.price)}</span>
                                                                        {
                                                                            (prop.bids && prop.bids.length > 0) ?
                                                                                prop.bids.map(bid => {
                                                                                    return (bid.bids[0].status == 2) ?
                                                                                        <div
                                                                                            className="rejected-btn">
                                                                                            <a><Trans>Counter Offer
                                                                                                Requested: </Trans>${priceSplitter((bid.bids_negotiations.length > 0) ? bid.bids_negotiations[bid.bids_negotiations.length - 1].negotiating_prices : 0)}
                                                                                            </a>
                                                                                        </div> : null
                                                                                }) : null
                                                                        }
                                                                    </h4>
                                                                    {/*<p>Lorem Ipsum is simply dummy text of the*/}
                                                                    {/*printing*/}
                                                                    {/*and*/}
                                                                    {/*typesetting industry. Lorem Ipsum has*/}
                                                                    {/*been the*/}
                                                                    {/*industry's standard dummy text ever*/}
                                                                    {/*since the*/}
                                                                    {/*1500s,*/}
                                                                    {/*when an unknown printer took a galley of*/}
                                                                    {/*type*/}
                                                                    {/*and*/}
                                                                    {/*scrambled it to make a type specimen*/}
                                                                    {/*book. It*/}
                                                                    {/*has*/}
                                                                    {/*survived not only five centuries.</p>*/}
                                                                    {/*<Link to={'property-detail/' + prop.id}
                                                                                  className="btn-primary btn-detail">
                                                                                View Full Detail</Link>*/}
                                                                </div>
                                                            </div>

                                                            {prop.invitation_status != 2 ?
                                                                <div className="outer-dropdown">
                                                                    <div className="dropdown md-dropdown">
                                                                        <button
                                                                            className="btn btn-primary dropdown-toggle"
                                                                            id="menu1" type="button"
                                                                            data-toggle="dropdown"><Trans>Take
                                                                            Action</Trans>
                                                                            <span className="caret"></span>
                                                                        </button>
                                                                        <ul className="dropdown-menu"
                                                                            role="menu"
                                                                            aria-labelledby="menu1">
                                                                            <li role="presentation">
                                                                                <Link
                                                                                    to={'submit-bid/' + prop.id}
                                                                                    className="btn-primary btn-detail">
                                                                                    <Trans>Submit
                                                                                        Bid</Trans></Link>
                                                                                {/*<a role="menuitem"*/}
                                                                                {/*className="invittedUser"*/}
                                                                                {/*onClick={handleClick}*/}

                                                                                {/*data-toggle="modal"*/}
                                                                                {/*data-target="#myModal">*/}
                                                                                {/*Submit Bid*/}
                                                                                {/*<span*/}
                                                                                {/*style={{color: "#30CC98"}}>*/}
                                                                                {/*<i className="fa fa-check-circle"></i>*/}
                                                                                {/*</span>*/}

                                                                                {/*</a>*/}
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                                :
                                                                (prop.bids && prop.bids.length > 0)
                                                                    ?
                                                                    prop.bids.map(bid => {
                                                                            return (bid.bids[0].status == 1)
                                                                                ?
                                                                                <div className="upper-accepted">
                                                                                    <div
                                                                                        className="buying-room-btn">
                                                                                        <Link
                                                                                            to={'/buying-room/' + prop.id}
                                                                                            className="btn-buying-room">
                                                                                            <Trans>Transaction table</Trans></Link>
                                                                                    </div>
                                                                                    <div
                                                                                        className="accepted-btn-upper">
                                                                                        <Link to={'#'}
                                                                                              className="btn-success btn-detail">
                                                                                            <Trans>Accepted</Trans></Link>
                                                                                    </div>
                                                                                </div>
                                                                                :
                                                                                (bid.bids[0].status == -1)
                                                                                    ?
                                                                                    <div className="upper-accepted">
                                                                                        <div
                                                                                            className="accepted-btn-upper">
                                                                                            <Link to={'#'}
                                                                                                  className="btn-danger btn-detail">
                                                                                                <Trans>Rejected</Trans></Link>
                                                                                        </div>
                                                                                    </div>
                                                                                    :
                                                                                    (bid.bids[0].status == 0 && prop.status == 1)
                                                                                        ?
                                                                                        <div
                                                                                            className="upper-accepted">
                                                                                            <div
                                                                                                className="buying-room-btn">
                                                                                                <Link to={'#'}
                                                                                                      className="btn-buying-room-rejected">
                                                                                                    <Trans>Stalled</Trans></Link>
                                                                                            </div>
                                                                                        </div>
                                                                                        :
                                                                                        null
                                                                        },
                                                                        (prop.bids && prop.bids.length > 0) ?
                                                                            prop.bids.map(bid => {
                                                                                return (bid.bids[0].status == 2) ?
                                                                                    <div
                                                                                        className="upper-accepted">
                                                                                        <div
                                                                                            className="buying-room-btn">
                                                                                            <Link
                                                                                                to={'submit-bid/' + prop.id}
                                                                                                className="btn-buying-room">
                                                                                                <Trans>Submit Bid</Trans></Link>
                                                                                        </div>
                                                                                        <div
                                                                                            className="accepted-btn-upper">
                                                                                            <Link to={'#'}
                                                                                                  className="btn-success btn-detail">
                                                                                                <Trans>Accepted</Trans></Link>
                                                                                        </div>
                                                                                    </div> : null
                                                                            })
                                                                            : null
                                                                    )
                                                                    :
                                                                    <Link to={'property-detail/' + prop.id}
                                                                          className="btn-primary btn-detail">
                                                                        <Trans>Bid Submitted</Trans></Link>
                                                            }
                                                            <div className="col-md-2 md-dropdown">

                                                            </div>

                                                        </div>
                                                    })
                                                }
                                                {
                                                    this.state['props'].length === 0 ?
                                                        <h2>
                                                            <Trans>No invitation have been reserved yet</Trans>
                                                        </h2> : null
                                                }

                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}


export default PropertyInvitations;