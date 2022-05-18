import React from "react";
import { Trans, useTranslation } from "react-i18next";

export function MyComponent({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input className="form-control" type="password" placeholder={t(`Enter ${meta.label}`)} {...handler()} />
}

const TextInputPassword = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <MyComponent handler={handler} meta={meta} ></MyComponent>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            {/* {touched && hasError("required") && `${meta.label} is required`} */}
        </span>
    </div>
);

export default TextInputPassword;
