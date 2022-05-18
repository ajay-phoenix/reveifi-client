import React from "react";
import { Trans, useTranslation } from "react-i18next";

export function MyComponent({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input className="form-control" type={`Enter ${meta.type}`} id={`Enter ${meta.id}`} placeholder={t(`Enter ${meta.label}`)} {...handler()} />
}

const TextInput = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <MyComponent handler={handler} meta={meta} ></MyComponent>
        {/* <input className="form-control" type={`Enter ${meta.type}`} id={`Enter ${meta.id}`} placeholder={`Enter ${meta.label}`} {...handler()} /> */}
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </div>
);

export default TextInput;
