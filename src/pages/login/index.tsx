import React, { Component } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import {
    FormBuilder,
    FieldGroup,
    FieldControl,
    Validators,
} from 'react-reactive-form';

// import components here
import TopVan from '../../components/common/topnav';
import TextInput from '../../components/common/inputs/inputText';
import TextInputPassword from '../../components/common/inputs/inputPassword';
import AuthService from './../../services/AuthService';
import './_style.scss';
import UserService from '../../services/UserService';
import CookieService from '../../services/CookieService';
import { Trans } from 'react-i18next';
import { toast } from 'react-toastify';
import { bindActionCreators, compose } from 'redux';
import { verifyUserEmail } from './../../redux/verify-email/actions';
import { connect } from 'react-redux';

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            verifyUserEmail: verifyUserEmail,
        },
        dispatch
    );
}

type DispatchProperties = ReturnType<typeof mapDispatchToProps>;
type Properties = DispatchProperties & RouteComponentProps;

class Login extends Component<Properties, any> {
    constructor(props) {
        super(props);

        this.state = {
            loader: false,
            errorMsg: false,
            logintab: 2,
            AccountTypeSelected: false,
        };
        localStorage.setItem('type', 'Buyer');
    }

    readonly token = this.props.location.search
        .split(';')[0]
        .split('verify_token=')[1];

    async componentDidMount() {
        if (this.token) {
            UserService.verifyEmailAddress({ verify_token: this.token }).then(response => {
                if (response.status === 'success') {
                    toast.success(response.message, {
                        closeOnClick: true,
                        pauseOnHover: true,
                    });
                } else {
                    var message = response.message;
                    if (message === 'Verification link  invalid') {
                        message = 'Verification code not recognized';
                    }
                    toast.error(message, {
                        closeOnClick: true,
                        pauseOnHover: true,
                    });
                }
            })
            /* this.props.verifyUserEmail(this.token);
            toast.success('Your email is verified.', {
                closeOnClick: true,
                pauseOnHover: true,
            }); */
        }
    }

    loginForm = FormBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        userRole: 1,
    });

    async handleFormSubmit(event: any) {
        event.preventDefault();
        this.setState({ loader: true, errorMsg: false });
        this.loginForm.patchValue({ loader: true });

        const postData = {
            username: this.loginForm.value.email,
            password: this.loginForm.value.password,
        };
        const response = await AuthService.doUserLogin(postData);

        if (response) {
            if (response.status === 'failure') {

                var response_message = '';
                if (response.message === 'User does not exist') {
                    response_message = 'Please enter valid credentials';
                } else {
                    response_message = response.message;
                }

                toast.error(response_message, {
                    closeOnClick: true,
                    pauseOnHover: true,
                });
                this.setState({ loader: false });
                this.loginForm.patchValue({ loader: false });
            } else {
                AuthService.handleLoginSuccess(
                    response,
                    this.loginForm.value.isChecked
                );
                const postData = {
                    role_id: this.loginForm.value.userRole,
                };

                await UserService.updateUserRole(postData);
                CookieService.remove('role_id');
                const userProfile = await UserService.getCurrentUserProfile();

                let date = new Date();
                date.setTime(date.getTime() + 60 * 24 * 60 * 1000);
                const options = { path: '/', expires: date };
                CookieService.set(
                    'role_id',
                    userProfile['userProfile'].role_id,
                    options
                );
                CookieService.set('_id', userProfile['userProfile'].id, options);
                localStorage.setItem('name', userProfile['userProfile'].name);
                localStorage.setItem('last_name', userProfile['userProfile'].last_name);
                toast.success('You have successfully logged in.', {
                    closeOnClick: true,
                    pauseOnHover: true,
                });

                window.location.href = userProfile['userProfile'].mobile_verified == 0 ? '/mobile-verification' : '/dashboard';
            }
        } else {
            this.setState({ loader: false, errorMsg: true });
            this.loginForm.patchValue({ loader: true, errorMsg: true });
        }
    }

    selectDate(id) {
        // [count, setCount] = useGlobalState('userRole');
        this.loginForm.controls['userRole'].setValue(id);
        this.setState({ logintab: id });
        this.setState({ AccountTypeSelected: true });
    }

    render() {
        return (
            <React.Fragment>
                <TopVan></TopVan>
                <FieldGroup
                    control={this.loginForm}
                    render={({ invalid, pristine, pending, meta }) => (
                        <section className='loginsection' id='loginpage'>
                            <div className='loginpage'>
                                <div className='login-image'>
                                    <img
                                        src='/images/login.png'
                                        alt=''
                                        className='img-fluid'
                                    ></img>
                                </div>
                                <div className='login-form'>
                                    <h1>
                                        <Trans>Login</Trans>
                                    </h1>
                                    <div className='login-form-box'>
                                        {this.state.AccountTypeSelected == false && (
                                            <div className='lfb-account-type'>
                                                <h3>
                                                    <Trans>Choose account type</Trans>
                                                </h3>
                                                <ul className='login-account-type-list select-latl'>
                                                    <li className={this.state.logintab === 2 && 'active'}>
                                                        <a
                                                            onClick={() => this.selectDate(2)}
                                                            data-toggle='pill'
                                                            href='#home'
                                                            id='0'
                                                        >
                                                            <i className='fa fa-home'></i>
                                                            <span>
                                                                <Trans>Realtor</Trans>
                                                            </span>
                                                        </a>
                                                    </li>
                                                    <li className={this.state.logintab === 1 && 'active'}>
                                                        <a
                                                            onClick={() => this.selectDate(1)}
                                                            data-toggle='pill'
                                                            href='#menu1'
                                                            id='1'
                                                        >
                                                            <i className='fa fa-flag'></i>
                                                            <span>
                                                                <Trans>Seller / Buyer</Trans>
                                                            </span>
                                                        </a>
                                                    </li>
                                                    <li className={this.state.logintab === 3 && 'active'}>
                                                        <a
                                                            onClick={() => this.selectDate(3)}
                                                            data-toggle='pill'
                                                            href='#menu2'
                                                            id='2'
                                                        >
                                                            <i className='fa fa-credit-card'></i>
                                                            <span>
                                                                <Trans>Lender</Trans>
                                                            </span>
                                                        </a>
                                                    </li>
                                                </ul>
                                                <div className='lib-forget-signup-row marginbtm0'>
                                                    <span>
                                                        <Trans>No account?</Trans>
                                                        <Link to='/sign-up' className='signUp'>
                                                            <Trans>Sign up here</Trans>
                                                        </Link>
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        {this.state.AccountTypeSelected == true && (
                                            <div className='lfb-showhide'>
                                                <ul className='login-account-type-list'>
                                                    <li className={this.state.logintab === 2 && 'active'}>
                                                        <a
                                                            onClick={() => this.selectDate(2)}
                                                            data-toggle='pill'
                                                            href='#home'
                                                            id='0'
                                                        >
                                                            <i className='fa fa-home'></i>
                                                            <span>
                                                                <Trans>Realtor</Trans>
                                                            </span>
                                                        </a>
                                                    </li>
                                                    <li className={this.state.logintab === 1 && 'active'}>
                                                        <a
                                                            onClick={() => this.selectDate(1)}
                                                            data-toggle='pill'
                                                            href='#menu1'
                                                            id='1'
                                                        >
                                                            <i className='fa fa-flag'></i>
                                                            <span>
                                                                <Trans>Seller / Buyer</Trans>
                                                            </span>
                                                        </a>
                                                    </li>
                                                    <li className={this.state.logintab === 3 && 'active'}>
                                                        <a
                                                            onClick={() => this.selectDate(3)}
                                                            data-toggle='pill'
                                                            href='#menu2'
                                                            id='2'
                                                        >
                                                            <i className='fa fa-credit-card'></i>
                                                            <span>
                                                                <Trans>Lender</Trans>
                                                            </span>
                                                        </a>
                                                    </li>
                                                </ul>
                                                <form
                                                    noValidate
                                                    onSubmit={(event) => this.handleFormSubmit(event)}
                                                >
                                                    <div className='input-fld-box'>
                                                        <div className='lib-inputtextfld-box'>
                                                            <FieldControl
                                                                name='email'
                                                                render={TextInput}
                                                                meta={{
                                                                    label: 'Email',
                                                                    id: 'email',
                                                                    type: 'email',
                                                                }}
                                                            />
                                                        </div>
                                                        <div className='lib-inputtextfld-box'>
                                                            <FieldControl
                                                                name='password'
                                                                render={TextInputPassword}
                                                                meta={{ label: 'Password' }}
                                                            />
                                                        </div>
                                                        <div className='lib-inputcheckfld-box'>
                                                            <input
                                                                className='lib-checkbox'
                                                                type='checkbox'
                                                                checked
                                                                name='remember'
                                                                id='remember'
                                                            ></input>
                                                            <label
                                                                className='lib-checkboxlabel'
                                                                htmlFor='remember'
                                                            >
                                                                <Trans>Terms and Conditions</Trans>
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className=''>
                                                        {!this.state['loader'] ? (
                                                            <button
                                                                type='submit'
                                                                className='lib-login-btn'
                                                                disabled={invalid || pristine || pending}
                                                            >
                                                                <Trans>Login</Trans>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className='lib-login-btn'
                                                                type='button'
                                                                disabled
                                                            >
                                                                <span
                                                                    className='spinner-grow spinner-grow-sm'
                                                                    role='status'
                                                                    aria-hidden='true'
                                                                ></span>
                                                                <span className='sr-only'>
                                                                    <Trans>Loading...</Trans>
                                                                </span>
                                                            </button>
                                                        )}
                                                        {this.state['errorMsg'] ? (
                                                            <div className='alert alert-danger' role='alert'>
                                                                <Trans>Email or Password incorrect...!</Trans>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <div className='lib-forget-signup-row'>

                                                        <Link to='/forgot-password'>
                                                            <Trans>Forgot Your Password?</Trans>
                                                        </Link>

                                                        <span>
                                                            <Trans>No account?</Trans>
                                                            <Link to='/sign-up' className='signUp'>
                                                                <Trans>Sign up here</Trans>
                                                            </Link>
                                                        </span>
                                                    </div>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                />
            </React.Fragment>
        );
    }
}

export default compose(withRouter, connect(null, mapDispatchToProps))(Login);
