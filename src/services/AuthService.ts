import axios from "axios";
import UrlService from "./UrlService";
import CookieService from "./CookieService";

const expiresAt = 60 * 24;

interface Credentials {
  username: string;
  password: string;
}

interface forgotpasswordCredentials {
  email: string
}

interface resetpasswordCredentials {
  email: string
}


class AuthService {
  async doUserLogin(credentials: Credentials) {
    try {
      const response = await axios.post(UrlService.loginUrl(), credentials);
      return response.data;
    } catch (error) {
      console.error("Error", error.response);
      return false;
    }
  }

  async forgotpassword(credentials: forgotpasswordCredentials) {
    try {
      const response = await axios.post(UrlService.forgotpassword(), credentials);
      return response.data;
    } catch (error) {
      console.error("Error", error.response);
      return false;
    }
  }

  async resetpassword(credentials: resetpasswordCredentials) {
    try {
      const response = await axios.post(UrlService.resetpassword(), credentials);
      return response.data;
    } catch (error) {
      console.error("Error", error.response);
      return false;
    }
  }
  

  handleLoginSuccess(response: any, remember: boolean) {
    if (!remember) {
      const options = { path: "/" };
      CookieService.set("access_token", response.access_token, options);
      return true;
    }

    let date = new Date();
    date.setTime(date.getTime() + expiresAt * 60 * 1000);
    const options = { path: "/mobile-verification", expires: date };
    CookieService.set("access_token", response.access_token, options);
    return true;
  }


}

export default new AuthService();
