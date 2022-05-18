import React, {Component} from 'react';
import {Link, RouteComponentProps} from 'react-router-dom';
import AdminTopNav from '../../../components/common/admintopnav';
import SideBar from '../../../components/common/sidebar';
import './_style.scss';
import {Trans} from 'react-i18next';
import UserService from '../../../services/UserService';
import {toast} from 'react-toastify';
import Thumbs from './thumbs/Thumbs';

import Skeleton from 'react-loading-skeleton';

class feedback extends Component<RouteComponentProps, any> {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            auth: true,
            data: [],
            userProfile: {},
            questions: [],
            values: [],
            role: 0,
            propId: 0,
            isSubmitted: false,
            message: '',
            lender: '',
            clients: [],
            userFeedback: [],
            currentUserId: null,
            isSelected: false,
        };
        this.handler = this.handler.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.setThumbsUp = this.setThumbsUp.bind(this);
        this.setThumbsDown = this.setThumbsDown.bind(this);
        this.sendFeedback = this.sendFeedback.bind(this);
    }

    handler() {
        this.setState({
            updateLanguage: true,
        });
    }

    async componentDidMount() {
        const propId = window.location.pathname.split('/').pop();
        const response = await UserService.buyingRoom(propId);
        const clientsList = response.property_bids[0];
        this.setState({currentUserId: clientsList.current_user.id});
        const userFeedbacks = await UserService.getUserFeedbacks({
            user_id: this.state.currentUserId,
            buying_room: propId
        });
        let userTypes = [
            'lender',
            'seller',
            'seller_realtor',
            'buyer_realtor',
            'buyer',
        ];
        let arr = [];

        Object.entries(clientsList)?.forEach((item: any) => {
            if (userTypes.includes(item[0]) && item[1] && item[1].name && item[1].id && item[1].id !== this.state.currentUserId)
                arr.push({
                    id: item[1].id,
                    role: item[0],
                    name: item[1].name,
                    thumbsUp: 0,
                });
        });

        this.setState({clients: arr});
        console.log(userFeedbacks.feedbacks.length, this.state.clients.length)
        if (userFeedbacks.feedbacks.length === this.state.clients.length) {
            this.setState({isSelected: false})
        }
        if (!response.status) {
            alert(response.error);
            this.setState({auth: false});
        }
        if (this.state.auth === true) {
            this.setState({propId});
            this.setState({data: response});
            let progress = this.state['data'].progress.filter(
                (i) => i.status == false
            );
            if (progress.length > 0) {
                this.setState({auth: false});
            }
            const user_profile = await UserService.getCurrentUserProfile();
            this.setState({userProfile: user_profile['userProfile']});
            let bid = this.state['data'].property_bids.filter((i) => i.status == 1);

            let directParty = bid.find(
                (x) =>
                    x.seller_id === this.state.userProfile.id ||
                    x.buyer_id === this.state.userProfile.id
            );
            let realtor = bid.find(
                (x) =>
                    x.seller_realtor_id === this.state.userProfile.id ||
                    x.buyer_realtor_id === this.state.userProfile.id
            );
            let lender = bid.find((x) => x.lender_id === this.state.userProfile.id);

            let role;
            if (directParty != undefined) {
                role = 1;
            } else if (realtor != undefined) {
                role = 2;
            } else if (lender != undefined) {
                role = 3;
            }
            this.setState({role});

            const questionnaire = await UserService.questionnaire(role, propId);
            if (questionnaire.success) {
                this.setState({questions: questionnaire.data.questions});
            } else {
                this.setState({message: questionnaire.message});
            }
            this.setState({loading: false});
        }
    }

    async handleSubmit(event) {
        this.setState({loading: true});
        event.preventDefault();
        const data = new FormData(event.target);
        const response = await UserService.submitFeedback(data);
        if (response.success != undefined && response.success) {
            this.setState({isSubmitted: true});
        }
        this.setState({loading: false});
    }

    createUI() {
        return this.state.questions.map((el, i) => (
            <div key={i}>
                <div className='row'>
                    <div className='col-md-12'>
                        <label>{el.question}</label>
                        <p>
                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name={`question_id[${el.id}]`}
                                    required
                                    id={`${el.id}`}
                                    value='1'
                                ></input>
                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    fill='currentColor'
                                    className='bi bi-hand-thumbs-down'
                                    viewBox='0 0 16 16'
                                >
                                    <path
                                        d='M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856 0 .289-.036.586-.113.856-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a9.877 9.877 0 0 1-.443-.05 9.364 9.364 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964l-.261.065zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a8.912 8.912 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581 0-.211-.027-.414-.075-.581-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.224 2.224 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.866.866 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1z'/>
                                </svg>
                            </label>

                            <label className='radio-inline'>
                                <input
                                    type='radio'
                                    name={`question_id[${el.id}]`}
                                    required
                                    id={`${el.id}`}
                                    value='3'
                                ></input>

                                <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    width='16'
                                    height='16'
                                    fill='currentColor'
                                    className='bi bi-hand-thumbs-up'
                                    viewBox='0 0 16 16'
                                >
                                    <path
                                        d='M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z'/>
                                </svg>
                            </label>
                        </p>
                    </div>
                </div>
            </div>
        ));
    }

    setThumbsUp(id: number, role: string) {
        this.setState((prevState) => ({
            ...prevState,
            clients: prevState.clients.map((u) => {
                if (u.role === role) {
                    u.thumbsUp = 1;
                }
                return u;
            }),
        }));
        const data = this.state.userFeedback.filter(item => item.role == role);
        const buyingRoomId = this.props.match.params['id'];
        if (data.length !== 0) {
            this.setState((prevState) => ({
                ...prevState,
                userFeedback: prevState.userFeedback.map((u) => {
                    if (u.role == role) {
                        u.thumbs = 1;
                    }
                    return u;
                }),
            }));
        } else {
            this.setState((prevState) => ({
                ...prevState,
                userFeedback: [
                    ...prevState.userFeedback,
                    {
                        user_id: this.state.currentUserId,
                        client_id: id,
                        role: role,
                        buying_room_id: +buyingRoomId,
                        thumbs: 1,
                    },
                ],
            }));
        }
    }

    setThumbsDown = (id: number, role: string) => {
        this.setState((prevState) => ({
            ...prevState,
            clients: prevState.clients.map((u) => {
                if (u.role === role) {
                    u.thumbsUp = -1;
                }
                return u;
            }),
        }));
        const buyingRoomId = this.props.match.params['id'];
        const data = this.state.userFeedback.filter(item => item.role == role);
        if (data.length !== 0) {
            this.setState((prevState) => ({
                ...prevState,
                userFeedback: prevState.userFeedback.map((u) => {
                    if (u.role == role) {
                        u.thumbs = -1;
                    }
                    return u;
                }),
            }));
        } else {
            this.setState((prevState) => ({
                ...prevState,
                userFeedback: [
                    ...prevState.userFeedback,
                    {
                        user_id: this.state.currentUserId,
                        client_id: id,
                        role: role,
                        buying_room_id: +buyingRoomId,
                        thumbs: -1,
                    },
                ],
            }));
        }
    };

    async sendFeedback() {
        const {clients, userFeedback} = this.state;
        console.log(clients, userFeedback);
        if (clients.length === userFeedback.length) {
            this.setState({isSelected: true});
            toast.success('Thank you for your feedback', {
                closeOnClick: true,
                pauseOnHover: true,
            });
            await UserService.submitUserFeedback(userFeedback);
            this.props.history.push('/closed-deals');
        } else {
            toast.error('Please make your feedback for all users', {
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
    }

    render() {
        const {clients, isSelected} = this.state;
        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>

                &nbsp;
                <div className='content-wrapper'>
                    <div className='row'>
                        <div className='container'>
                            <div className='row'>
                                <div className='col-md-5'>
                                    <div className='feedbackimg'>
                                        <img
                                            src='/images/emojees.jpg'
                                            className='img-responsive'
                                            alt='emojis'
                                        />
                                    </div>
                                </div>
                                <div className='col-md-7'>
                                    <div className='feedback-upper'>
                                        <h2><Trans>Feedback</Trans></h2>
                                    </div>
                                    {clients.map((item: any, i) => {
                                        return (
                                            <Thumbs
                                                key={i}
                                                id={item.id}
                                                thumbsUp={item.thumbsUp}
                                                role={item.role}
                                                name={item.name}
                                                setThumbsUp={this.setThumbsUp}
                                                setThumbsDown={this.setThumbsDown}
                                            />
                                        );
                                    })}
                                    <button onClick={this.sendFeedback} disabled={isSelected} className='feedback-send-button'>
                                    <Trans>Send Feedback</Trans>
                                    </button>
                                    {/*<div className='feedback-inner'>*/}
                                    {/*{this.state.loading ? (*/}
                                    {/*<>*/}
                                    {/*<div className='row'>*/}
                                    {/*<Skeleton count={6} circle={true} height={70}/>*/}
                                    {/*</div>*/}
                                    {/*<div className='row'>*/}
                                    {/*<Skeleton count={6} circle={true} height={70}/>*/}
                                    {/*</div>*/}
                                    {/*</>*/}
                                    {/*) : this.state.questions.length == 0 ? (*/}
                                    {/*<div className='alert alert-warning'>*/}
                                    {/*<p>*/}
                                    {/*{this.state.message}{' '}*/}
                                    {/*<Link to={'/buying-room/' + this.state.propId}>*/}
                                    {/*<Trans>Go back to Transaction table</Trans>*/}
                                    {/*</Link>*/}
                                    {/*</p>*/}
                                    {/*</div>*/}
                                    {/*) : !this.state.isSubmitted ? (*/}
                                    {/*<div>*/}
                                    {/*<p id='upperheading'>*/}
                                    {/*{' '}*/}
                                    {/*Please Provide Your Feedback Below:{' '}*/}
                                    {/*</p>*/}
                                    {/*<form onSubmit={this.handleSubmit} id='reused_form'>*/}
                                    {/*{this.createUI()}*/}
                                    {/*<div className='row'>*/}
                                    {/*<div className='col-sm-12 form-group'>*/}
                                    {/*<label>Comments:</label>*/}
                                    {/*<textarea*/}
                                    {/*name='feedback'*/}
                                    {/*id=''*/}
                                    {/*cols={30}*/}
                                    {/*rows={10}*/}
                                    {/*className='form-control'*/}
                                    {/*></textarea>*/}
                                    {/*<input*/}
                                    {/*type='hidden'*/}
                                    {/*name='role'*/}
                                    {/*value={this.state.role}*/}
                                    {/*/>*/}
                                    {/*<input*/}
                                    {/*type='hidden'*/}
                                    {/*name='answer_by'*/}
                                    {/*value={this.state.userProfile.id}*/}
                                    {/*/>*/}
                                    {/*<input*/}
                                    {/*type='hidden'*/}
                                    {/*name='buying_room_id'*/}
                                    {/*value={this.state.propId}*/}
                                    {/*/>*/}
                                    {/*</div>*/}
                                    {/*</div>*/}
                                    {/*<br/>*/}
                                    {/*<div className='row'>*/}
                                    {/*<div className='col-sm-12 form-group'>*/}
                                    {/*<input*/}
                                    {/*type='submit'*/}
                                    {/*value='Submit'*/}
                                    {/*className='btn btn-lg btn-warning btn-block'*/}
                                    {/*/>*/}
                                    {/*</div>*/}
                                    {/*</div>*/}
                                    {/*</form>*/}
                                    {/*</div>*/}
                                    {/*) : (*/}
                                    {/*'Thanks for your feedback'*/}
                                    {/*)}*/}
                                    {/*{}*/}
                                    {/*</div>*/}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default feedback;
