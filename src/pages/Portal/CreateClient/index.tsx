import React from 'react';
import { FormBuilder, AbstractControl, Validators, FieldGroup, FieldControl } from "react-reactive-form";
import { Trans, useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import UserService from "../../../services/UserService";
import { RouteComponentProps } from "react-router-dom";
import { AdminTopNav, SideBar } from "../../../components/common/imports/navigations";

export function MyComponent({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <input className="form-control" placeholder={t(`Enter ${meta.label}`)} {...handler()} />
}

export function CheckboxComponent({ handler, meta }: any) {
    const { t, i18n } = useTranslation();
    return <>
        <input type="checkbox" className="lib-checkbox" id={meta.id} {...handler()}/>
        <label className="lib-checkboxlabel" htmlFor={meta.id}>{meta.label}</label>
    </>
}



const TextInput = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <MyComponent handler={handler} meta={meta} ></MyComponent>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
            <Trans>{hasError('pattern') && 'Mobile is not valid'}</Trans>
        </span>
    </div>
);

const CheckBox = ({ handler, touched, hasError, meta }: any) => (
    <div>
        <CheckboxComponent handler={handler} meta={meta} ></CheckboxComponent>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
        </span>
    </div>
);

const SelectInput = ({ handler, touched, hasError, meta }: any) => (
    <>
        <select {...handler()}>
            {meta.options.map((item, index) => (
                <option value={item.value}>{item.label}</option>
            ))}
        </select>
        <span className="dropdownicon"><img src="../images/nl-down-icon-white.png" /></span>
        <span className="help-block">
            <Trans>{touched && hasError("required") && `${meta.label} is required`}</Trans>
            <Trans>{hasError('validateState') && 'Your state is not currently reVerified'}</Trans>
        </span>
    </>
);

class CreateClient extends React.Component<RouteComponentProps, any>{
    constructor(props) {
        super(props);
        this.state = {
            loader: false,
            errorMsg: false,
            current_user: {},
            loading: true
        }

        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({ updateLanguage: true })
    }

    /* validateState = (AC: AbstractControl) => {
        let val = AC.get('countyState').value;
        if (val && val !== 'NJ') {
            AC.get('countyState').setErrors({ validateState: true });
        } else {
            return null;
        }
    }; */
    validateState = (AC: AbstractControl) => {
        let val = AC.get('countyState').value;
        if (val) {
            if(val !== 'NJ' && val !== 'NY'){
                AC.get('countyState').setErrors({ validateState: true });
            } else{
                return null;
            }
        } else {
            return null;
        }
    };
    

    validateCheckbox = (AC: AbstractControl) => {
        let val = AC.get('i_represent').value;
        if (!val) {
            AC.get('i_represent').setErrors({ validateState: true });
        } else {
            return null;
        }
    };

    singnUPForm = FormBuilder.group({
        name: ['', [Validators.required]],
        last_name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        countyState: ['', [Validators.required]],
        mobile_number: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        role_id: ['1'],
        //notifications_only: $('#notifications_only:checked').length
        notifications_only: 0
    }, {
        validators: [this.validateState],
    });


    async componentDidMount(){
        var current_user = await UserService.getCurrentUserProfile();
        this.setState({ current_user: current_user.userProfile, loading: false })
    }

    async handleFormSubmit(event: any) {
        event.preventDefault();
        if (!this.singnUPForm.get('i_represent').value) {
            toast.error('You must represent the client to add them to your account', {
                closeOnClick: true,
                pauseOnHover: true,
            });
            return false;
        }


        this.setState({ loader: true, errorMsg: false });
        this.singnUPForm.patchValue({ loader: true }); 
        //this.singnUPForm.patchValue({ notifications_only: $('#notifications_only:checked').length }); 
        this.singnUPForm.patchValue({ notifications_only: 0 }); 

        const postData = this.singnUPForm.value;
        const response = await UserService.createClient(postData);
        this.setState({ loader: false, errorMsg: false });
        if (response.status == 'failure') {
            for (let i = 0; i < response.message.email.length; i++) {
                toast.error(response.message.email[i], {
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            }

        } else if (response.status == 'fake_email') {
            toast.error(response.message, {
                closeOnClick: true,
                pauseOnHover: true,
            });
        } else if (response) {
            const data = {
                invitation: [this.singnUPForm.value.email],
                propId: 0,
                roleId: response.role_id,
            };
            const invitation = await UserService.sendInvitations(data);
            console.log('invitation',invitation)
            
            toast.success('Client created successfully', {
                closeOnClick: true,
                pauseOnHover: true,
            });
            
            window.location.href='/client-list';
        }
    }

    render(){
        return(
            <React.Fragment>
                <AdminTopNav handler={this.handler} />
                <SideBar handler={this.handler} />
                { this.state.loading ? 
                    <h2 className="text-center mt-5 pt-5">Please wait...</h2>
                : this.state.current_user.role_id=='2' ?
                    <FieldGroup control={this.singnUPForm} render={({ invalid, pristine, pending, meta }) => (
                        <section className="loginsection" id="signuppage">
                            <div className="loginpage">
                                <div className="login-form mx-auto">
                                    <h1><Trans>Create Client</Trans></h1>
                                    <div className="login-form-box">
                                        <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                                            
                                            <div className="sup-input-fld-box">
                                                <div className="sup-inputtextfld-box d-none">
                                                    <FieldControl name="role_id"
                                                        render={SelectInput} meta={{
                                                        label: "role_id",
                                                        options: [
                                                            { value: '1', label: 'Seller / Buyer' },
                                                            { value: '2', label: 'Realtor' },
                                                            { value: '3', label: 'Lender' }
                                                        ]
                                                    }} />
                                                </div>
                                                <div className="sup-inputtextfld-box">
                                                    <FieldControl name="name" render={TextInput} meta={{ label: "First name" }} />
                                                </div>
                                                <div className="sup-inputtextfld-box">
                                                    <FieldControl name="last_name" render={TextInput} meta={{ label: "Last name" }} />
                                                </div>
                                                <div className="sup-inputtextfld-box">
                                                    <FieldControl name="email" render={TextInput} meta={{ label: "Email" }} />
                                                </div>
                                                <div className="sup-inputtextfld-box">
                                                    <FieldControl name="mobile_number" render={TextInput} meta={{ label: "Phone number" }} />
                                                </div>
                                                <div className="sup-inputtextfld-box">
                                                    <div className="">
                                                        <FieldControl name="countyState"
                                                            render={SelectInput} meta={{
                                                                label: "State",
                                                                options: global['constStates']
                                                            }} />
                                                    </div>
                                                </div>
                                                <div className="sup-inputcheckfld-box w-100 mb-3">
                                                    <FieldControl name="i_represent" render={CheckBox} meta={{ label: "I confirm I represent this client", id: "i_represent" }}/>
                                                </div>
                                                {/* <div className="sup-inputcheckfld-box mb-3">
                                                    <input className='lib-checkbox' type='checkbox' id='notifications_only' value="true" />
                                                    <label className='lib-checkboxlabel' htmlFor='notifications_only'>
                                                        <Trans>Notifications only (Client will not login)</Trans>
                                                    </label>
                                                </div> */}


                                            </div>
                                            {/* <div className="row">
                                                <input type="hidden" name="id" id="role_id" />
                                            </div> */}
                                            <div className="row">
                                                {this.state['errorMsg'] ?
                                                    <div className="alert alert-danger" role="alert">
                                                        <Trans>The email account has already been used</Trans>
                                                    </div>
                                                    : null
                                                }
                                            </div>
                                            <div className="">
                                                {!this.state.loader ?
                                                    <button type="submit" className="lib-login-btn" disabled={invalid || pristine || pending}><Trans>Create Client</Trans></button>
                                                    :
                                                    <button className="lib-login-btn" type="button" disabled>
                                                        <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
                                                        <span className="sr-only"><Trans>Loading...</Trans></span>
                                                    </button>
                                                }
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )} />
                    : <h2 className="text-center mt-5 pt-5">You do not have permission to create a client</h2>
                }
            </React.Fragment>
        )
    }
}

export default CreateClient;