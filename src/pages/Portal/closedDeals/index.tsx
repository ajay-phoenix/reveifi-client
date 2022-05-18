import React, { Component } from "react";
import { Link } from "react-router-dom";

import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import footer from "../../../components/common/footer";
import "./_style.scss";
import { Trans } from "react-i18next";
import UrlService from "../../../services/UrlService";
import { UserService, CookieService } from "services/imports/index";

const role_id = CookieService.get('role_id');

class ClosedDeals extends Component<{}, any> {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            all_properties: [],
            viewofferstate: [],
            viewNegotiatedOfferState: [],
            propId: 0,
            businessProfile:true,
            user_role: 0
        }

        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }
    
    makeData(v, index) {
        return new Promise((resolve, reject) => {
            let maxBid = {};
            if (v['user_property'][0]['property_bids_association'].length > 0) {
                maxBid = v['user_property'][0]['property_bids_association'].reduce(function (prev, current) {
                    return (prev['bids'][0].offer_price > current['bids'][0].offer_price) ? prev : current
                })
            }
            v['user_property'][0]['maxBid'] = maxBid;
            if (v['user_property'][0].status == 1) {
                v['user_property'][0]['realtor_id'] = v['realtor_id'] ? true : false;
                v['user_property'][0]['lender_id'] = v['lender_id'] ? true : false;
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
                resolve(v['user_property'][0])
            }
        })
    }
    
    makeBuyerData(v, index) {
        return new Promise((resolve, reject) => {
            let maxBid = {};
            const promises = [];
                UserService.getBuyingroomStatus(v.id)
                    .then(res => {
                        if (res.success && res.data != null && res.data.module != null) {
                            /* v.progress_status = res.data.module;
                            resolve(v) */
                        } else {
                            console.log(v)
                            resolve(v)
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
        })
    }

    makePropertyData(response) {
        const resp = [];
        const promises = [];
        response.forEach((v, k) => {
            this.state['viewofferstate'].push(false);
            promises.push(this.makeData(v, k))
            // resp.push(v['user_property'][0]);
        });
        Promise.all(promises).then(res => {
            resp.push(res);
            this.setState({all_properties: resp[0], loading: 'false'});
        })
    }

    makeBuyerPropertyData(response){
        const resp = [];
        const promises = [];
        response.forEach((v, k) => {
            this.state['viewofferstate'].push(false);
            UserService.getBuyingroomStatus(v.id).then(res => {
                if (res.success && res.data != null && res.data.module != null) {
                    /* v.progress_status = res.data.module;
                    resolve(v) */
                } else {
                    resp.push(v)
                    this.setState({ all_properties: resp})
                }
            })
            .catch(err => {
                console.log(err);
            });
        });
    }

    async componentDidMount() {
        const invited_properties = await UserService.getInvitedProperties();
        invited_properties.forEach((v, k) => {
            this.state['viewofferstate'].push(false);
            this.state['viewNegotiatedOfferState'].push(false);
        });

        const closed_deals = new Array();

         if(role_id==1 && localStorage.getItem('type')==='Buyer'){
            this.makeBuyerPropertyData(invited_properties);
         } else{
            const response = await UserService.getCurrentUserProperties();
            this.makePropertyData(response);
            const user_profile = await UserService.getCurrentUserProfile();
            this.setState({ user_role: user_profile.userProfile.role_id, businessProfile: user_profile['businessProfile'] });
        }
        
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

    render() {
        const priceSplitter = (number) => (number && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        var closed_deals = new Array();

        if(role_id!=1){
            for(let i=0; i<this.state.all_properties.length; i++){
                if(this.state.all_properties[i].progress_status=='Completed !'){
                    closed_deals.push(this.state.all_properties[i])
                }
            }
        } else{
            closed_deals = this.state.all_properties;
        }
        
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler} ></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <div className="my-properties-page">
                    <div className="page-title">
                        <Trans>Closed Deals</Trans>
                    </div>
                    <div className="my-properties-list-box">
                        <div className="ndp-right-box">
                            {!this.state['businessProfile'] && this.state.user_role!==1 ?
                                <div className="alert alert-warning alert_box" role="alert">  <Link to="/edit-profile"><Trans>Please complete your business profile</Trans></Link></div> : null
                            }
                        </div>
                        <ul className="my-properties-list">
                            {
                                closed_deals.map((prop, i) => {
                                    let handleOffers = () => {
                                        this.showviewoffer(i)
                                    };
                                    let handleNegotiatedOffiers = () => {
                                        this.showviewNegotiatedOffer(i)
                                    };
                                    return <li key={i}>
                                        <div className="mpl-data-box">
                                            <div className="mpl-icon-box">
                                                <img alt={prop.title} src={UrlService.imagesPath() + '/' + prop.media} />
                                            </div>
                                            <div className="mpl-dec-box">
                                                <div className="mpl-left-box">
                                                    <div className="mpll-title"><Trans>
                                                        {prop.address} 
                                                        {role_id == 2 ? !prop.lender_id ? ' Selling Realtor' : ' Buying Realtor' : null}
                                                    </Trans></div>
                                                    {/*<div className="mpll-dec"><Trans>{prop.address}</Trans></div>*/}
                                                    
                                                    <div className="mpll-price">
                                                        <b><Trans>List Price</Trans>:</b>
                                                        <span>${priceSplitter(prop.price)}</span>
                                                    </div>
                                                    <div className="mpll-btn-row">
                                                        <Link to={'property-detail/' + prop.id}>
                                                            <Trans>View Full Detail</Trans>
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="mpl-right-box">
                                                    {(prop.bids && prop.bids.length > 0) ?
                                                        prop.bids.map(bid => {
                                                            return (bid.bids[0].status == 2) ?
                                                                <div className="mplr-status-box"><Trans>Status</Trans>: <Trans>Counter Offer Requested: </Trans>
                                                                    ${priceSplitter((bid.bids_negotiations.length > 0) ? bid.bids_negotiations[bid.bids_negotiations.length - 1].negotiating_prices : 0)}
                                                                </div>
                                                            : null
                                                        }) : null
                                                    }
                                                </div>
                                            </div>
                                            <div className="pl-button-box">
                                                <div className="mpll-btn-row">
                                                    <Link to={'property-detail/' + prop.id}>
                                                        <Trans>View Full Detail</Trans>
                                                    </Link>
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
                                                        prop.bids[0]['bids_negotiations'].map(bid => {
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
                                                                            <b><Trans>Negotiating
                                                                                prices</Trans>:</b>
                                                                            <span>${priceSplitter(bid.negotiating_prices)}</span>
                                                                        </div>
                                                                        <div className="mpl-dtl-transaction">
                                                                            <b><Trans>Status</Trans>:</b>
                                                                            {
                                                                                bid.status === 1 ?
                                                                                    <span><Trans>Rejected</Trans></span>
                                                                                    : bid.status === 0 ?
                                                                                    <span><Trans>No action</Trans></span>
                                                                                    : null
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
                                    </li>
                                })}
                        </ul>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}


export default ClosedDeals;