import React from 'react';
import Topnav from "components/common/topnav";
import { Trans } from "react-i18next";
import { UrlService, UserService } from "services/imports/index";
import { Link, RouteComponentProps } from "react-router-dom";
import $ from "jquery";

class PublicProperties extends React.Component<RouteComponentProps, any>{
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            viewofferstate: [],
            viewNegotiatedOfferState: [],
            props: [],
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
        var state = $('select[name=state]').val()
        var county = $('select[name=county]').val()

        state = state ? state : '';
        county = county ? county : '';

        var params = '?state=' + state + '&county=' + county;
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

    handleChange(e) {
        this.getPublicProperties()
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
                            <Trans>Public Properties</Trans>
                        }
                    </div>

                    <div className="my-properties-list-box">
                        <div className="mpl-data-box">
                            <div className="row w-100 mb-2 ml-0">
                                <div className="col-sm-3 pl-0">
                                    <label>State</label>
                                    {/* <input type="text" name="state" className="form-control" onChange={(e)=>this.handleChange(e)}/> */}
                                    <select name="state" className="form-control" onChange={(e) => this.handleChange(e)}>
                                        <option value="">Select State</option>
                                        {this.state.dropdowns.states.map(dropdown => {
                                            return <option value={dropdown}>{dropdown}</option>
                                        })}

                                    </select>
                                </div>
                                <div className="col-sm-3">
                                    <label>County</label>
                                    {/* <input type="text" name="county" className="form-control" onChange={(e)=>this.handleChange(e)}/> */}
                                    <select name="county" onChange={(e) => this.handleChange(e)}>
                                        <option value="">Select County</option>
                                        {this.state.dropdowns.counties.map(dropdown => {
                                            return <option value={dropdown} key={dropdown}>{dropdown}</option>
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {!this.state.loading ?
                            <ul className="my-properties-list">
                                {this.state.props.length>0 ? 
                                    this.state.props.map((prop, i) => {
                                        return <li key={i}>
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
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    
                                    })
                                : <h3>No Properties are available</h3>}
                            </ul>
                        : null }
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default PublicProperties;