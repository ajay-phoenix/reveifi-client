// @ts-ignore
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from 'i18next-http-backend';
import common_gb from "./assets/lang/gb/common.json";
import common_en from "./assets/lang/en/common.json";
import common_se from "./assets/lang/Spanish/common.json";

i18next
    .use(Backend)
    .use(LanguageDetector)
    .init({
        interpolation: {
            escapeValue: false, // React already does escaping
            formatSeparator: ","
        },
        lng: localStorage.getItem("i18nextLng") ? localStorage.getItem("i18nextLng") : 'en',                              // language to use
        resources: {
            en: {
                translations: common_en               // 'common' is our custom namespace
            },
            gb: {
                translations: common_gb
            },
            se: {
                translations: common_se
            },
        },
        fallbackLng: "en",
        debug: false,
        ns: ["translations"],
        defaultNS: "translations",
        keySeparator: false,
        react: {
            wait: true
        }
    });

export default i18next;
