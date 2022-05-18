import React from 'react';
import Topnav from "components/common/topnav";
import { Trans } from "react-i18next";
import { UrlService, UserService } from "services/imports/index";
import { Link, RouteComponentProps } from "react-router-dom";

class PublicProperties extends React.Component<RouteComponentProps, any>{
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            viewofferstate: [],
            viewNegotiatedOfferState: [],
            props: [],
            filter: '',
            dropdowns: { states: [], counties: [] }
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

            if (v['role_id'] == 4) {
                v['user_property']['maxBid'] = 0;
                v['user_property']['realtor_id'] = false;
                v['user_property']['lender_id'] = false;
                v['user_property']['seller_id'] = v['user_id'];
                v['user_property']['realtor_additional_role'] = 4;
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

    makePropertyData(response) {
        const resp = [];
        const promises = [];
        response.forEach((v, k) => {
            this.state['viewofferstate'].push(false);
            this.state['viewNegotiatedOfferState'].push(false);
            promises.push(this.makeData(v, k))
        });
        Promise.all(promises).then(res => {
            resp.push(res);
            this.setState({ props: resp[0], loading: false });
        })
    }

    async componentDidMount() {
        this.getPublicProperties();
        var dropdowns = await UserService.getLeaderBoardDropdowns();
        this.setState({ dropdowns: dropdowns })

    }

    async getPublicProperties() {
        this.setState({ loading: true })

        var params = '?filter='+this.state.filter;
        const response = await UserService.getPublicProperties(params);
        var properties = [];
        var properties_ids = [];
        for (let i = 0; i < response.length; i++) {
            if (!properties_ids.includes(response[i].prop_id.toString())) {
                properties_ids.push(response[i].prop_id.toString())
                properties.push(response[i])
            }
        }
        this.makePropertyData(properties);
    }


    render() {
        const priceSplitter = (number) => (number && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        return (
            <React.Fragment>
                <Topnav />
                <div className="my-properties-page">
                    <div className="page-title">
                        {this.state.loading ?
                            <Trans>Please wait! Loading...</Trans> :
                            <Trans>Listings for sale</Trans>
                        }
                    </div>

                    <div className="my-properties-list-box">
                        <div className="container-fluid pl-0">
                            <img src="/images/propety-banner.svg" className="img-fluid w-100" />
                            <div className="row justify-content-md-center bg-dark ml-0 mx-0" style={{ paddingTop: '5rem' }}>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label className="font-weight-normal pl-3">Search using City, State or zip</label>
                                        <input type="text" className="form-control property-search-box mr-3" placeholder="search" onChange={(e)=>this.setState({ filter: e.target.value })}/>
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-md-center bg-dark ml-0 mx-0" style={{ paddingBottom: '5rem' }}>
                                <div className="col-sm-6">
                                  <button className="property-search-btn" onClick={() => this.getPublicProperties()}>Search</button>
                                </div>
                            </div>
                        </div>

                        {!this.state.loading ?
                            <div className="container-fluid">
                            <div className="row d-dir-row">
                                {this.state.props.length>0 ? 
                                    this.state.props.map((prop, i) => {
                                        return <div className="col-lg-3 col-md-4 col-sm-6 col-12 px-lg-5" key={i}>
                                            <div className="mpl-data-box property-box pb-0">
                                                <div className="mpl-icon-box grey-border-box">
                                                    <img alt={prop.title}
                                                        src={UrlService.imagesPath() + '/' + prop.media}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mpl-data-box pt-0">
                                                <div className="row mx-0 w-100">
                                                    <div className="col-12 px-0 ml-0">
                                                        <div className="mpll-title" style={{ fontSize: '16px' }}>
                                                            {/*{prop.title}*/}
                                                            <Trans>{prop.state} | {prop.city} | {prop.zipcode}</Trans>
                                                        </div>
                                                        <div className="mpll-title">
                                                            {/*{prop.title}*/}
                                                            <Trans>{prop.address}</Trans>
                                                        </div>
                                                        {/*<div className="mpll-dec"><Trans>{prop.address}</Trans></div>*/}
                                                        {/* <div className="mpll-price mt-0">
                                                            <b><Trans>List Price</Trans>:</b>
                                                            <span>${priceSplitter(prop.price)}</span>
                                                        </div> */}
                                                        <div className="mt-2">
                                                            <Link to={'property-details/' + prop.id} className="btn theme-btn btn-block font-weight-bold">
                                                                <Trans>View Details</Trans>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    
                                    })
                                : <div className="col-md-12 my-5">
                                    <h3 className="text-center">No properties have been found</h3>
                                </div>}
                            </div>
                            </div>
                        : null }
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default PublicProperties;