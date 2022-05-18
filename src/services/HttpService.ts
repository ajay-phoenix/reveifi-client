import axios from "axios";
import CookieService from "./CookieService";

class HttpService {
    async get(url: any) {
        const at = CookieService.get("access_token");
        const options = {
            headers: {
                Authorization: "Bearer " + at,
            },
        };
        try {
            const resp = await axios.get(url, options);
            if (resp.status === 401 || resp.status === 403) {
                console.log('in https', resp.status);
            }
            return resp;
        } catch (error) {
            console.error("Not able to fetch data", error);
        }
    }

    async post(url: any, data: any, options = null) {
        const at = CookieService.get("access_token");
        const postOptions = {
            headers: {
                Authorization: "Bearer " + at,
            },
        };
        const finalOptions = Object.assign(postOptions, options);
        try {
            return await axios.post(url, data, finalOptions);
        } catch (error) {
            console.error("Not able to fetch data", error);
            return error.response !== undefined ? error.response : error;
        }
    }
}

export default new HttpService();
