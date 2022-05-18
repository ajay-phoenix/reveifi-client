import UrlService from "./UrlService";
import AddressService from "./AddessService";
import HttpService from "./HttpService";
import axios from "axios";

interface MobileNumber {
    mobileNumber: string;
}

interface OtpCode {
    otpCode: string;
}

class UserService {
    user = null;

    async createClient(data) {
        const url = UrlService.createClientUrl();
        try {
            const response = await HttpService.post(url, data);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async realtorAdditionalInfo(id){
        const url = UrlService.realtorAdditionalInfoUrl(id);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async addUserToProperty(data){
        const url = UrlService.addUserToPropertyUrl();
        try {
            const response = await HttpService.post(url, data);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getPropertyAllBids(prop_id) {
        const url = UrlService.getPropertyAllBidsUrl(prop_id);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async addPropertyToTransactionTable(data) {
        const url = UrlService.addPropertyToTransactionTableUrl();
        try {
            const response = await HttpService.post(url, data);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getAllUsersWithRole(id) {
        const url = UrlService.getAllUsersWithRoleUrl(id);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getUserBuyingRoom(id) {
        const url = UrlService.getUserBuyingRoomURL(id);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getUserInfoByRememberToken(verify_token) {
        const url = UrlService.getUserInfoByRememberTokenUrl(verify_token);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async delistProperty(id){
        const url = UrlService.delistPropertyUrl(id);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async deleteImage(data){
        const url = UrlService.deleteImageUrl();
        try {
            const response = await HttpService.post(url, data);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getRealtorPropertiesById(id) {
        const url = UrlService.getRealtorPropertiesByIdUrl(id);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }
    
    async getPublicProperties(params) {
        const url = UrlService.getPublicPropertiesUrl();
        try {
            const response = await HttpService.get(url+params);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }
    
    async getLeaderBoardDropdowns() {
        const url = UrlService.getLeaderBoardDropdownsUrl();
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }
    
    async getRealtorsLeaderBoard(params) {
        const url = UrlService.getRealtorsLeaderBoardURL();
        try {
            const response = await HttpService.get(url+params);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }
    
    async getLendersLeaderBoard(params) {
        const url = UrlService.getLendersLeaderBoardURL();
        try {
            const response = await HttpService.get(url+params);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async deletePropertyForAnotherBuyers(data) {
        const url = UrlService.deletePropertyForAnotherBuyersURL();
        try {
            const response = await HttpService.post(url, data);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getCurrentUserProfileWithoutLogin(id) {
        const url = UrlService.currentUserProfileUrlWithoutLogin(id);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getCurrentUserProfile() {
        const url = UrlService.currentUserProfileUrl();
        try {
            const response = await HttpService.get(url);
            // console.log(response);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getCurrentUserProperties() {
        const url = UrlService.currentUserpropertiesUrl();
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }
    async getRealtorProperties() {
        const url = UrlService.realtorPropertiesUrl();
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getUserActsList(id) {
        const url = UrlService.getlendersListUrl(id);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getInvitedProperties() {
        const url = UrlService.getInvitedpropertiesUrl();
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getClientList() {
        const url = UrlService.getClientListUrl();
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getOffers() {
        const url = UrlService.getOffersUrl();
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getUserNotifications() {
        const url = UrlService.getUserNotificationsUrl();

        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async updateUserNotifications() {
        const url = UrlService.getUpdateUserNotificationsUrl();

        try {
            const response = await HttpService.post(url, {});
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getSingleProperty(id) {
        const url = UrlService.singlePropUrl();
        try {
            const response = await HttpService.get(url + '/' + id);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getUserPreApproval(id) {
        const url = UrlService.getUserPreApprovalUrl();
        try {
            const response = await HttpService.get(url + '/' + id);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getBidNegotiation(id) {
        const url = UrlService.bidNegotiationUrl();
        try {
            const response = await HttpService.get(url + '/' + id);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getBidHistory(id) {
        const url = UrlService.bidHistoryUrl();
        try {
            const response = await HttpService.get(url + '/' + id);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getBidDetail(id) {
        const url = UrlService.getBidDetailUrl();
        try {
            const response = await HttpService.get(url + '/' + id);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }
    async getBidDetailForBuyingRealtor(id) {
        const url = UrlService.getBidDetailForBuyingRealtorUrl();
        try {
            const response = await HttpService.get(url + '/' + id);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async verifyEmailAddress(data: any) {
        const url = UrlService.verifyEmailUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async verifyMobileNumber(mobileNumber: MobileNumber) {
        const url = UrlService.mobileNumberUrl();
        try {
            const response = await HttpService.post(url, mobileNumber);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async codeMobileNumber(otpCode: OtpCode) {
        const url = UrlService.codeVerificationUrl();
        try {
            const response = await HttpService.post(url, otpCode);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async submitProperty(data: any) {
        const url = UrlService.submitPropertyUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async editProperty(data: any) {
        const url = UrlService.editPropertyUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async submitBid(data: any) {
        const url = UrlService.submitBidUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async negotiateBid(data: any) {
        const url = UrlService.getnegotiateBidUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }
    async getChatRoom(id: any) {
        const url = UrlService.ChatroomUrl();
        try {
            const response = await HttpService.get(url + '/' + id);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async getAllBuyingRooms() {
        const url = UrlService.allBuyingRoomsUrl();
        try {
            const response = await HttpService.get(url);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async sendMessage(data: any,id:any) {
        const url = UrlService.sendMessageUrl(id);
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }
    

   
    async submitPreApproval(data: any) {
        const url = UrlService.submitPreApprovalUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }
    
    async updatePreApproval(data: any) {
        const url = UrlService.updatePreApprovalUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async getPreApproval(id: any) {
        const url = UrlService.getPreApprovalUrl();
        try {
            const response = await HttpService.get(url + '/' + id);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async upDateBid(data: any) {
        const url = UrlService.updateBidUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async createChatroom(data: any) {
        const url = UrlService.ChatroomUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async sendInvitations(data: any) {
        const url = UrlService.invitationUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async sendPropertyInvitations(data: any) {
        const url = UrlService.propertyInvitationUrl();
        try {
            const response = await HttpService.post(url, data);
            console.log(response);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async sendBuyerRealtorInvitations(data: any) {
        const url = UrlService.sendBuyerRealtorInvitationsUrl();
        try {
            const response = await HttpService.post(url, data);
            console.log(response);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async sendBuyerRealtorBuyerInvitations(data: any) {
        const url = UrlService.sendBuyerRealtorBuyerInvitationsUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }
    async sendReferrals(data: any) {
        const url = UrlService.sendReferralsUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async updateUser(userData: any) {
        const url = UrlService.updateUserUrl();
        try {
            const response = await HttpService.post(url, userData);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async createPassword(data: any) {
        const url = UrlService.createPasswordUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async resetPassword(data: any) {
        const url = UrlService.updateProfilePassword();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async updateUserRole(userData: any) {
        const url = UrlService.updateUserRoleUrl();
        try {
            const response = await HttpService.post(url, userData);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async updateBusinessProfile(userData: any) {
        const url = UrlService.updateBusinessProfileUrl();
        try {
            const response = await HttpService.post(url, userData);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async buyingRoom(id: any) {
        const url = UrlService.buyingRoom(id);
        try {
            const response = await HttpService.get(url);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async createBuyingRoom(id: any) {
        const url = UrlService.buyingRoom(id);
        try {
            const response = await HttpService.post(url, []);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async bidProgress(data: any) {
        const url = UrlService.bidProgressUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async getMessage(id: any, messageId: any) {
        const url = UrlService.getMessageUrl(id, messageId);
        try {
            const response = await HttpService.get(url);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async getDashboardStats() {
        const url = UrlService.getDashboardStatsUrl();
        try {
            const response = await HttpService.get(url);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async getChecklist(id) {
        const url = UrlService.getChecklistUrl(id);
        try {
            const response = await HttpService.get(url);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async editCheckList(params:any, id: any) {
        const url = UrlService.getChecklistUrl(id);
        try {
            const response = await HttpService.post(url, params);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async cancelDeal(params:any) {
        const url = UrlService.getCancelDealUrl();
        try {
            const response = await HttpService.post(url, params);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    // async downloadFile(id) {
    //     const url = UrlService.downloadFileUrl(id);
    //     try {
    //         const response = await HttpService.get(url);
    //         return response.data;
    //     } catch (error) {
    //         return error;
    //     }
    // }
    async downloadFile(id) {
        const url = UrlService.downloadFileUrl(id);
        try {
            const response = await HttpService.get(url);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    async getAllDocuments(id) {
        const url = UrlService.getAllDocumentsUrl(id);
        try {
            const response = await HttpService.get(url);
            return response.data;
        } catch (error) {
            return error;
        }
    }

    async downloadProgressFile(id:any, params:any) {
        const url = UrlService.downloadProgressFileUrl(id);
        try {
            const response = await HttpService.post(url, params);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async downloadPreApprovFile(params:any) {
        const url = UrlService.downloadPreApprovFileUrl();
        try {
            const response = await HttpService.post(url, params);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async validateAddress(street: string, city: string, state: string, zipcode: string) {
        const url = AddressService.validateAddressUrl(street, city, state, zipcode);
        try {
            const response = await axios.get(url);
            return response && response.data && response.data.length > 0 && !response.data[0].analysis.dpv_footnotes.includes("A1");
        } catch (error) {
            console.error("Not able to validate address");
        }
    }


    async getUserProfile(id:any) {
        const url = UrlService.getUserProfileUrl(id);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getBuyingroomStatus(id:BigInteger) {
        const url = UrlService.getBuyingroomStatusUrl(id);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getUserChatRooms() {
        const url = UrlService.getUserChatRoomsUrl();
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }
    
    async questionnaire(role_id, prop_id) {
        const url = UrlService.questionnaireUrl(role_id, prop_id);
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async submitFeedback(data: any) {
        const url = UrlService.submitFeedbackUrl();
        try {
            const response = await HttpService.post(url, data);
            return response.data;
        } catch (error) {
            console.error("Not able to change order of the todos");
        }
    }

    async closedDeals() {
        const url = UrlService.closedDealsUrl();
        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async getChatNotifications() {
        const url = UrlService.getChatNotificationsUrl();

        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }

    async updateChatNotifications(id) {
        const url = UrlService.getUpdateChatNotificationsUrl(id);

        try {
            const response = await HttpService.get(url);
            this.user = response.data;
            return response.data;
        } catch (error) {
            console.error("Not able to fetch the user");
        }
    }
    async submitUserFeedback(feedback) {
        const url = UrlService.sendUserFeedback();
        try {
            const response = await HttpService.post(url,feedback);
            return response.data;
        } catch (error) {
            console.error("Not able to send data");
        }
    }

    async getUserFeedbacks(user_id) {
        const url = UrlService.getUserFeedbacks()
        try {
            const response = await HttpService.post(url,user_id);
            return response.data;
        } catch (error) {
            console.error("Not able to get data");
        }
    }

    async updateNotificationsSetting(data) {
        const url = UrlService.updateNotificationsSettingURL()
        try {
            const response = await HttpService.post(url,data);
            return response.data;
        } catch (error) {
            console.error("Not able to get data");
        }
    }

    async getNotificationsSetting() {
        const url = UrlService.getNotificationsSettingUrl()
        try {
            const response = await HttpService.get(url);
            return response.data;
        } catch (error) {
            console.error("Not able to get data");
        }
    }

}

export default new UserService();