import React, { Component } from "react";
import { Link } from "react-router-dom";
import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import UserService from "../../../services/UserService";
import UrlService from "../../../services/UrlService";
import { ToastContainer, toast } from 'react-toastify';
import { Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import {Redirect} from "react-router-dom";
import { Trans } from "react-i18next";
import Modal from "react-bootstrap/Modal";
import PropertyInvitations from "../propertyInvitations";
import {
    FormBuilder,
    Validators,
    FieldGroup,
    FieldControl
} from "react-reactive-form";

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

class Offers extends Component<{}, any> {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: true,
            loader: false,
            key: 'offer',
            negotiationData: {},
            viewofferstate: true,
            viewpropertystate: false
        };

        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }

    async componentDidMount() {

        const response = await UserService.getOffers();

        this.setState({ data: response, loading: false });
    }

    async setBidStatus(status, id, i, ib, propId, chatroomDetail = []) {
        this.setState({ loading: true });
        const data = {
            "status": status,
            "id": id,
            "prop_id": propId
        };

        const response = await UserService.upDateBid(data);
        if (typeof response.id !== 'undefined') {
            this.state['data'][i]['property_bids'][ib].status = status;
            this.setState({ data: this.state['data'] });
            let users_arr = chatroomDetail.filter(i => i > 0);
            const users_id = users_arr.join(',');
            const chatroomData = {
                'property_id': propId
            }
            if (status == 1) {
                const buyingRoomRes = await UserService.createBuyingRoom(propId);
                if (typeof buyingRoomRes.id !== 'undefined') {
                    const res = await UserService.createChatroom(chatroomData);
                    if (typeof res.id !== 'undefined') {
                        this.setState({ loading: false });
                        toast.success("You have successfully accepted the bid. You will be redirected to Transaction table", {
                            closeOnClick: true,
                            pauseOnHover: true,
                        });

                        window.location.href = `/buying-room/${propId}`;
                    } else {
                        this.setState({ loading: false });
                        toast.error("Something went wrong !");
                    }
                } else {
                    this.setState({ loading: false });
                    toast.error("Something went wrong !");
                }
            } else {

                this.setState({ loading: false });
                toast.success("Negotition request sent to buyer", {
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            }


        } else {
            this.setState({ loading: false });
            toast.error("Something went wrong !");
        }
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
        this.hideModal();
        this.setState({ loading: true });

        const data = this.state['negotiationData'];
        data['negotiating_prices'] = Math.abs(this.negoForm.get('offer_price').value);

        const res = await UserService.negotiateBid(data);
        if (res.id) {
            const response = await UserService.getOffers();
            this.setState({ data: response, loading: false });

            this.setState({ loading: false });
            toast.success("Bid Negotiating sent..!", {
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else {
            this.setState({ loading: false });
            if(res && res.message){
                toast.error(res.message);
            }else{
                toast.error("Something went wrong!");
            }
        }
    }

    getContent(key) {
        console.log(key);
        this.setState({ key })
    }

    showviewoffer = () => {
        this.setState({ viewpropertystate: false })
        this.setState({ viewofferstate: true })
    }
    viewproperty = () => {
        this.setState({ viewpropertystate: true })
        this.setState({ viewofferstate: false })
    }
    render() {
        const priceSplitter = (number) => (number && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <section className="offer-page">
                    <div className="offer-box">
                        <div className="ob-tab-title-list-box">
                            <ul className="ob-tab-title-list">
                                {/*<li onClick={this.showviewoffer} className={this.state.viewofferstate ? 'active' : null}>*/}
                                {/*<span>View Offers</span>*/}
                                {/*</li>*/}
                                <li onClick={this.viewproperty} className='active'>
                                    <span><Trans>Property Invitations</Trans></span>
                                </li>
                            </ul>
                        </div>
                        <div className="ob-tab-data-list-box">
                            {(this.state.viewofferstate == true) && (
                                <ul className="ob-tab-data-list">
                                    <li>
                                        <ul className="my-properties-list">
                                            <li>
                                                <div className="mpl-data-box">
                                                    <div className="mpl-icon-box">
                                                        <img src="../images/slider-1.png" />
                                                    </div>
                                                    <div className="mpl-dec-box">
                                                        <div className="mpl-left-box">
                                                            <div className="mpll-title"><Trans>Property Nickname</Trans></div>
                                                            <div className="mpll-dec">1234 State St. Seattle WA 980048</div>
                                                            <div className="mpll-price">
                                                                <b><Trans>List Price</Trans>:</b>
                                                                <span>$ 123,123,123</span>
                                                            </div>
                                                            <div className="mpll-btn-row">
                                                                <a><Trans>View Full Details</Trans></a>
                                                            </div>
                                                        </div>
                                                        <div className="mpl-right-box">
                                                            <div className="mplr-offermade-box"><Trans>Offer Made By: John Smith</Trans></div>
                                                            <div className="mplr-offerprice-box">
                                                                <b><Trans>Offer Price</Trans></b>
                                                                <span>$123,123,123</span>
                                                            </div>
                                                            <div className="mplr-date-box">12/31/2021 12:00PM</div>
                                                            <div className="mplr-status-box"><Trans>Status: Negotiation Requested</Trans></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            )}
                            {(this.state.viewpropertystate == true) && (
                                <ul className="view-properties-invitations-list">
                                    <li>
                                        <div className="vpil-data-list">
                                            <div className="vpil-image-box">
                                                <img src="../images/slider-1.png" />
                                            </div>
                                            <div className="vpil-dec-box">
                                                <div className="vpil-invite-btn-box">
                                                    <div className="vpil-invite-box">
                                                        <b><Trans>Invitation From</Trans>:</b>
                                                        <span>Jane Doe</span>
                                                    </div>
                                                    <button className="vpil-buying-btn">
                                                    <Trans>View Transaction table</Trans>
                                                            </button>
                                                </div>
                                                <div className="vpil-trans-box">
                                                <Trans>Transaction ID</Trans>: 1234536ergdfj23452345
                                                            </div>
                                                <div className="vpil-time-box">12/12/2020 12:00AM</div>
                                                <div className="vpil-property-dtl">
                                                    <span><Trans>Property Nickname</Trans></span>
                                                    <span>1234 State St. Seattle WA 980045</span>
                                                </div>
                                                <div className="vpil-price-status-row">
                                                    <div className="vpil-listprice-box">
                                                        <b><Trans>List Price</Trans></b><span>$123,123,123</span>
                                                    </div>
                                                    <div className="status-box"><Trans>Status: Negotiation Requested</Trans></div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>
                </section>
                <div className="content-wrapper disnone">
                    <Modal show={this.state['isOpen']} onHide={() => this.hideModal()}>
                        <div>
                            <div className="modal-content">
                                <FieldGroup
                                    control={this.negoForm}
                                    render={({ invalid, pristine, pending, meta }) => (
                                        <form noValidate onSubmit={(event) => this.handleNegotiationSubmit(event)}>
                                            <div className="modal-header">
                                                <button type="button" className="close float-right"
                                                    onClick={() => this.hideModal()}
                                                    data-dismiss="modal">&times;</button>
                                            </div>
                                            <div className="modal-body">
                                                {
                                                    !this.state['invitationSent']
                                                        ?

                                                        <div className="invite-buyer-upper">
                                                            <h5 style={{ marginTop: '-40px', marginBottom: '40px' }}>
                                                                <Trans>Submit Negotation Price</Trans>
                                                            </h5>
                                                            <div className="tag_list_wrapper">
                                                                <div className="popup-btns">
                                                                    <FieldControl
                                                                        name="offer_price"
                                                                        render={NumberInput}
                                                                        meta={{ label: "Negotation Price" }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        :
                                                        <h2 className="text-center pt-0 pb-4"><Trans>Invitation Sent!!</Trans></h2>
                                                }
                                            </div>
                                            {
                                                !this.state['invitationSent']
                                                    ?
                                                    <div className="modal-footer">
                                                        {
                                                            !this.state['invitationLoader']
                                                                ?
                                                                <input type="submit" name="submit"
                                                                    disabled={invalid}
                                                                    className="btn btn-invite-buyers">
                                                                </input>
                                                                :
                                                                <button type="submit" name="submit"
                                                                    disabled
                                                                    className="btn btn-invite-buyers">
                                                                    <span
                                                                        className="spinner-grow spinner-grow-sm"
                                                                        role="status"
                                                                        aria-hidden="true">
                                                                    </span>
                                                                    <span className="sr-only">
                                                                        <Trans>Loading...</Trans>
                                                                    </span>
                                                                </button>
                                                        }
                                                    </div>
                                                    : null}

                                        </form>
                                    )}
                                />
                            </div>
                        </div>
                    </Modal>
                    <div className="row">
                        <div className="container">
                            <div className="profile-inner">
                                <div className="tab-wrapper">
                                    <div className='container-fluid'>
                                        <div className="row">
                                            <div className="col-sm-12">
                                                <Tabs defaultActiveKey="offer"
                                                    id="controlled-tab-example"
                                                    activeKey={this.state.key}
                                                    onSelect={key => this.getContent(key)}>
                                                    <Tab eventKey="offer" title="Offers">
                                                        <div className="container offers-table">
                                                            <div className="row">
                                                                <div className="col-sm-12">
                                                                    {
                                                                        this.state['data'].map((prop, i) => {
                                                                            return <React.Fragment>
                                                                                <div className="row" key={i}>
                                                                                    <div className="col-sm-12">
                                                                                        <div
                                                                                            className="property-header">
                                                                                            <div
                                                                                                className="property-img">
                                                                                                <img
                                                                                                    src={UrlService.imagesPath() + '/' + prop.media}
                                                                                                    className="img-fluid" />
                                                                                            </div>
                                                                                            <div
                                                                                                className="property-name">
                                                                                                <p>{prop.title}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                {
                                                                                    prop.property_bids.map((propBid, bi) => {
                                                                                        // let handleClick = () => {
                                                                                        //     this.setBidStatus(propBid.id, i, bi);
                                                                                        // };
                                                                                        return <div
                                                                                            className="col-sm-12 property-body"
                                                                                            key={bi}>
                                                                                            <div className="row">
                                                                                                <div
                                                                                                    className="col-sm-4">
                                                                                                    <div className="property-img">
                                                                                                        <img src="http://reverifi.trisec.io/images/buyer-name.png"
                                                                                                            className="img-fluid"></img>
                                                                                                    </div>
                                                                                                    <div
                                                                                                        className="property-name">
                                                                                                        <p>{propBid.user.name}</p>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="col-sm-4">
                                                                                                    <div
                                                                                                        className="property-name">
                                                                                                        <p><Trans>Offer Price:</Trans>
                                                                                                            ${priceSplitter(propBid.offer_price)}
                                                                                                        </p>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    className="col-sm-4">
                                                                                                    {
                                                                                                        propBid.status === 0 ?

                                                                                                            <div className="dropdown md-dropdown float-right">
                                                                                                                {
                                                                                                                    (this.state.loading)
                                                                                                                        ?
                                                                                                                        <><span
                                                                                                                            className="spinner-grow spinner-grow-sm"
                                                                                                                            role="status"
                                                                                                                            aria-hidden="true">
                                                                                                                        </span>
                                                                                                                            <span
                                                                                                                                className="sr-only">
                                                                                                                                <Trans>Loading...</Trans>
                                                                                                                            </span></>
                                                                                                                        :
                                                                                                                        <button
                                                                                                                            className="btn btn-primary dropdown-toggle"
                                                                                                                            id="menu1"
                                                                                                                            type="button"
                                                                                                                            data-toggle="dropdown">
                                                                                                                            <Trans>Take Action</Trans>
                                                                                                                            <span
                                                                                                                                className="caret"></span>
                                                                                                                        </button>
                                                                                                                }
                                                                                                                <ul className="dropdown-menu"
                                                                                                                    role="menu"
                                                                                                                    aria-labelledby="menu1">
                                                                                                                    <li role="presentation">
                                                                                                                        <a role="menuitem"
                                                                                                                            className="invittedUser"
                                                                                                                            onClick={
                                                                                                                                () => this.setBidStatus(-1, propBid.id, i, bi, propBid.prop_id)
                                                                                                                            }
                                                                                                                        >
                                                                                                                            <Trans>Reject</Trans>
                                                                                                                        </a>
                                                                                                                    </li>
                                                                                                                    <li role="presentation">
                                                                                                                        <a role="menuitem"
                                                                                                                            className="invittedUser"
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
                                                                                                                    {propBid.negotiation_count < 3 ?
                                                                                                                        <li role="presentation">

                                                                                                                            <a role="menuitem"
                                                                                                                                className="invittedUser"
                                                                                                                                onClick={() => this.showModal(propBid.offer_price, propBid.id, propBid.prop_id, propBid.buyer_id)}
                                                                                                                            >
                                                                                                                                <Trans>Negotiate</Trans>
                                                                                                                            </a>
                                                                                                                        </li>

                                                                                                                        : null
                                                                                                                    }
                                                                                                                    <li role="presentation">
                                                                                                                        <Link
                                                                                                                            to={"/property-status/" + propBid.id}
                                                                                                                            role="menuitem"
                                                                                                                            className="invittedUser"
                                                                                                                        >
                                                                                                                            <Trans>View Full Detail</Trans>
                                                                                                                        </Link>
                                                                                                                    </li>
                                                                                                                </ul>
                                                                                                            </div>
                                                                                                            : propBid.status === 1 ?
                                                                                                                <>
                                                                                                                    {/* <div className="accepted-btn" id="rejected-data"> <a>Accepted</a></div> */}
                                                                                                                    <div
                                                                                                                        className="accepted-btn"
                                                                                                                        id="rejected-data">
                                                                                                                        <div
                                                                                                                            className="accepted-upper">
                                                                                                                            <Link
                                                                                                                                to={"/buying-room/" + propBid.prop_id}
                                                                                                                                role="menuitem"
                                                                                                                                className="buying-room">
                                                                                                                                <Trans>Transaction table</Trans>
                                                                                                                            </Link>
                                                                                                                        </div>
                                                                                                                        <div
                                                                                                                            className="accepted-below">
                                                                                                                            <Link
                                                                                                                                to={"#"}
                                                                                                                                role="menuitem"
                                                                                                                                className="invittedUser">
                                                                                                                                <Trans>Accepted</Trans>
                                                                                                                            </Link>
                                                                                                                        </div>

                                                                                                                    </div>
                                                                                                                </>
                                                                                                                : propBid.status === -1 ?
                                                                                                                    <div
                                                                                                                        className="rejected-btn"
                                                                                                                        id="rejected-data">
                                                                                                                        <a><Trans>Rejected</Trans></a>

                                                                                                                    </div> :
                                                                                                                    propBid.status === 2 ?
                                                                                                                        <div
                                                                                                                            className="rejected-btn"
                                                                                                                            id="rejected-data">
                                                                                                                            <a><Trans>Negotiation Requested</Trans></a>
                                                                                                                        </div>
                                                                                                                        :
                                                                                                                        null
                                                                                                    }
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    })
                                                                                }
                                                                                <div className="row" key={i + 1}>
                                                                                    <div className="col-sm-12">
                                                                                        <div
                                                                                            className="property-header outer-tr">
                                                                                            <p className="width-100-per">
                                                                                                {prop.address + ', ' + prop.state + ', ' + prop.city + ', ' + prop.country}
                                                                                                <span
                                                                                                    className="float-right margin-bottom-10px">
                                                                                                    <div
                                                                                                        className="upper-buying"></div>


                                                                                                    <Link
                                                                                                        to={"/property-detail/" + prop.id}
                                                                                                        role="menuitem"
                                                                                                        className="invittedUser">
                                                                                                        <Trans>View Full Details</Trans>
                                                                                                    </Link>
                                                                                                </span>
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </React.Fragment>
                                                                        })
                                                                    }
                                                                    {
                                                                        this.state['data'].length === 0 ?
                                                                            <h2>
                                                                                <Trans>No offer has been made yet</Trans>
                                                                            </h2> : null
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Tab>
                                                    <Tab eventKey="invitatons" title="Properties Invitaions">
                                                        <div className="tab-item-wrapper">
                                                            <PropertyInvitations
                                                                handler={this.handler}></PropertyInvitations>
                                                        </div>
                                                    </Tab>
                                                </Tabs>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )

    }

}


export default Offers;