let addressApiDomain = "https://us-street.api.smartystreets.com/",
    authId = "b4351779-9a17-756f-b193-626ef75d29e6",
    token = "bW35JMzIFP0Jd89YVbu7",
    key = "34757511591136992";

class AddressService {
    static validateAddressUrl(street: string, city: string, state: string, zipcode: string) {
        return addressApiDomain + "street-address?key=" + key + 
            "&candidates=1&match=invalid&street=" + street + "&city=" + city + "&state=" + state + "&zipcode=" + zipcode;
    }

}
export default AddressService;