import React from 'react';
import TopNav from "../../../components/common/topnav";
import './style.css';
import { UserService } from "services/imports/index";
import { RouteComponentProps } from 'react-router-dom';
import $ from 'jquery';
import { Trans } from "react-i18next";

class Leaderboard extends React.Component<RouteComponentProps, any>{

    constructor(props){
        super(props);
        this.state = {
            loading: true,
            realtors: [],
            state: '',
            county: '',
            date_from: '',
            date_to: '',
            dropdowns: { states: [], counties: [] }
        }
    }

    async componentDidMount(){
       this.getRealtorsLeaderBoard();
    }

    async getRealtorsLeaderBoard(){
        var state = $('select[name=state]').val()
        var county = $('select[name=county]').val()
        var date_from = $('input[name=date_from]').val()
        var date_to = $('input[name=date_to]').val()

        var leaderboard_dropdowns = await UserService.getLeaderBoardDropdowns();

        var params = '?state='+state+'&county='+county+'&date_from='+date_from+'&date_to='+date_to;

        var realtors_leaderboard = await UserService.getRealtorsLeaderBoard(params);
        this.setState({ realtors: realtors_leaderboard, dropdowns: leaderboard_dropdowns })
    }

    handleChange(e){
        this.setState({ [e.target.name]: e.target.value })
        this.getRealtorsLeaderBoard()
    }

    render(){
        return(<>
            <TopNav />
            <section className="loginsection">
                <div className="login-form-box m-4">
                    <h3><Trans>Realtors Leaderboard</Trans></h3>

                    <div className="row w-100 mb-2">
                        <div className="col-sm-3 pl-0">
                            <label><Trans>State</Trans></label>
                            {/* <input type="text" name="state" className="form-control" onChange={(e)=>this.handleChange(e)}/> */}
                            <select name="state" className="form-control" onChange={(e)=>this.handleChange(e)}>
                                <option value=""><Trans>Select State</Trans></option>
                                {this.state.dropdowns.states.map(dropdown=>{
                                    return <option value={dropdown}>{dropdown}</option>
                                })}
                                
                            </select>
                        </div>
                        <div className="col-sm-3">
                            <label><Trans>County</Trans></label>
                            {/* <input type="text" name="county" className="form-control" onChange={(e)=>this.handleChange(e)}/> */}
                            <select name="county" onChange={(e)=>this.handleChange(e)}>
                                <option value=""><Trans>Select County</Trans></option>
                                {this.state.dropdowns.counties.map(dropdown=>{
                                    return <option value={dropdown}>{dropdown}</option>
                                })}
                            </select>
                        </div>
                        <div className="col-sm-3">
                            <label><Trans>Date From</Trans></label>
                            <input type="date" name="date_from" className="form-control" onChange={(e)=>this.handleChange(e)}/>
                        </div>
                        <div className="col-sm-3 pr-0">
                            <label><Trans>Date To</Trans></label>
                            <input type="date" name="date_to" className="form-control" onChange={(e)=>this.handleChange(e)}/>
                        </div>
                    </div>
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th><Trans>Realtor Name</Trans></th>
                                <th><Trans>Realtor Email</Trans></th>
                                <th><Trans>Closed Deals</Trans></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.realtors.map(realtor=>{
                                return (<tr>
                                    <td>{realtor.rank}</td>
                                    <td>{realtor.realtor_info?.name+' '+realtor.realtor_info?.last_name}</td>
                                    <td>{realtor.realtor_info?.email}</td>
                                    <td>{realtor.total_properties} ({realtor.total_sellers} Seller {realtor.total_buyers} Buyer)</td>
                                </tr>)
                            })}
                        </tbody>
                    </table>
                    </div>
            </section>    
        </>)
    }
}

export default Leaderboard