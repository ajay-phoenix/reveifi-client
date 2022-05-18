import React, {Component} from "react";


import {AdminTopNav, SideBar} from "components/common/imports/navigations";
import {UserService} from "services/imports/index";

import {Trans} from "react-i18next";
import {Link} from "react-router-dom";
import moment from "moment";
import {toast} from "react-toastify";

const loanType = {1: 'FHA', 2: 'VA', 3: 'Conventional', 4: 'Reverse'};
const cs = {1: '< 600', 2: '600 - 619', 3: '620 - 639', 4: '640 - 699', 5: '700+'};

class BidHistory extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            bidDetail: [],
            preApproval: [],
            maxBid: [],
            resp: [],
        }
    }

    async componentDidMount() {
        this.setState({isLoading: true});
        const propId = window.location.pathname.split("/").pop();
        const response = await UserService.getBidHistory(propId);
        this.makeBidDetailData(response);
        //this.setState({ bidDetail: response});
    }

    makeData(resp) {
        return new Promise((resolve, reject) => {
            let maxBidD = resp.reduce(function (prev, current) {
                return (prev['bids'][0].offer_price > current['bids'][0].offer_price) ? prev : current
            });
            resp['maxBid'] = [];
            resp['maxBid'].push(maxBidD);
            resolve(resp)
        })
    }

    makeBidDetailData(response) {
        const resp = [];
        const promises = [];
        promises.push(this.makeData(response));

        Promise.all(promises).then(res => {
            resp.push(res);
            this.setState({preApproval: resp[0][0][(resp[0][0].length - 1)].pre_approvals});
            this.setState({resp: resp[0][0]});
            this.setState({maxBid: resp[0][0].maxBid});
        });
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }

    async downloadFile(fileName) {
        try {
            const propId = window.location.pathname.split("/").pop();

            const formData = new FormData();
            formData.append('fileName', fileName);

            const response = await UserService.downloadPreApprovFile(formData);
            const link = document.createElement('a');
            link.href = response;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            toast.error('Something went wrong.');
        }
    }

    render() {
        const priceSplitter = (number) => (number && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}>
                </AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <section className="bidhistory-page">
                    {/*-------Header------*/}
                    <div className="bhp-image-header-box">
                        <img src="../images/Mask Group 1.png"/>
                        <div className="bhp-header-row">
                            <div className="bhp-dropdown-box">
                                <span><Trans>Transaction table -  3301 South Greenfield Rd</Trans></span>
                                <img className="norotate" src="../images/ionic-ios-arrow-down.png"/>

                            </div>
                        </div>
                        {
                            this.state['maxBid'].map((prop, i) => {
                                return <div className="bhp-details-box" key={i + 'd'}>
                                    <div className="bhp-detail-left-box">
                                        <h2>{prop['user_property'][0].title}</h2>
                                        <span>
                                            {prop['user_property'][0].address},
                                            {prop['user_property'][0].city},
                                            {prop['user_property'][0].state},
                                            {
                                                global['constCountries'].map((cc, ii) => {
                                                    return cc.value == prop['user_property'][0].country ? cc.label : null
                                                })
                                            }
                                            </span>
                                    </div>
                                    <div className="bhp-detail-right-box">
                                        <div className="bhpd-recent-box">
                                            <div className="bhpd-recent-dlr">$</div>
                                            <div className="bhpd-recent-price">
                                                <b>{priceSplitter(prop['bids'][0].offer_price)}</b>
                                                <span><Trans>Recent Bid Price</Trans></span>
                                            </div>
                                        </div>
                                        <div className="bhpd-asking-box">
                                            <div className="bhpd-asking-dlr">$</div>
                                            <div className="bhpd-asking-price">
                                                {
                                                    prop.bids_negotiations.length > 0 ?
                                                        <b>{priceSplitter(prop.bids_negotiations[(prop.bids_negotiations.length - 1)]['negotiating_prices'])}</b> :
                                                        <b>{priceSplitter(prop['user_property'][0].price)}</b>
                                                }
                                                <span><Trans>Asking Price</Trans></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                    {/*-------Table------*/}
                    <div className="bidhistory-table-box">
                        <table className="bidhistory-table">
                            <thead>
                            <tr>
                                <th><Trans>Name</Trans></th>
                                <th><Trans>Bid Details</Trans></th>
                                <th><Trans>Status</Trans></th>
                                <th><Trans>Bid Price</Trans></th>
                                <th className="bht-time"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state['resp'].map((prop, i) => {
                                    return <tr key={i}>
                                        <td>{prop['user_property'][0].title}</td>
                                        <td>
                                            {
                                                prop['bids'][0].status == 0 ?
                                                    'New Offer Submitted'
                                                    : prop['bids'][0].status == 1 ? 'Accepted' :
                                                    prop['bids'][0].status == -1 ? 'Rejected' : 'No action taken yet'
                                            }
                                        </td>
                                        <td> {
                                            prop['bids'][0].status == 0 ?
                                                'New Offer Submitted'
                                                : prop['bids'][0].status == 1 ? 'Accepted' :
                                                prop['bids'][0].status == -1 ? 'Rejected' : 'No action taken yet'
                                        }</td>
                                        <td>${priceSplitter(prop['bids'][0].offer_price)}</td>
                                        <td><span
                                            className="bht-time">{moment(prop.bids[0].created_at).format('hh:mm A')}</span>
                                        </td>
                                    </tr>
                                })
                            }
                            </tbody>
                        </table>
                    </div>
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="container">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="bid-details">
                                            <h5><Trans>Loan Details</Trans></h5>
                                        </div>
                                        <div className="offers_detail_table">
                                            <table className="table">
                                                <tbody>
                                                <tr>
                                                    <td>
                                                        <Trans>Offer Price</Trans>
                                                    </td>
                                                    <td>
                                                        ${priceSplitter(this.state['preApproval'].offer_price)}
                                                    </td>

                                                </tr>
                                                <tr className="outer-tr">
                                                    <td>
                                                        <Trans>Loan Type</Trans>
                                                    </td>
                                                    <td>
                                                        {loanType[this.state['preApproval'].loan_type]}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <Trans>Loan Amount</Trans>
                                                    </td>
                                                    <td>
                                                        ${priceSplitter(this.state['preApproval'].loan_amount)}
                                                    </td>
                                                </tr>
                                                <tr className="outer-tr">
                                                    <td>
                                                        <Trans>Down Payment</Trans>
                                                    </td>
                                                    <td>${priceSplitter(this.state['preApproval'].down_payment)}</td>

                                                </tr>
                                                <tr>
                                                    <td>
                                                        <Trans>Credit Score</Trans>
                                                    </td>
                                                    <td>
                                                        {cs[this.state['preApproval'].credit_score]}
                                                    </td>

                                                </tr>
                                                <tr className="outer-tr">
                                                    <td>
                                                        <Trans>Balance In Buyer’s Bank Account</Trans>
                                                    </td>
                                                    <td>${priceSplitter(this.state['preApproval'].bank_balance)}</td>

                                                </tr>

                                                <tr>
                                                    <td>
                                                        <Trans>Total Assets</Trans>
                                                    </td>
                                                    <td>
                                                        {
                                                            this.state['preApproval'].total_assets
                                                        }

                                                    </td>

                                                </tr>
                                                <tr className="outer-tr">
                                                    <td>
                                                        <Trans>Pre-Approved Letter</Trans>
                                                    </td>
                                                    <td>
                                                        {
                                                            this.state['preApproval'].document_name ?
                                                                <a href="javascript:void(0);"
                                                                   onClick={() => this.downloadFile(this.state['preApproval'].document_name)}
                                                                   style={{color: "#c3d235"}}
                                                                >
                                                                    <i className="fa fa-download"></i>
                                                                </a> : 'No Pre Approval Document Provided'
                                                        }
                                                    </td>
                                                </tr>
                                                <tr className="outer-tr">
                                                    <td>
                                                        <Trans>Date</Trans>
                                                    </td>
                                                    <td>
                                                        {moment(this.state['preApproval'].created_at).format('DD-MM-YY hh:mm A')}
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*<div className="row">*/}
                        {/*<div className="container">*/}
                        {/*<div className="profile-inner">*/}
                        {/*<div className="row">*/}
                        {/*<div className="bid-details">*/}
                        {/*<h5><Trans>Bid Negotiations</Trans></h5>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*<div className="container lender-table form-inner">*/}
                        {/*<div className="table-responsive">*/}
                        {/*<table className="table table-hover">*/}
                        {/*<thead>*/}
                        {/*<tr>*/}
                        {/*<th><Trans>Old Offer Price</Trans></th>*/}
                        {/*<th><Trans>Negotiated Price</Trans></th>*/}
                        {/*</tr>*/}
                        {/*</thead>*/}
                        {/*<tbody>*/}
                        {/*{*/}
                        {/*(this.state['bids_negotiations'].length > 0) ?*/}
                        {/*this.state['bids_negotiations'].map((bn, i) => {*/}
                        {/*return <tr key={i}>*/}
                        {/*<td>$ {priceSplitter(bn.bid_price)}</td>*/}
                        {/*<td>$ {priceSplitter(bn.negotiating_prices)}</td>*/}
                        {/*</tr>*/}
                        {/*}) : <tr>*/}
                        {/*<td>Nothing to display</td>*/}
                        {/*<td>Nothing to display</td>*/}
                        {/*</tr>*/}
                        {/*}*/}
                        {/*</tbody>*/}
                        {/*</table>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                    </div>
                </section>


            </React.Fragment>
        )
    }


}

export default BidHistory;