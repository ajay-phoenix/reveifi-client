import React, {Component} from "react";
import {RouteComponentProps} from "react-router-dom";
import {Trans} from "react-i18next";
import {AdminTopNav, SideBar} from "components/common/imports/navigations";
import {UserService} from "services/imports/index";
import 'react-tagsinput/react-tagsinput.css'
import "./_style.scss";
import { toast } from 'react-toastify';

class SubmitBid extends Component<RouteComponentProps, any> {
    settings = []
    constructor(props) {
        super(props);
        this.state = {
            user: [],
            userType: localStorage.getItem("type") ? localStorage.getItem("type") : 'Buyer'
        }
        this.handleSetting = this.handleSetting.bind(this)
        this.updateSettings = this.updateSettings.bind(this)
        this.handler = this.handler.bind(this);
    }

    handler() {
        this.setState({updateLanguage: true});
    }

    componentDidMount(){
        this.getUser();
        this.notificationSettings();
    }

    async getUser() {
        const userData = await UserService.getCurrentUserProfile();
        this.setState({user: userData.userProfile})
    }

    async notificationSettings(){
        var user_settings = await UserService.getNotificationsSetting()
        this.settings = JSON.parse(user_settings.settings)
        this.setState({ loading: true })
        if(user_settings.length<1 && this.settings.length<1){
            this.settings = [
                { 'title': 'Offer Accepted', 'name': 'offer_accepted', 'values': [1, 1] },
                { 'title': 'Initial Contract', 'name': 'initial_contract', 'values': [1, 1] },
                { 'title': 'Signed Initial Contract', 'name': 'signed_initial_contract', 'values': [1, 1] },
                { 'title': 'Inspection Date', 'name': 'inspection_date', 'values': [1, 1] },
                { 'title': 'Confirm Inspection Date', 'name': 'confirm_inspection_date', 'values': [1, 1] },
                { 'title': 'Inspection Results', 'name': 'inspection_results', 'values': [1, 1] },
                { 'title': 'Suggest Appraisal Date', 'name': 'suggest_appraisal_date', 'values': [1, 1] },
                { 'title': 'Confirm Appraisal Date', 'name': 'confirm_appraisal_date', 'values': [1, 1] },
                { 'title': 'Upload Appraisal Report', 'name': 'upload_appraisal_report', 'values': [1, 1] },
                { 'title': 'Title Insurance', 'name': 'title_insurance', 'values': [1, 1] },
                { 'title': 'Mortgage Commitment', 'name': 'mortgage_commitment', 'values': [1, 1] },
                { 'title': 'Buyer Cleared to Close', 'name': 'buyer_cleared_to_close', 'values': [1, 1] },
                { 'title': 'Seller Cleared to Close', 'name': 'seller_cleared_to_close', 'values': [1, 1]},
                { 'title': 'Set Close Date', 'name': 'set_close_date', 'values': [1, 1] },
                { 'title': 'Buyer Walkthrough', 'name': 'buyer_walkthrough', 'values': [1, 1] },
                { 'title': 'Confirm Close Date', 'name': 'confirm_close_date', 'values': [1, 1] },
                { 'title': 'Complete', 'name': 'complete', 'values': [1, 1] }
            ]
            this.setState({ loading: false })
        }
    }

    handleSetting(event){
        for(let i=0; i<this.settings.length; i++){
            if(this.settings[i].name+'_email'===event.target.name){
                this.settings[i].values = [event.target.checked ? 1 : event.target.checked ? 1 : 0, this.settings[i].values[1]];
            } else if(this.settings[i].name+'_sms'===event.target.name){
                this.settings[i].values = [event.target.checked ? 1 : this.settings[i].values[0], event.target.checked ? 1 : 0];
            }
        }
    }

    async updateSettings(){
       var settings = JSON.stringify(this.settings)
       var fd = new FormData();
       fd.append('settings', settings)

       var response = await UserService.updateNotificationsSetting(fd);
       
       if(response.success===true){
        toast.success('Settings updated Successfully');
       } else{
        toast.error('Something went wrong!');
       }
    }

    render() {
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <div className="submit-property-page">
                    <h3><Trans>Notification Settings</Trans></h3>
                    {this.state.user.role_id===1 ? 
                        <div className="submit-property-box">
                            <div className="row">
                                <div className="col-sm-8"><h6><Trans>Notifications</Trans></h6></div>
                                <div className="col-sm-2"><h6><Trans>Email</Trans></h6></div>
                                <div className="col-sm-2"><h6><Trans>SMS</Trans></h6></div>
                            </div>
                            {this.settings.map((setting, i)=>{
                                return <div className="row mt-2" key={i}>
                                    <div className="col-sm-8">{setting.title}</div>
                                    <div className="col-sm-2"><input className="dcheck" type="checkbox" name={setting.name+"_email"} onChange={this.handleSetting} defaultChecked={setting.values[0]===1} /></div>
                                    <div className="col-sm-2"><input className="dcheck" type="checkbox" name={setting.name+"_sms"} onChange={this.handleSetting} defaultChecked={setting.values[1]===1} />  </div>
                                </div>
                            })}
                            <button type='submit' className="submitpropert-btn mt-4 ml-1 w-25" onClick={this.updateSettings}><Trans>Update settings</Trans></button>
                        </div>
                    : null}

                    {this.state.user.role_id===2 ? 
                        <div className="submit-property-box">
                            <div className="row">
                                <div className="col-sm-8"><h6><Trans>Notifications</Trans></h6></div>
                                <div className="col-sm-2"><h6><Trans>Email</Trans></h6></div>
                                <div className="col-sm-2"><h6><Trans>SMS</Trans></h6></div>
                            </div>
                            {this.settings.map((setting, i)=>{
                                return <div className="row mt-2" key={i}>
                                    <div className="col-sm-8">{setting.title}</div>
                                    <div className="col-sm-2"><input className="dcheck" type="checkbox" name={setting.name+"_email"} onChange={this.handleSetting} defaultChecked={setting.values[0]===1} /></div>
                                    <div className="col-sm-2"><input className="dcheck" type="checkbox" name={setting.name+"_sms"} onChange={this.handleSetting} defaultChecked={setting.values[1]===1} />  </div>
                                </div>
                            })}
                            <button type='submit' className="submitpropert-btn mt-4 ml-1 w-25" onClick={this.updateSettings}><Trans>Update settings</Trans></button>
                        </div>
                    : null}

                    {this.state.user.role_id===3 ? 
                        <div className="submit-property-box">
                           <div className="row">
                                <div className="col-sm-8"><h6><Trans>Notifications</Trans></h6></div>
                                <div className="col-sm-2"><h6><Trans>Email</Trans></h6></div>
                                <div className="col-sm-2"><h6><Trans>SMS</Trans></h6></div>
                            </div>
                            {this.settings.map((setting, i)=>{
                                return <div className="row mt-2" key={i}>
                                    <div className="col-sm-8">{setting.title}</div>
                                    <div className="col-sm-2"><input className="dcheck" type="checkbox" name={setting.name+"_email"} onChange={this.handleSetting} defaultChecked={setting.values[0]===1} /></div>
                                    <div className="col-sm-2"><input className="dcheck" type="checkbox" name={setting.name+"_sms"} onChange={this.handleSetting} defaultChecked={setting.values[1]===1} />  </div>
                                </div>
                            })}
                            <button type='submit' className="submitpropert-btn mt-4 ml-1 w-25" onClick={this.updateSettings}><Trans>Update settings</Trans></button>
                        </div>
                    : null}
                    
                </div>
            </React.Fragment>
        )
    }
}

export default SubmitBid;   