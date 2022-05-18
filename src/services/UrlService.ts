let apiDomain = "https://phpstack-440027-1506432.cloudwaysapps.com/";
let chatApiDomain = "https://socket.reverifi.com/";
if (process.env.NODE_ENV === "production") {
    apiDomain = "https://phpstack-440027-1506432.cloudwaysapps.com/";
    chatApiDomain = "https://socket.reverifi.com/";
} else {
    apiDomain = "http://localhost:8000/";
    chatApiDomain = "http://localhost:5000/";
}

class UrlService {
    static chatAPIURL(){
        return chatApiDomain;
    }

    static realtorAdditionalInfoUrl(id){
        return apiDomain+"v1/realtor-additional-info/"+id;
    }

    static addPropertyToTransactionTableUrl(){
        return apiDomain+"v1/add-property-to-transaction-table";
    }

    static addUserToPropertyUrl(){
        return apiDomain+"v1/add-user-to-property";
    }

    static getPropertyAllBidsUrl(prop_id){
        return apiDomain+"v1/get-property-all-bids/"+prop_id;
    }

    static createClientUrl(){
        return apiDomain+"v1/create-client";
    }

    static getAllUsersWithRoleUrl(id){
        return apiDomain+"v1/get-users-with-role/"+id;
    }

    static getUserInfoByRememberTokenUrl(verify_token){
        return apiDomain+"v1/user-info-by-verify-token/"+verify_token;
    }

    static createPasswordUrl(){
        return apiDomain+"v1/create-password";
    }

    static delistPropertyUrl(id){
        return apiDomain+"v1/delist-property/"+id;
    }

    static deleteImageUrl(){
        return apiDomain+"v1/delete-image";
    }
    static editPropertyUrl(){
        return apiDomain+"v1/edit-property";
    }
    static getRealtorPropertiesByIdUrl(id){
        return apiDomain+"v1/realtor-properties/"+id;
    }

    static getPublicPropertiesUrl(){
        return apiDomain + "v1/get-public-properties"
    }

    static getLeaderBoardDropdownsUrl(){
        return apiDomain + "v1/get-leaderboard-dropdowns"
    }

    static getRealtorsLeaderBoardURL(){
        return apiDomain + "v1/get-realtors-leaderboard"
    }

    static getLendersLeaderBoardURL(){
        return apiDomain + "v1/get-lenders-leaderboard"
    }

    static getUserBuyingRoomURL(id) {
        return apiDomain + "v1/get-user-buying-room/" + id;
    }

    static deletePropertyForAnotherBuyersURL() {
        return apiDomain + "v1/delete-property-for-another-buyers";
    }

    static loginUrl() {
        return apiDomain + "v1/user-login";
    }

    static signUpUrl() {
        return apiDomain + "v1/user-signup";
    }

    static ChatroomUrl() {
        return apiDomain + "v1/chat";
    }

    static forgotpassword() {
        return apiDomain + "v1/forgot-password";
    }

    static resetpassword() {
        return apiDomain + "v1/reset-password";
    }

    static updateProfilePassword() {
        return apiDomain + "v1/update-profile-password";
    }

    static verifyEmailUrl() {
        return apiDomain + "v1/verify";
    }

    static mobileNumberUrl() {
        return apiDomain + "v1/verify-mobile-number";
    }

    static codeVerificationUrl() {
        return apiDomain + "v1/verify-mobile-otp";
    }

    static submitPropertyUrl() {
        return apiDomain + "v1/submit-property";
    }

    static submitBidUrl() {
        return apiDomain + "v1/process-bid";
    }

    static sendMessageUrl(id) {
        return apiDomain + "v1/chat/" + id + "/message";
    }


    static submitPreApprovalUrl() {
        return apiDomain + "v1/submit-pre-approvals";
    }

    static updatePreApprovalUrl() {
        return apiDomain + "v1/update-pre-approvals";
    }

    static getPreApprovalUrl() {
        return apiDomain + "v1/get-pre-approvals";
    }

    static updateBidUrl() {
        return apiDomain + "v1/update-bid-status";
    }

    static invitationUrl() {
        return apiDomain + "v1/send-invitation";
    }

    static propertyInvitationUrl() {
        return apiDomain + "v1/send-property-invitation";
    }

    static sendBuyerRealtorInvitationsUrl() {
        return apiDomain + "v1/send-buyer-realtor-invitation";
    }

    static sendBuyerRealtorBuyerInvitationsUrl() {
        return apiDomain + "v1/send-buyer-realtor-buyer-invitation";
    }

    static sendReferralsUrl() {
        return apiDomain + "v1/send-referrals";
    }

    static updateUserUrl() {
        return apiDomain + "v1/update-user";
    }

    static updateUserRoleUrl() {
        return apiDomain + "v1/update-user-role";
    }

    static updateBusinessProfileUrl() {
        return apiDomain + "v1/business-profile";
    }

    static currentUserProfileUrl() {
        return apiDomain + "v1/get-user-profile";
    }

    static currentUserProfileUrlWithoutLogin(id) {
        return apiDomain + "v1/profile/" + id;
    }

    static currentUserpropertiesUrl() {
        return apiDomain + "v1/my-properties";
    }

    static realtorPropertiesUrl() {
        return apiDomain + "v1/realtor-properties";
    }

    static getInvitedpropertiesUrl() {
        return apiDomain + "v1/invited-proprties";
    }

    static getClientListUrl() {
        return apiDomain + "v1/client-list";
    }

    static getOffersUrl() {
        return apiDomain + "v1/props-offers";
    }

    static getlendersListUrl(id) {
        return apiDomain + "v1/get-user-act/" + id;
    }

    static singlePropUrl() {
        return apiDomain + "v1/property-details";
    }

    static getUserPreApprovalUrl() {
        return apiDomain + "v1/user-pre-approval";
    }

    static getBidDetailUrl() {
        return apiDomain + "v1/bid-details";
    }
    static getBidDetailForBuyingRealtorUrl() {
        return apiDomain + "v1/buying-realtor-bid-details";
    }

    static bidNegotiationUrl() {
        return apiDomain + "v1/bid-negotiation";
    }

    static bidHistoryUrl() {
        return apiDomain + "v1/bid-history";
    }

    static getUserNotificationsUrl() {
        return apiDomain + "v1/get-user-notifications";
    }

    static getUpdateUserNotificationsUrl() {
        return apiDomain + "v1/update-user-notifications";
    }

    static imagesPath() {
        return apiDomain + "storage";
    }

    static buyingRoom(id) {
        return apiDomain + "v1/buying-room/" + id;
    }

    static bidProgressUrl() {
        return apiDomain + "v1/buying-room-progress";
    }

    static getMessageUrl(id, messageId) {
        return apiDomain + `v1/chat/${id}/message?message_id=${messageId}`;
    }

    static getDashboardStatsUrl() {
        return apiDomain + `v1/resolve/dashboard-stats`;
    }

    static getChecklistUrl(id) {
        return apiDomain + `v1/check-list/${id}`;
    }

    static getCancelDealUrl() {
        return apiDomain + `v1/cancel-deal`;
    }

    static downloadFileUrl(id) {
        return apiDomain + `v1/download-attachment/${id}`;
    }

    static getAllDocumentsUrl(id) {
        return apiDomain + `v1/buying-room-documents/${id}`;
    }

    static downloadProgressFileUrl(id) {
        return apiDomain + `v1/buying-room-documents-download/${id}`;
    }

    static downloadPreApprovFileUrl() {
        return apiDomain + `v1/pre-approval-download`;
    }

    static getUserProfileUrl(id) {
        return apiDomain + `v1/user-profile/${id}`;
    }

    static getBuyingroomStatusUrl(id) {
        return apiDomain + `v1/buying-room-progress/${id}`;
    }

    static getUserChatRoomsUrl() {
        return apiDomain + `v1/user/chats`;
    }

    static getnegotiateBidUrl() {
        return apiDomain + `v1/negotiate-bid`;
    }

    static questionnaireUrl(role_id, prop_id) {
        return apiDomain + `v1/all-questions/${role_id}/${prop_id}`;
    }

    static submitFeedbackUrl() {
        return apiDomain + `v1/submit-feedback`;
    }

    static allBuyingRoomsUrl() {
        return apiDomain + `v1/user-buyingrooms`;
    }

    static closedDealsUrl() {
        return apiDomain + `v1/closed-deals`;
    }

    static getChatNotificationsUrl() {
        return apiDomain + "v1/message-notify";
    }

    static getUpdateChatNotificationsUrl(id) {
        return apiDomain + `v1/message-notify/update/${id}`;
    }
    static sendUserFeedback() {
        return apiDomain + `v1/submit-user-buying-feedback`;
    }
    static getUserFeedbacks() {
        return apiDomain + `v1/get-user-buying-feedbacks`;
    }
    static updateNotificationsSettingURL() {
        return apiDomain + `v1/update-notifications-setting`;
    }
    static getNotificationsSettingUrl() {
        return apiDomain + `v1/get-notifications-setting`;
    }

}

export default UrlService;