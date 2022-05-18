let apiDomain = "https://phpstack-440027-1506432.cloudwaysapps.com/";
if (process.env.NODE_ENV === "production") {
    apiDomain = "https://phpstack-440027-1506432.cloudwaysapps.com/";
} else {
    apiDomain = "http://localhost:8000/";
}

export const verifyAPI = `${apiDomain}v1/verify`