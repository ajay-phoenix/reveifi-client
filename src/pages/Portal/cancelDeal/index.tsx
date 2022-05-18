import React, { Component } from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import CookieService from "../../../services/CookieService";

import {
    FormBuilder,
    AbstractControl,
    Validators,
    FieldGroup,
    FieldControl
} from "react-reactive-form";

import "./_style.scss";
import UserService from "../../../services/UserService";
import UrlService from "../../../services/UrlService";
import { toast } from 'react-toastify';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Trans, useTranslation } from "react-i18next";

export function MyComponent({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <textarea className="form-control" type="text" placeholder={t(`Enter ${meta.label}`)} {...handler()} />
}

const TextInput = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <MyComponent handler={handler} meta={meta} ></MyComponent>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </div>
);

class CancelDeal extends Component<RouteComponentProps> {
    constructor(props) {
        super(props);
        this.state = {
            userProfile: {},
            props: {},
            loading: 'true',
            dealClosed: false,
            loader: false,
        }
        this.handler = this.handler.bind(this)
    }
    handler() {
        this.setState({ updateLanguage: true })
    }

    async componentDidMount() {
        const propId = window.location.pathname.split("/").pop();
        const response = await UserService.getSingleProperty(propId);
        const user_profile = await UserService.getCurrentUserProfile();
        this.setState({ props: response[0], loading: 'false' });
        this.setState({ userProfile: user_profile['userProfile'] });
    }

    recForm = FormBuilder.group({
        reason: [''],
    });

    confirmCancel = (event: any) => {
        event.preventDefault();
        confirmAlert({
            title: 'Confirm to cancel',
            message: 'Are you sure to cancel this deal?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => (this.handleFormSubmit(event))
                },
                {
                    label: 'No',
                    onClick: () => null
                }
            ]
        });
    };

    async prepareData() {
        const formData = new FormData();
        const propId = window.location.pathname.split("/").pop();
        formData.append('reason', this.recForm.get('reason').value);
        formData.append('prop_id', propId);
        return formData;
    }

    async handleFormSubmit(event: any) {
        this.setState({ loader: true });
        this.recForm.patchValue({ loader: true });

        const formData = await this.prepareData();
        const response = await UserService.cancelDeal(formData);

        if (response.success) {

            this.setState({ dealClosed: true });
            this.setState({ loader: false });
            this.recForm.patchValue({ loader: false });
            toast.success('Deal Closed');
            this.props.history.push('/my-properties')
        } else {
            this.recForm.patchValue({ loader: false });
            this.setState({ loader: false });
            toast.error(response.error);
        }
    }

    render() {
        return (
            <React.Fragment>
                <AdminTopNav></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <div className="content-wrapper">
                    <div className="row">
                        <div className="container">
                            <div className="profile-inner">
                                <div className="biddetail-outer">
                                    <div className="row">
                                        <div className="col-md-7">
                                            <div className="property-img">
                                                <img
                                                    src={UrlService.imagesPath() + '/' + this.state['props']['media']}
                                                    className="img-fluid" />

                                            </div>
                                            <div className="property-name">
                                                <p>{this.state['props']['title']}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="bid-details">
                                                <h5><Trans>Bid Details</Trans></h5>

                                            </div>
                                            <div className="offers_detail_table">

                                                <table className="table">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <Trans>Offer Price</Trans>
                                                            </td>
                                                            <td>
                                                                ${this.state['props']['price']}
                                                            </td>

                                                        </tr>
                                                        <tr className="outer-tr">
                                                            <td>
                                                                <Trans>Property Address</Trans>
                                                            </td>
                                                            <td>{this.state['props']['address']}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="container">
                            <div className="profile-inner">
                                <div className="biddetail-outer">
                                    {
                                        !this.state['dealClosed']
                                            ?
                                            <FieldGroup
                                                control={this.recForm}
                                                render={({ invalid, pristine, pending, meta }) => (
                                                    <form noValidate onSubmit={(event) => this.confirmCancel(event)}>
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <div className="submit-bid">
                                                                    <h4><Trans>Cancel deal</Trans></h4>
                                                                </div>
                                                                <div className="offers_detail_table" id="submit-biid">
                                                                    <table className="table">
                                                                        <tbody>
                                                                            <React.Fragment>
                                                                                <tr>
                                                                                    <td><Trans>Reason To close deal</Trans></td>
                                                                                    <td>
                                                                                        <FieldControl
                                                                                            name="reason"
                                                                                            render={TextInput}
                                                                                            meta={{ label: "Reason To close deal" }}
                                                                                        />
                                                                                        <input type="hidden" name="role"
                                                                                            value={(this.state['props'].user_id == this.state['userProfile'].id) ? 1 : 2} />
                                                                                    </td>
                                                                                </tr>
                                                                            </React.Fragment>

                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                                <div className="submit-bid-btn">
                                                                    {
                                                                        !this.state['loader']
                                                                            ?
                                                                            <input type="submit"
                                                                                disabled={invalid}>
                                                                            </input>
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
                                                            </div>
                                                        </div>
                                                    </form>
                                                )}
                                            />
                                            :
                                            <div className="row">
                                                <div className="container">
                                                    <div className="alert-group">
                                                        <div className="alert alert-success alert-dismissable">
                                                            <button type="button" className="close" data-dismiss="alert" aria-hidden="true"><Trans>×</Trans></button>
                                                            <strong className="text text-danger"><Trans>Deal Closed Successfully</Trans></strong>
                                                        </div>

                                                    </div>
                                                </div>
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

export default CancelDeal;