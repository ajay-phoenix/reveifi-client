import React, {Component} from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";

import {ProtectedRoute} from "./components/common/router/protected";


import "./assets/css/global.scss"
import "./global/constant";


import Login from "./pages/login";
import SignUp from "./pages/signup";
import Forgotpassowrd from "./pages/forgotpassword";
import Dashboard from "./pages/Portal/dashboard";
import EditProfile from "./pages/Portal/editprofile";
import Profile from "./pages/Portal/editprofile/newprofile";
import MobileNumberVerification from "./pages/Portal/mobileNumberVerification";
import CodeVerification from "./pages/Portal/mobileNumberVerification/codeVerification";
import SubmitProperty from "./pages/Portal/submitProperty";
import EditProperty from "./pages/Portal/editProperty";
import Lender from "./pages/Portal/lender";
import Realtor from "./pages/Portal/realtor";
import PropertyInvitaions from "./pages/Portal/propertyInvitations";
import MyProperties from "./pages/Portal/myProperties";
import PropertyDetail from "./pages/Portal/propertyDetail";
import Offers from "./pages/Portal/offers";
import ClosedDeals from "./pages/Portal/closedDeals";
import BidDetail from "./pages/Portal/bidDetails";
import BidDetail2 from "./pages/Portal/bidDetails/bidDetail2";
import BidDetail3 from "./pages/Portal/bidDetails/bidDetail3";
import PropStatus from "./pages/Portal/propStatus";
import BidHistory from "./pages/Portal/bidHistory";
import Inbox from "./pages/Portal/inbox";
import testInbox from "./pages/Portal/testInbox";
import PreApprovalForm from "./pages/Portal/preApprovalsForm";
import SubmitBid from "./pages/Portal/submitBid";
import MyInvites from "./pages/Portal/myInvites";
import ClientList from "./pages/Portal/clientList";
import ConfirmationEmail from "./pages/Portal/confirmationEmail";
import bidStatus from "./pages/Portal/bidStatus";
import CookieService from "./services/CookieService";
import Resetpassword from "./pages/resetpassword";
import CancelDeal from "./pages/Portal/cancelDeal";
import feedback from "./pages/Portal/feedback";
import notificationSettings from "./pages/Portal/notificationSettings";
import LatestChat from "./pages/Portal/chatRoom";
import RealtorsLeaderboard from "./pages/Portal/leaderboard/realtors";
import LendersLeaderboard from "./pages/Portal/leaderboard/lenders";
import PublicProperties from "./pages/Portal/PublicProperties";
import propertyDetails from "./pages/Portal/PublicProperties/propertyDetails";
import PropertyListings from "./pages/Portal/PublicProperties/UserPropertyListings";
import CreateClient from "./pages/Portal/CreateClient";
import CreatePassword from "./pages/CreatePassword";
import AddPropertyToTransactionTable from "./pages/Portal/submitProperty/AddPropertyToTransactionTable";
import AddUsersToProperty from "./pages/Portal/submitProperty/AddUsersToProperty";
import { store } from "./redux/store";

interface GuestRouteInterface {
    path: string;
    component: any;
    exact?: boolean;
}


const guestRoutes: Array<GuestRouteInterface> = [
    {path: "/", component: Login, exact: true},
    {path: "/login", component: Login, exact: true},
    {path: "/create-password", component: CreatePassword, exact: true},
    {path: "/public-properties", component: PublicProperties, exact: true},
    {path: "/property-details/:id", component: propertyDetails, exact: true},
    {path: "/realtors-leaderboard", component: RealtorsLeaderboard, exact: true},
    {path: "/lenders-leaderboard", component: LendersLeaderboard, exact: true},
    {path: "/sign-up", component: SignUp, exact: true},
    {path: "/forgot-password", component: Forgotpassowrd, exact: true},
    {path: "/password/reset", component: Resetpassword, exact: true},
    {path: "/property-listings/:id", component: PropertyListings, exact: true},
    {path: "/profile/:id", component: Profile, exact: true},
];


const protectedRoutes: Array<any> = [
    {path: "/my-properties", component: MyProperties, exact: true},
    {path: "/submit-property", component: SubmitProperty, exact: true},
    {path: "/edit-listing/:id", component: EditProperty, exact: true},
    {path: "/properties-invitations", component: PropertyInvitaions, exact: true},
    {path: "/property-detail/:id", component: PropertyDetail, exact: true},
    {path: "/submit-bid/:id", component: SubmitBid, exact: true},
    {path: "/submit-pre-approvals/:id", component: PreApprovalForm, exact: true},
    {path: "/property-status/:id", component: PropStatus, exact: true},
    {path: "/bid-history/:id", component: BidHistory, exact: true},
    {path: "/mobile-verification", component: MobileNumberVerification, exact: true},
    {path: "/code-verification", component: CodeVerification, exact: true},
    {path: "/edit-profile", component: EditProfile, exact: true},
    {path: "/view-profile", component: Profile, exact: true},
    {path: "/offers", component: Offers, exact: true},
    {path: "/buying-room/:id", component: BidDetail3, exact: true},
    {path: "/cancel-deal/:id", component: CancelDeal, exact: true},
    {path: "/lender-list", component: Lender, exact: true},
    {path: "/realtor-list", component: Realtor, exact: true},
    {path: "/feedback/:id", component: feedback, exact: true},
    {path: "/dashboard", component: Dashboard, exact: true},
    {path: "/property-detail", component: PropertyDetail, exact: true},
    {path: "/closed-deals", component: ClosedDeals, exact: true},
    {path: "/bid-detail", component: BidDetail, exact: true},
    {path: "/inbox", component: Inbox, exact: true},
    {path: "/test-inbox", component: testInbox, exact: true},
    {path: "/my-invites", component: MyInvites, exact: true},
    {path: "/client-list", component: ClientList, exact: true},
    {path: "/confirmation-email", component: ConfirmationEmail, exact: true},
    {path: "/bid-status", component: bidStatus, exact: true},
    {path: "/notification-settings", component: notificationSettings, exact: true},
    {path: "/latest-chat", component: LatestChat, exact: true},
    {path: "/create-client", component: CreateClient, exact: true},
    {path: "/add-property-to-transaction-table", component: AddPropertyToTransactionTable, exact: true},
    {path: "/add-user-to-transaction-table/:id", component: AddUsersToProperty, exact: true},
];

/**get Cookie & set**/

class App extends Component {


    render() {
        return (
            <BrowserRouter>
                <Switch>
                    {guestRoutes.map((route, key) => {
                        return (
                            <Route
                                exact={route.exact}
                                path={route.path}
                                component={route.component}
                                key={key}
                            />
                        );
                    })}
                        {protectedRoutes.map((route, key) => {
                            return (
                                <ProtectedRoute
                                    exact={route.exact}
                                    path={route.path}
                                    component={route.component}
                                    key={key}
                                />
                            );
                        })}
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
