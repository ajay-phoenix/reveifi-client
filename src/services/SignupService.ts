import axios from "axios";
import UrlService from "./UrlService";
import CookieService from "./CookieService";

interface SignUPCredentials {
    name: string;
    last_name: string;
    email: string;
    cell_phone: string;
    password: string;
}

class SignupService {
    async signUpUser(signUPCredentials: SignUPCredentials) {
        try {
            const response = await axios.post(UrlService.signUpUrl(), signUPCredentials);
            return response.data;
        } catch (error) {
            console.error("Error", error.response);
            return false;
        }
    }
}

export default new SignupService();