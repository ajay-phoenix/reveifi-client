import React, {Component} from "react";
import {Link, RouteComponentProps} from "react-router-dom";
import AdminTopNav from "../../../components/common/admintopnav";
import SideBar from "../../../components/common/sidebar";
import UserService from "../../../services/UserService";
import UrlService from "../../../services/UrlService";
import CookieService from "../../../services/CookieService";
import {toast} from 'react-toastify';
import {confirmAlert} from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import DatePicker from "react-datepicker";
import Slider from "react-slick";
import defaultProfileImage from "../../../assets/images/defaultImage.png";

import "react-datepicker/dist/react-datepicker.css";

import "./_style.scss";
import {
    FormBuilder,
    AbstractControl,
    Validators,
    FieldGroup,
    FieldControl
} from "react-reactive-form";
import moment from "moment";
import {Redirect} from "react-router-dom";
import {Trans} from "react-i18next";
import {Loader} from "react-full-page-loader-overlay";
import {isBuffer} from "util";
import ScrollableFeed from 'react-scrollable-feed'
import $ from 'jquery';

const DateInput = ({handler, touched, hasError, meta}: any) => (
    <div>
        <input className="form-control" type="date" placeholder={`Enter ${meta.label}`} {...handler()} />
        <span className="help-block">
            {(touched && hasError('mismatch')) && "Please select future date!"}
        </span>
    </div>
);

const TextInput = ({handler, touched, hasError, meta}: any) => (
    <div>
        <input required className="form-control" type="text" placeholder={`Type message here...`} {...handler()} />
        <span className="help-block">
            {touched && hasError("required") && `${meta.label} is required`}
            <Trans>{hasError('email') && 'Email is not valid'}</Trans>
        </span>
    </div>
);

const lendersData = [
    {
        lable: 'Select Lender',
        value: 0
    }
];
var recForm;
const role_id = CookieService.get('role_id');
let chatRoom;
var interval: any;

let sliderRef = null;

function SampleNextArrow(props) {
    const {NextArrow, onClick} = props;
    return (
        <div className="next-steps" onClick={onClick}>
            <span>
                <Trans>Next Step</Trans>
            </span>
            <img src="../images/NextStep.png"/>
        </div>
    );
}

function SamplePrevArrow(props) {
    const {PrevArrow, onClick} = props;
    return (
        <div className="prev-steps" onClick={onClick}>
            <img src="../images/PrevStep.png"/>
            <span>
                <Trans>Previous Steps</Trans>
            </span>
        </div>
    );
}

class BidDetail3 extends Component<{}, any> {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            userProfile: {},
            loading: true,
            error: false,
            errorMessage: '',
            chatRoom: {},
            chatId: null,
            checkList: {},
            msg: '',
            cancelDeal: false,
            documents: {},
            auth: true,
            progressLoading: false,
            seller: {},
            datePicker: true,
            selectedDate: '',
            showstatus: false,
            stateshowbuyingroom: false,
            stateofferlist: false,
            statechecklist: false,
            statestatuslist: false,
            stateBidDetails: false,
            buyingroomList: [],
            buyingroomId: 0,
            image_path: null,
        };
        this.toggledatePicker = this.toggledatePicker.bind(this)
        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }

    toggledatePicker() {
        if (this.state.datePicker === true) {
            this.setState({datePicker: false})
            recForm.patchValue({
                datePicker: false
            });
        } else {
            this.setState({datePicker: true})
            recForm.patchValue({
                datePicker: true
            });
        }
    }

    async componentDidMount() {
        const propId = window.location.pathname.split("/").pop();
        const image_path = await UrlService.imagesPath();
        this.setState({ image_path:image_path })
        this.resolve(propId)
    }

    async resolve(propId) {
        this.setState({loading: true});
        this.setState({stateshowbuyingroom: false})
        const response = await UserService.buyingRoom(propId);
        if (response && !response.status) {
            alert(response.error);
            this.setState({auth: false});
        }
        if (this.state.auth === true) {
            this.setState({data: response || null});
            this.setState({buyingroomId: response && response.id});
            if (response && response.chat) {
                this.setState({chatId: this.state['data'].chat.id});
            }
            let progress = response && response.progress.filter(i => i.status == false)
            console.log('progress',progress)
            //Set close Date       //'Confirm close date'   // 'Confirm appraisal date or suggest alternative'
            if (progress && progress.length > 0 && (progress[0].id == 16 || progress[0].id == 18 || progress[0].id == 10)) {
                this.setState({datePicker: false});
            }
            //'Confirm inspection Date or suggest alternative', //'Confirm appraisal date or suggest alternative'
            if (progress && progress.length > 0 && (progress[0].id == 7 || progress[0].id == 10)) {
                this.setState({datePicker: false});
            }
            let bid = response && response.property_bids.filter(i => i.status == 1);
            let seller_id = bid && bid[0].seller_id;
            const seller_profile = await UserService.getUserProfile(seller_id);
            this.setState({seller: seller_profile});
            const user_profile = await UserService.getCurrentUserProfile();
            this.setState({userProfile: user_profile['userProfile']});
            try {
                const buyingRoomListResponse = await UserService.getAllBuyingRooms();
                if (buyingRoomListResponse && buyingRoomListResponse.success) {
                    this.setState({buyingroomList: buyingRoomListResponse.data});
                }
            } catch (error) {
                toast.error(error);
            }

            try {
                const chatRoomResponse = this.state.chatId ? await UserService.getChatRoom(this.state.chatId) : null;
                const checkListResponse = await UserService.getChecklist(propId);
                const bidDocumentResponse = await UserService.getAllDocuments(propId);
                if (bidDocumentResponse.success) {
                    this.setState({documents: bidDocumentResponse.data});
                }

                if (checkListResponse.success) {
                    this.setState({check_list: checkListResponse.data.check_list});
                }
                this.setState({chatRoom: chatRoomResponse});
            } catch (error) {
                toast.error(error);
            }

            
            console.log('here! before the if condition')
            if (progress && progress.length > 0) {
                console.log('here in the if condition')
                if (progress[0].date && !progress[0].file_upload) {
                    //"Inspection Date"
                    if (progress[0].id == 6 && progress[0].skip != undefined) {
                        console.log('show only date if condition')
                        recForm = FormBuilder.group({
                            date: ["", Validators.required],
                        });
                    } else {
                        console.log('show only date else condition')
                        recForm = FormBuilder.group({
                            date: ["", Validators.required],
                        });
                    }
                } else if (progress[0].file_upload && !progress[0].date) {
                    console.log('show only file upload')
                    recForm = FormBuilder.group({
                        fileSource: ["", Validators.required],
                    });
                } else {
                    console.log('show both inputs')
                    recForm = FormBuilder.group({
                        date: ["", Validators.required],
                        fileSource: ["", Validators.required],
                    });
                }
            }

            if(recForm){
                recForm.patchValue({
                    fileSource: ''
                });
            }
           
            this.setState({loading: false});
            interval = setInterval(() => this.getMessages(), 3500);
        }
    }

    componentWillUnmount() {
        clearInterval(interval);
    }

    onFileChange(event) {
        if (event.target.files && event.target.files.length) {
            const file = event.target.files[0];

            var allowed_mimes = [
                'image/png',
                'image/jpeg',
                'image/jpg',
                'image/bmp',
                'image/webp',
                'image/gif',
                'application/msword', // Microsoft Word (.doc)
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Microsoft Word (.docx)
                'application/vnd.ms-excel', // Microsoft Excel (.xls)
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Microsoft Excel (.xlsx)
                'application/pdf', // PDF (.pdf)
                'text/csv', // Comma-separated values (.csv)
                'text/plain', // Text (.txt)
            ];
            var isAllowed = allowed_mimes.filter(i => i == file.type);

            //if (isAllowed.length > 0) {
                recForm.patchValue({
                    fileSource: file
                });
            /* } else {
                toast.error('Invalid file type. File removed');
                this.chatForm.patchValue({
                    fileSource: ''
                });
                const file = event.target.value = '';
            } */
        } else{
            this.chatForm.patchValue({
                fileSource: ''
            });
        }
    }

    validateDate = (value: Date) => {
        if (value) {
            this.setState({selectedDate: value});
            recForm.patchValue({
                date: value
            });
        } else {
            toast.error('Please select date');
        }
    };

    async createChat() {
        const formData = await this.prepareChatData();
        try {
            const response = await UserService.sendMessage(formData, this.state.chatRoom.id);
            if (typeof response.id !== 'undefined') {
                chatRoom.conversations.push(response);
                this.setState({msg: ''});
                // alert('success');
            } else {
                toast.error("Something went wrong ! Unable to send message.");
            }
        } catch (error) {
            toast.error("Something went wrong ! Unable to send message.");
        }
    }

    messageThread = () => {
        if (this.state.chatRoom && this.state.chatRoom.conversations && this.state.chatRoom.conversations.length > 0) {
            return this.state.chatRoom.conversations.map((chat, i) => {
                var bg = '';
                if (chat.user_id == this.state['data'].property_bids[0].seller_id) {
                    bg = 'seller_msg';
                } else if (chat.user_id == this.state['data'].property_bids[0].buyer_id) {
                    bg = 'buyer_msg';
                } else if (chat.user_id == this.state['data'].property_bids[0].lender_id) {
                    bg = 'lender_msg';
                } else if (chat.user_id == this.state['data'].property_bids[0].buyer_realtor_id) {
                    bg = 'buyer_realtor_msg'
                } else if (chat.user_id == this.state['data'].property_bids[0].seller_realtor_id) {
                    bg = 'seller_realtor_msg';
                }
                return (
                    /* (chat.user_id == this.state.userProfile.id) */
                    (bg === 'seller_msg' || bg === 'seller_realtor_msg') ?
                        <div className="detail-desc-para" id="inner-detil">
                            <img src={chat.user.avatar ? this.state.image_path+'/'+chat.user.avatar :defaultProfileImage} alt="" style={{"height": "50px"}}></img>
                            <p className={bg}>
                                {chat.message}
                                <br/>
                                {(chat.attachment) ?
                                    <Link to="#" onClick={() => this.downloadFile(chat.id)}>Click here to view attachment</Link>
                                : null}
                                <span>from: {chat.user?.name}</span>
                                <span>{moment(chat.updated_at).format('DD-MM-YY hh:mm A')}</span>
                            </p>
                        </div>
                        :
                        <div className="detail-desc-para" id="detail-bottom">
                            <p className={bg}>
                                {chat.message}
                                <br/>
                                {(chat.attachment) ?
                                    <Link to="#" onClick={() => this.downloadFile(chat.id)}>Click here to view attachment</Link>
                                : null}
                                <span>from: {chat.user?.name}</span>
                                <span>{moment(chat.user.updated_at).format('DD-MM-YY hh:mm A')}</span>
                            </p>
                            <img src={chat.user.avatar ? this.state.image_path+'/'+chat.user.avatar : defaultProfileImage} alt="" style={{"height": "50px", "borderRadius": "50%", "width":"50px"}}></img>
                        </div>
                )
            })
        } else {
            return '';
        }
    }

    getMessages = async () => {
        let message_id = 0
        if (chatRoom && chatRoom.conversations && chatRoom.conversations.length > 0) {
            message_id = chatRoom.conversations[chatRoom.conversations.length - 1].id;
        }
        try {
            if (this.state.chatRoom) {
                const response = await UserService.getMessage(this.state.chatRoom.id, message_id);
                if (response.status != false && response.length != 0 && typeof response[0].id !== 'undefined' && response.status != false) {
                    let chat = this.state.chatRoom;
                    let conversations = [...this.state.chatRoom.conversations]
                    conversations.push(response[0]);
                    chat.conversations = conversations;
                    this.setState({chatRoom: chat});
                }
            }
        } catch (error) {
            toast.error(error);
        }
    }

    chatForm = FormBuilder.group({
        message: ['', Validators.required],
        fileSource: []
    });

    async prepareChatData() {
        const formData = new FormData();

        formData.append('message', this.chatForm.get('message').value);
        if (this.chatForm.get('message').value != '') {
            if (typeof this.chatForm.get('fileSource').value != 'undefined') {
                formData.append('attachment', this.chatForm.get('fileSource').value);
            }
            return formData;
        } else {
            return false;
        }
    }

    async handleChatSubmit(event: any) {
        event.preventDefault();
        const formData = await this.prepareChatData();
        if (!formData) {
            toast.error('Please type mesage....');
            return;
        }
        try {
            const response = await UserService.sendMessage(formData, this.state.chatRoom.id);
            if (typeof response.id !== 'undefined') {
                chatRoom.conversations.push(response);
                this.setState({msg: ''});
                this.chatForm.patchValue({
                    message: '',
                    fileSource: ''
                });
                $('#chat-attachment').val('')
            } else {
                toast.error("Something went wrong ! Unable to send message.");
            }
        } catch (error) {
            toast.error("Something went wrong ! Unable to send message.");
        }
    }

    onChatFileChange(event) {
        if (event.target.files && event.target.files.length) {
            const file = event.target.files[0];
            var allowed_mimes = [
                'image/png',
                'image/jpeg',
                'image/jpg',
                'image/bmp',
                'image/webp',
                'image/gif',
                'application/msword', // Microsoft Word (.doc)
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Microsoft Word (.docx)
                'application/vnd.ms-excel', // Microsoft Excel (.xls)
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Microsoft Excel (.xlsx)
                'application/pdf', // PDF (.pdf)
                'text/csv', // Comma-separated values (.csv)
                'text/plain', // Text (.txt)
            ];
            var isAllowed = allowed_mimes.filter(i => i == file.type);
            if (isAllowed.length > 0) {
                this.chatForm.patchValue({
                    fileSource: file
                });
                //event.target.value = '';
            } else {
                toast.error('Invalid file type. File removed');
                this.chatForm.patchValue({
                    fileSource: ''
                });
                event.target.value = '';
            }

        }
    }

    async prepareData() {
        let progress = this.state['data'].progress.filter(i => i.status == false)
        const formData = new FormData();
        const propId = window.location.pathname.split("/").pop();
        const el = document.getElementsByName('confirm');

        if (progress.length > 0 && progress[0].date && !progress[0].file_upload) {
            if (!this.state.datePicker || (el.length > 0)) {
                let completedProgress;
                //'Confirm close date'
                if (progress.length > 0 && progress[0].id == 18) {
                    //"Set close Date"
                    completedProgress = this.state['data'].progress.filter(i => i.id == 16 && i.status);
                } else {
                    completedProgress = this.state['data'].progress.filter(i => i.status == true)
                }

                formData.append('date', completedProgress[completedProgress.length - 1].value);
            } else {
                var formatted_date = moment(recForm.get('date').value).format('YYYY-MM-DD');
                formData.append('date', formatted_date);
            }
        } else if (progress[0].file_upload && !progress[0].date) {
            if(recForm.get('fileSource')?.value.size > 25000000){
                return toast.error('Max file size is 25 MB')
            }
            formData.append('file', recForm.get('fileSource')?.value);
        } else {
            var formatted_date = moment(recForm.get('date').value).format('YYYY-MM-DD');
            formData.append('date', formatted_date);

            if(recForm.get('fileSource')?.value.size > 25000000){
                return toast.error('Max file size is 25 MB')
            }
            formData.append('file', recForm.get('fileSource')?.value);
        }
        

        if(recForm.get('fileSource')){
            recForm.patchValue({
                fileSource: ''
            });
        }
        
        formData.append('prop_id', propId);
        return formData;
    }

    async handleFormSubmit(event: any) {
        event.preventDefault();
        this.setState({loading: true});

        const formData = await this.prepareData();

        const response = await UserService.bidProgress(formData);
        if (typeof response.id !== "undefined") {
            //this.setState({data: response, loading: false});
            this.setState({data: response});
            toast.success('Progress made.');
            this.setState({loading: false});

            let progress = this.state['data'].progress.filter(i => i.status == false);
            // Refresh page for showing whole fields where fields are not showing
            if(progress){
                if(progress[0].id==8 || progress[0].id==11 || progress[0].id==17 || progress[0].id==19){
                    window.location.reload();
                }
            }
            //window.location.reload();

            if (progress.lengh > 0) {
                if (progress[0].date && !progress[0].file_upload) {
                    recForm = FormBuilder.group({
                        date: ["", Validators.required],
                    });
                } else if (progress[0].file_upload && !progress[0].date) {
                    recForm = FormBuilder.group({
                        fileSource: ["", Validators.required],
                    });
                } else {
                    recForm = FormBuilder.group({
                        date: ["", Validators.required],
                        fileSource: ["", Validators.required],
                    });
                }
            }

        } else {
            this.setState({loading: false});
            if(response.error?.date){
                toast.error(response.error.date[0]);
            } else if(response.error?.file){
                toast.error(response.error.file[0]);
            } else{
                toast.error(response.error);
            }
            return;
        }
    }

    async downloadFile(id) {
        try {
            const response = await UserService.downloadFile(id);
            const link = document.createElement('a');
            link.href = response;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            toast.error('Something went wrong.');
        }
    }

    async downloadProgressFile(module) {
        try {
            const propId = window.location.pathname.split("/").pop();

            const formData = new FormData();
            formData.append('module', module);

            const response = await UserService.downloadProgressFile(propId, formData);
            const link = document.createElement('a');
            link.href = response;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            toast.error('Something went wrong.');
        }
    }

    async prepareCheckListData(status, name) {
        const formData = new FormData();
        formData.append('status', status);
        formData.append('name', name);
        return formData;
    }

    async handleCheckList(name, event: any) {
        const propId = window.location.pathname.split("/").pop();
        const status = (event.currentTarget.checked)

        const formData = await this.prepareCheckListData(status, name);
        const response = await UserService.editCheckList(formData, propId);

        if (response.success) {
            this.setState({check_list: response.data});
        } else {
            toast.error(response.error);
        }
    }

    submit = () => {
        confirmAlert({
            title: 'Confirm to cancel',
            message: 'Are you sure to cancel this deal?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => this.cancelDeal()
                },
                {
                    label: 'No',
                    onClick: () => null
                }
            ]
        });
    };

    cancelDeal = () => {
        const propId = window.location.pathname.split("/").pop();
        this.setState({cancelDeal: true});
    }

    showbuyingroom = () => {
        if (this.state.stateshowbuyingroom == true) {
            this.setState({stateshowbuyingroom: false})

        } else {
            this.setState({stateshowbuyingroom: true})
        }
    }

    offerlist = () => {
        if (this.state.stateofferlist == true) {
            this.setState({stateofferlist: false})
        } else {
            this.setState({stateofferlist: true})
        }
    }

    checklist = () => {
        if (this.state.statechecklist == true) {
            this.setState({statechecklist: false})
        } else {
            this.setState({statechecklist: true})
        }
    }

    statuslist = () => {
        if (this.state.statestatuslist == true) {
            this.setState({statestatuslist: false})
        } else {
            this.setState({statestatuslist: true})
        }
    }
    BidDetails = () => {
        if (this.state.stateBidDetails == true) {
            this.setState({stateBidDetails: false})
        } else {
            this.setState({stateBidDetails: true})
        }
    }

    changeRoom = (id) => {
        this.setState({buyingroomId: id});
    }

    render() {
        var settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 5,
            slidesToScroll: 1,
            nextArrow: <SampleNextArrow/>,
            prevArrow: <SamplePrevArrow/>
        };
        if (this.state.auth === false) {
            return <Redirect to={`/dashboard`}/>
        }
        if (this.state.loading) {
            return <Loader show={true} centerBorder={'#97d8e7'} fillIn={true}/>
        }
        if (this.state.cancelDeal) {
            return <Redirect to={`/cancel-deal/${this.state['data'].id}`}/>
        }

        if (this.state.data && this.state.buyingroomId !== this.state.data.id) {
            this.resolve(this.state.buyingroomId)
            return <Redirect to={`/buying-room/${this.state.buyingroomId}`}/>
        }
        const data = this.state['data'];
        let progress = data && data.progress.filter(i => i.status == false)

        chatRoom = this.state.chatRoom
        let completedProgress = data && data.progress.filter(i => i.status == true)
        //'Initial Contract'
        let closed_date = (completedProgress && completedProgress.length > 0 && completedProgress[0].id == 0) ? completedProgress[0].value : null;
        //"Set close Date"
        let confirm_close_date = data && data.progress.filter(i => i.id == 16 && i.status);

        if (confirm_close_date && confirm_close_date.length > 0 && confirm_close_date[0].suggest != null && confirm_close_date[0].suggest != undefined) {
            closed_date = confirm_close_date[0].suggest
        } else if (confirm_close_date && confirm_close_date.length) {
            closed_date = confirm_close_date[0].value
        }
        //'Inspection Date'
        let confirm_inspection_date = data && data.progress.filter(i => i.id == 6);

        if (confirm_inspection_date && confirm_inspection_date.length > 0) {
            confirm_inspection_date = confirm_inspection_date[0].value
        }

        let accepted_bid = data && data.property_bids.filter(i => i.status == 1);

        let attachments = [];
        if (chatRoom && typeof chatRoom.conversations != null && typeof chatRoom.conversations != 'undefined' && chatRoom.conversations.length > 0) {
            attachments = chatRoom.conversations.filter(i => {
                return (typeof i.attachment_type != null && i.attachment_type != null)
            });
        }

        let checkList = this.state.check_list;
        let isSeller = false;
        let isBuyer = false;
        let isSellerRealtor = false;
        let isBuyerRealtor = false;
        let isLender = false;
        if (accepted_bid && (this.state.userProfile.id == accepted_bid[0].seller_id)) {
            isSeller = true;
        }
        if (accepted_bid && (this.state.userProfile.id == accepted_bid[0].buyer_id)) {
            isBuyer = true;
        }
        if (accepted_bid && (this.state.userProfile.id == accepted_bid[0].seller_realtor_id)) {
            isSellerRealtor = true;
        }
        if (accepted_bid && (this.state.userProfile.id == accepted_bid[0].buyer_realtor_id)) {
            isBuyerRealtor = true;
        }
        if (accepted_bid && (this.state.userProfile.id == accepted_bid[0].lender_id)) {
            isLender = true;
        }

        const priceSplitter = (number) => (number && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));

        const activeSliderIndex = data && data.progress.findIndex((p, index) => (!p.status && index === 0) || (index > 0 && !p.status && data.progress[index - 1].status))
        setTimeout(() => {
            if (sliderRef)
                sliderRef.slickGoTo(activeSliderIndex);
        });

        return (
            <React.Fragment>
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                {!data && <div className="record-not-found">No Record Found</div>}
                {data && <section className="section">
                    <div className="bid-details-page">
                        <div className="bid-header-image-box">
                            <img src="../images/Mask Group 1.png"/>
                            <div className="bid-header-dropdown-row">
                                <div className="bid-header-dropdown-box " onClick={this.showbuyingroom}>
                                    <span><Trans>Transaction table</Trans> - {data.title}</span>
                                    <img className={"" + (this.state.stateshowbuyingroom ? 'rotate' : 'norotate')} src="../images/ionic-ios-arrow-down.png"/>
                                </div>
                            </div>
                            <div className="property-name-address-price">
                                <div className="pnap-property-name-address-box">
                                    <h3>{data.title}</h3>
                                    <span>{data.address}, {data.city}, {data.state}</span>
                                </div>
                                <div className="pnap-price-box">
                                    <p><span>$</span>{priceSplitter(accepted_bid[0].offer_price)}</p>
                                    <b><Trans>Contract Price</Trans></b>
                                </div>
                            </div>
                            <div className="bid-header-transaction-box">
                                <b><Trans>TransactionID</Trans>:</b><span>{btoa(data.title).replace(/={1,2}$/, '')}</span>
                            </div>
                        </div>
                        {(this.state.stateshowbuyingroom == true) && (
                            <div className="bid-header-dropdown-value-box">
                                <div className="bidhdv-title">
                                    <Trans>Transaction table List</Trans>
                                </div>
                                <ul className="bidhdv-list">
                                    {(this.state.buyingroomList.length != 0) ?
                                        this.state.buyingroomList.map(room => {
                                            return (
                                                <li>
                                                    <div className="bidhdv-list-row">
                                                        <div className="bidhdv-img"></div>
                                                            <div className="bidhdv-content">
                                                                <div className="bidhdvc-title">{room.title}</div>
                                                                <div className="bidhdv-dec">{room.address}, {room.city}, {room.state}</div>
                                                                <div className="bidhdv-transaction">
                                                                    <b><Trans>Transaction ID</Trans></b>
                                                                    <span>{btoa(room.title).replace(/={1,2}$/, '')}</span>
                                                                </div>
                                                            </div>
                                                            <a className="bidhdv-buton"
                                                               onClick={() => this.changeRoom(room.id)}>
                                                                <Trans>View Transaction table</Trans>
                                                            </a>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        : null
                                    }
                                    {/* <li>
                                        <div className="bidhdv-list-row">
                                            <div className="bidhdv-img"></div>
                                            <div className="bidhdv-content">
                                                <div className="bidhdvc-title">Property Nickname</div>
                                                <div className="bidhdv-dec">Property Address</div>
                                                <div className="bidhdv-transaction">
                                                    <b><Trans>Transaction ID</Trans></b>
                                                    <span>12345678909876y</span>
                                                </div>
                                            </div>
                                            <a className="bidhdv-buton">
                                                View Buying Room
                                            </a>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="bidhdv-list-row">
                                            <div className="bidhdv-img"></div>
                                            <div className="bidhdv-content">
                                                <div className="bidhdvc-title">Property Nickname</div>
                                                <div className="bidhdv-dec">Property Address</div>
                                                <div className="bidhdv-transaction">
                                                    <b><Trans>Transaction ID</Trans></b>
                                                    <span>12345678909876y</span>
                                                </div>
                                            </div>
                                            <a className="bidhdv-buton">
                                                View Buying Room
                                            </a>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="bidhdv-list-row">
                                            <div className="bidhdv-img"></div>
                                            <div className="bidhdv-content">
                                                <div className="bidhdvc-title">Property Nickname</div>
                                                <div className="bidhdv-dec">Property Address</div>
                                                <div className="bidhdv-transaction">
                                                    <b><Trans>Transaction ID</Trans></b>
                                                    <span>12345678909876y</span>
                                                </div>
                                            </div>
                                            <a className="bidhdv-buton">
                                                View Buying Room
                                            </a>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="bidhdv-list-row">
                                            <div className="bidhdv-img"></div>
                                            <div className="bidhdv-content">
                                                <div className="bidhdvc-title">Property Nickname</div>
                                                <div className="bidhdv-dec">Property Address</div>
                                                <div className="bidhdv-transaction">
                                                    <b><Trans>Transaction ID</Trans></b>
                                                    <span>12345678909876y</span>
                                                </div>
                                            </div>
                                            <a className="bidhdv-buton">
                                                View Buying Room
                                            </a>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="bidhdv-list-row">
                                            <div className="bidhdv-img"></div>
                                            <div className="bidhdv-content">
                                                <div className="bidhdvc-title">Property Nickname</div>
                                                <div className="bidhdv-dec">Property Address</div>
                                                <div className="bidhdv-transaction">
                                                    <b><Trans>Transaction ID</Trans></b>
                                                    <span>12345678909876y</span>
                                                </div>
                                            </div>
                                            <a className="bidhdv-buton">
                                                View Buying Room
                                            </a>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="bidhdv-list-row">
                                            <div className="bidhdv-img"></div>
                                            <div className="bidhdv-content">
                                                <div className="bidhdvc-title">Property Nickname</div>
                                                <div className="bidhdv-dec">Property Address</div>
                                                <div className="bidhdv-transaction">
                                                    <b><Trans>Transaction ID</Trans></b>
                                                    <span>12345678909876y</span>
                                                </div>
                                            </div>
                                            <a className="bidhdv-buton">
                                                View Buying Room
                                            </a>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="bidhdv-list-row">
                                            <div className="bidhdv-img"></div>
                                            <div className="bidhdv-content">
                                                <div className="bidhdvc-title">Property Nickname</div>
                                                <div className="bidhdv-dec">Property Address</div>
                                                <div className="bidhdv-transaction">
                                                    <b><Trans>Transaction ID</Trans></b>
                                                    <span>12345678909876y</span>
                                                </div>
                                            </div>
                                            <a className="bidhdv-buton">
                                                View Buying Room
                                            </a>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="bidhdv-list-row">
                                            <div className="bidhdv-img"></div>
                                            <div className="bidhdv-content">
                                                <div className="bidhdvc-title">Property Nickname</div>
                                                <div className="bidhdv-dec">Property Address</div>
                                                <div className="bidhdv-transaction">
                                                    <b><Trans>Transaction ID</Trans></b>
                                                    <span>12345678909876y</span>
                                                </div>
                                            </div>
                                            <a className="bidhdv-buton">
                                                View Buying Room
                                            </a>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="bidhdv-list-row">
                                            <div className="bidhdv-img"></div>
                                            <div className="bidhdv-content">
                                                <div className="bidhdvc-title">Property Nickname</div>
                                                <div className="bidhdv-dec">Property Address</div>
                                                <div className="bidhdv-transaction">
                                                    <b><Trans>Transaction ID</Trans></b>
                                                    <span>12345678909876y</span>
                                                </div>
                                            </div>
                                            <a className="bidhdv-buton">
                                                View Buying Room
                                            </a>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="bidhdv-list-row">
                                            <div className="bidhdv-img"></div>
                                            <div className="bidhdv-content">
                                                <div className="bidhdvc-title">Property Nickname</div>
                                                <div className="bidhdv-dec">Property Address</div>
                                                <div className="bidhdv-transaction">
                                                    <b><Trans>Transaction ID</Trans></b>
                                                    <span>12345678909876y</span>
                                                </div>
                                            </div>
                                            <a className="bidhdv-buton">
                                                View Buying Room
                                            </a>
                                        </div>
                                    </li> */}
                                </ul>
                            </div>
                        )}
                        <div className="bid-details-sort-dot-row">
                            <div className="bid-details-button-box" onClick={this.BidDetails}>
                                <span><Trans>Bid Details</Trans></span>
                                <img src="../images/biddetail-arrow.png"/>
                            </div>
                            <div className="bid-sort-3dot-btn-box">
                                <div className="bid-sort-icon-list" onClick={this.checklist}>
                                    <img src="../images/sort-icon.png"/>
                                </div>
                                {
                                    (this.state.data.property_bids[0].buyer_id == this.state.userProfile.id || this.state.data.property_bids[0].seller_id == this.state.userProfile.id) ?
                                        <div className="bid-3dot-icon-list" onClick={this.offerlist}>
                                            <img src="../images/3-dot-icon.png"/>
                                        </div>
                                    : null
                                }
                            </div>
                            {(this.state.stateofferlist == true) &&
                            (this.state.data.property_bids[0].buyer_id == this.state.userProfile.id || this.state.data.property_bids[0].seller_id == this.state.userProfile.id) && (
                                <div className="bid-offer-list-popup-box">
                                    <ul className="bid-offer-list">
                                        <li>
                                            {/* <span onClick={this.submit}>Cancel Deal</span> */}
                                            <button className="btn btn-danger" onClick={this.submit}><Trans>Cancel Deal</Trans>
                                            </button>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17">
                                                <path id="Icon_ionic-ios-arrow-dropdown-circle"
                                                      data-name="Icon ionic-ios-arrow-dropdown-circle"
                                                      d="M3.375,11.875a8.5,8.5,0,1,0,8.5-8.5A8.5,8.5,0,0,0,3.375,11.875ZM15.189,10.1a.792.792,0,0,1,1.116,0,.779.779,0,0,1,.229.556.793.793,0,0,1-.233.56l-3.854,3.841a.788.788,0,0,1-1.087-.025l-3.911-3.9A.789.789,0,0,1,8.565,10.02l3.314,3.347Z"
                                                      transform="translate(-3.375 20.375) rotate(-90)" fill="#e5e6e5"/>
                                            </svg>
                                        </li>
                                    </ul>
                                </div>
                            )}

                            {this.state.stateofferlist == true && progress.length == 0 && (
                                <div className="bid-offer-list-popup-box">
                                    <ul className="bid-offer-list">
                                        <li>
                                            {/* <span onClick={this.submit}>Cancel Deal</span> */}
                                            <Link to={'/feedback/' + this.state.data.id} className="vpil-buying-btn btn-detail mt-2">
                                                <Trans>Submit Feedback Detail</Trans>
                                            </Link>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
                                                 viewBox="0 0 17 17">
                                                <path id="Icon_ionic-ios-arrow-dropdown-circle"
                                                      data-name="Icon ionic-ios-arrow-dropdown-circle"
                                                      d="M3.375,11.875a8.5,8.5,0,1,0,8.5-8.5A8.5,8.5,0,0,0,3.375,11.875ZM15.189,10.1a.792.792,0,0,1,1.116,0,.779.779,0,0,1,.229.556.793.793,0,0,1-.233.56l-3.854,3.841a.788.788,0,0,1-1.087-.025l-3.911-3.9A.789.789,0,0,1,8.565,10.02l3.314,3.347Z"
                                                      transform="translate(-3.375 20.375) rotate(-90)" fill="#e5e6e5"/>
                                            </svg>
                                        </li>
                                    </ul>
                                </div>
                            )}
                            {(this.state.stateBidDetails == true) && (
                                <div className="bid-details-list-box">
                                    <ul className="bdl-full-list">
                                        <li>
                                            <div className="bdl-half">
                                                <b><Trans>Status</Trans></b>
                                                <span>Status</span>
                                            </div>
                                            <div className="bdl-half">
                                                <b><Trans>MSL</Trans></b>
                                                <span>12305687683</span>
                                            </div>
                                        </li>
                                        <li>
                                            <b><Trans>Date Opened</Trans></b>
                                            <span>1/01/2020</span>
                                        </li>
                                        <li>
                                            <b><Trans>Last Update</Trans></b>
                                            <span>1/01/2020 2:10AM</span>
                                        </li>
                                    </ul>
                                    <ul className="bdl-left-list">
                                        <li>
                                            <b><Trans>Buyer Name</Trans></b>
                                            <span>{data.property_bids[0].user?.name} {data.property_bids[0].user?.last_name}</span>
                                        </li>
                                        <li>
                                            <b><Trans>Buyer Realtor</Trans></b>
                                            <span>{data.property_bids[0].buyer_realtor?.name} {data.property_bids[0].buyer_realtor?.last_name}</span>
                                        </li>
                                        <li className="margin-top10">
                                            <b><Trans>Seller Name</Trans></b>
                                            <span>{data.property_bids[0].seller?.name} {data.property_bids[0].seller?.last_name}</span>
                                        </li>
                                        <li>
                                            <b><Trans>Seller Realtor</Trans></b>
                                            <span>{data.property_bids[0].seller_realtor?.name} {data.property_bids[0].seller_realtor?.last_name}</span>
                                        </li>
                                        <li className="margin-top10">
                                            <b><Trans>Lender</Trans></b>
                                            <span>{data.property_bids[0].lender?.name} {data.property_bids[0].lender?.last_name}</span>
                                        </li>
                                    </ul>
                                    <ul className="bdl-history-list">
                                        <li className="bdl-title-fullwidth"><Trans>Document History</Trans></li>
                                        {
                                            (typeof this.state.documents !== 'undefined' && this.state.documents.length > 0)
                                                ?
                                                this.state.documents.map(attachment => {
                                                    return (
                                                        ((accepted_bid[0].buyer_id != this.state.userProfile.id
                                                            && accepted_bid[0].buyer_realtor_id != this.state.userProfile.id
                                                                                                                        //'Inspection Results'
                                                               && accepted_bid[0].lender_id != this.state.userProfile.id) && attachment.id == 8)
                                                            ? null :
                                                            <li>
                                                                <b>{attachment.module}</b>
                                                                <span>
                                                                    <a href="#"
                                                                       onClick={() => this.downloadProgressFile(attachment.module)}
                                                                       style={{color: "#fff"}}>
                                                                        <i className="fa fa-download"></i>
                                                                    </a>
                                                                </span>
                                                            </li>
                                                    )
                                                })
                                                : null
                                        }
                                        {(attachments.length > 0) ?
                                            attachments.map(attachment => {
                                                return (
                                                    <li>
                                                        <b>{attachment.attachment}</b>
                                                        <span>
                                                            <a href="javascript:void(0);"
                                                                   onClick={() => this.downloadFile(attachment.id)}
                                                               style={{color: "#fff"}}>
                                                                <i className="fa fa-download"></i>
                                                            </a>
                                                        </span>
                                                    </li>
                                                )
                                            })
                                        : null
                                        }
                                        {((typeof this.state.documents !== 'undefined' && this.state.documents.length > 0) || attachments.length > 0)
                                            ? null :
                                            <div className="document-outer-section">
                                                <div className="document-right" style={{textAlign: 'center'}}>
                                                    <Trans>No Document Available</Trans>
                                                </div>
                                            </div>
                                        }
                                    </ul>
                                </div>
                            )}
                        </div>
                        {(this.state.statechecklist == true) && (
                            <div className="bid-checklist-popup-page">
                                <div className="bid-checklist-popup-close-btn" onClick={this.checklist}>
                                    <img src="../images/close-btn.svg"/>
                                </div>
                                <div className="bid-checklist-popup">
                                    <div className="bidcp-header">
                                        <h3><Trans>Checklist</Trans></h3>
                                        <div className="bidcp-plus-minus-sign-box">
                                            {/* <span>
                                                <img src="/images/plus-icon.svg" />
                                            </span>
                                            <span>
                                                <img src="/images/minus-icon.svg" />
                                            </span> */}
                                        </div>
                                    </div>
                                    <div className="bidcp-content">
                                        <ul className="bidcp-checklist-list">
                                            {
                                                (typeof checkList !== 'undefined')
                                                    ?
                                                    checkList.map(list => {
                                                        return (
                                                            <li>
                                                                <input type="checkbox" className="bidcp-checkbox"
                                                                       checked={list.status}
                                                                       name="{list}"
                                                                       id="{list}"
                                                                       onChange={(event) => this.handleCheckList(list.module, event)}/>

                                                                <label
                                                                    className="bidcp-checkbox-label">{list.module}</label>
                                                            </li>
                                                            // <div className="form-group">
                                                            //     <label>{list.module}</label>
                                                            //     <input checked={list.status} type="checkbox" name="{list}"
                                                            // id="{list}"
                                                            // onChange={(event) => this.handleCheckList(list.module, event)}/>
                                                            // </div>
                                                        )
                                                    })
                                                    :
                                                    <li><Trans>Checklist not available rightnow</Trans></li>
                                            }
                                            {/* <li>
                                                <input type="checkbox" className="bidcp-checkbox" />
                                                <label className="bidcp-checkbox-label">Check List item 1 - Buyer</label>
                                            </li>
                                            <li>
                                                <input type="checkbox" className="bidcp-checkbox" />
                                                <label className="bidcp-checkbox-label">Check List item 1 - Buyer</label>
                                            </li>
                                            <li>
                                                <input type="checkbox" className="bidcp-checkbox" />
                                                <label className="bidcp-checkbox-label">Check List item 1 - Buyer</label>
                                            </li>
                                            <li>
                                                <input type="checkbox" className="bidcp-checkbox" />
                                                <label className="bidcp-checkbox-label">Check List item 1 - Buyer</label>
                                            </li> */}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="bid-status-box">
                            <div className="bid-status-title">
                                <div onClick={this.statuslist}>
                                    <span><Trans>Status</Trans></span>
                                    <img src="../images/material-more-vert.png"/>
                                </div>
                                <img src="../images/closemenu.png" className="bid-status-close-btn"/>
                            </div>
                            {(this.state.statestatuslist == true) && (
                                <div className="bid-status-table-list">
                                    <ul className="bid-status-list">
                                        {
                                            this.state.data.progress.map(__progress => {
                                                return (
                                                    <li>
                                                        <p style={{marginRight: '5px'}}>{(__progress.id + 1)}</p>
                                                        <p>{__progress.module}</p>
                                                        <span>{__progress.who == 'buy' ? 'Buying Team' : 'Selling Team'}</span>
                                                        {
                                                            (__progress.status != false)
                                                                ?
                                                                <small>{moment(__progress.completion_date).format('DD-MM-YY hh:mm A')}</small>
                                                                :
                                                                null
                                                        }
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            )}
                            {(this.state.statestatuslist == false) && (
                                <div className="bid-status-chart-box">
                                    <div className="bid-sc-title-box">
                                        <img src="../images/ionic-ios-paper.png"/>
                                        <span>
                                        {progress.length>0 ?
                                            progress[0].id==2 || progress[0].id==3 || progress[0].id==4 || progress[0].id==5 ?
                                            <div /* className="text-orange" */>
                                                <p style={{paddingRight: '10px', float: 'left'}}>#{(progress.length > 0) ? (progress[0].id+1) : null} - </p>
                                                <Trans>{(progress.length > 0) ? ' ' + progress[0].module : 'Progress Completed'}</Trans>
                                            </div>
                                            : progress[0].id==0 || progress[0].id==1? <div>
                                                <p style={{paddingRight: '10px', float: 'left'}}>#{(progress.length > 0) ? (progress[0].id+1) : null} - </p>
                                                <Trans>{(progress.length > 0) ? ' ' + progress[0].module : 'Progress Completed'}</Trans>
                                            </div>:
                                            <div /* className="text-danger" */>
                                                <Trans>{(progress.length > 0) ? ' ' + progress[0].module : 'Progress Completed'}</Trans>
                                            </div>
                                            :  <div /* className="text-danger" */>
                                                <Trans>{(progress.length > 0) ? ' ' + progress[0].module : 'Progress Completed'}</Trans>
                                            </div> }
                                            </span>
                                            {/* {(progress.length > 0) ?
                                                (typeof progress[0].id != 'undefined' && progress[0].id === 14) ? 'Lender' :
                                                    <b>(<Trans>{progress[0].who == 'buy' ? 'Buyer' : 'Seller'}</Trans>)</b>
                                                : null
                                            } */}
                                            {(progress.length > 0) ?
                                                <b>({
                                                    progress[0].who==='s_realtor' ? 'Selling Realtor' : 
                                                    progress[0].who==='b_realtor' ? 'Buying Realtor' :
                                                    progress[0].who==='buy' ? 'Buying Team' :
                                                    progress[0].who==='seller' ? 'Selling Team' :
                                                    progress[0].who==='buy_lender' ? 'Lender or Buyer' :
                                                    progress[0].who
                                                })</b>
                                            : null}
                                    </div>

                                    <div className="new-bid-status-list-row">
                                        <ul className="new-bid-status-list">
                                            <Slider ref={slider => sliderRef = slider} {...settings}>
                                                {
                                                    data.progress.map((__progress, i) => {
                                                        return (
                                                            <li className='bid-sccl-active' key={i}>
                                                                <div className="nbdl-icon-text">
                                                                    <img src={__progress.status == false ? (((i > 0 && data.progress[i - 1].status) || i === 0) ? "../images/CurrentState.png" : "../images/NextState.png") : "../images/PrevState.png"}/>
                                                                    <span>
                                                                        <p style={{marginRight: '10px'/* , float: 'left' */}}>{(__progress.id + 1)}</p>
                                                                        <Trans>{__progress.module}</Trans></span>
                                                                </div>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </Slider>
                                            {/* <li className="bid-sccl-active">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li className="bid-sccl-active">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li className="bid-sccl-active">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li className="bid-sccl-active">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li className="bid-sccl-active">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li className="bid-sccl-current">
                                                <div className="bid-sc-icon-circle-box">
                                                    <img src="../images/ionic-ios-paper-1.png" />
                                                </div>
                                            </li>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li>
                                            <li>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16.128" height="12.541" viewBox="0 0 16.128 12.541">
                                                    <path id="Icon_awesome-home" data-name="Icon awesome-home" d="M7.849,5.507,2.687,9.758v4.588a.448.448,0,0,0,.448.448l3.137-.008a.448.448,0,0,0,.446-.448v-2.68a.448.448,0,0,1,.448-.448H8.958a.448.448,0,0,1,.448.448v2.678a.448.448,0,0,0,.448.449l3.136.009a.448.448,0,0,0,.448-.448V9.755L8.277,5.507A.341.341,0,0,0,7.849,5.507ZM16,8.4,13.662,6.467V2.589a.336.336,0,0,0-.336-.336H11.758a.336.336,0,0,0-.336.336V4.622L8.916,2.56a1.344,1.344,0,0,0-1.708,0L.121,8.4a.336.336,0,0,0-.045.473l.714.868a.336.336,0,0,0,.473.046L7.849,4.359a.341.341,0,0,1,.428,0l6.586,5.424a.336.336,0,0,0,.473-.045l.714-.868A.336.336,0,0,0,16,8.4Z" transform="translate(0.001 -2.254)" fill="#b2d235" />
                                                </svg>
                                                <div className="bid-sc-circle-box"></div>
                                                <span><Trans>Status Item #1</Trans></span>
                                            </li> */}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bid-nextstep-box">
                            {
                                (progress.length > 0)
                                    ?
                                    <>
                                        <div className="bid-title"><Trans>Next Step</Trans></div>
                                        <div className="bid-nextstep-popup-box">
                                            <div className="bid-npb-title">
                                                <span>{(progress.length > 0) ? progress[0].module : 'Progress Completed'}</span>
                                                <img src="../images/3-dot-icon.png"/>
                                            </div>

                                            {
                                                (progress[0].description != undefined)
                                                    ?
                                                    <div className="bid-npb-title">
                                                        <span>{progress[0].description}</span>
                                                    </div>
                                                    :
                                                    null
                                            }

                                            {
                                                (
                                                    (progress[0].who == 'seller' && (isSeller || isSellerRealtor)) ||
                                                    (progress[0].who == 'buy' && (isBuyer || isBuyerRealtor)) ||
                                                    (progress[0].who == 'b_realtor' && isBuyerRealtor) ||
                                                    (progress[0].who == 's_realtor' && isSellerRealtor) ||
                                                    (progress[0].who == 'buy_lender' && (isBuyer || isLender || isBuyerRealtor)) ||
                                                    (progress[0].who == 'buy_lender' && (isBuyer || isLender || isBuyerRealtor)) ||
                                                    (progress[0].who == 'all' && isSeller|| isSellerRealtor || isBuyer || isBuyerRealtor || isLender)
                                                ) ?
                                                    this.commonProgress(progress, completedProgress, closed_date, confirm_close_date)
                                                    :
                                                    <div className="alert alert-warning text-center text-bold">Pending action by other party</div>
                                            }
                                            {/* <div className="bid-npb-row">
                                            <span>Date</span>
                                            <input type="date" className="bid-npb-textfld" />
                                        </div>
                                        <div className="bid-npb-row">
                                            <span>Upload File:</span>
                                            <input type="file" className="bid-npb-textfld" />
                                        </div> */}
                                        </div>
                                    </>
                                    :
                                    <>
                                        <div className="bid-title"><Trans>Progress Completed</Trans></div>
                                        <div className="bid-nextstep-popup-box">
                                            <div className="bid-npb-title">
                                                <Link to={'/feedback/' + this.state.data.id}
                                                      className="vpil-buying-btn">
                                                    <Trans>Submit Feedback</Trans></Link>
                                            </div>
                                        </div>
                                    </>
                            }
                        </div>
                        <div className="bid-chat-row">
                            <div className="bid-inner-chat-box">
                                <div className="bid-property-name" id="buying-room-inner">
                                    <b><Trans>Transaction table Chat </Trans></b>
                                    <span><Trans>(Buyer, Seller, Realtors, Lender)</Trans></span>
                                </div>
                                <div className="bid-chat-box">
                                    <div className="bid-icon-name-dot-row">
                                        {(isSeller)
                                            ? <p className="para_align"><Trans>You Have Accepted Bidding
                                                From</Trans> {accepted_bid[0].user?.name} {accepted_bid[0].user?.last_name}
                                            </p>
                                            :
                                            <p className="para_align"><Trans>Your Bid is Accepted By the Seller</Trans>
                                            </p>
                                        }
                                        <div className="bid-chat-icon">
                                            {/* <img src="/images/Capturess.png" alt=""></img> */}
                                        </div>
                                        <div className="bid-chat-text">{data.title}</div>
                                        <img src="../images/3-dot-icon.png"/>
                                    </div>
                                    <div className="chat-start-end-msg">
                                        {/* Chat Messages Start*/}
                                        <ScrollableFeed>
                                            {this.messageThread()}
                                        </ScrollableFeed>
                                    </div>
                                    <div className="chat-msgs">
                                        <FieldGroup control={this.chatForm}
                                                    render={({invalid, pristine, pending, meta}) => (
                                                        <form noValidate
                                                              onSubmit={(event) => this.handleChatSubmit(event)}>
                                                            {/* <input type="text" onChange={(event) => { this.setState({ msg: event.target.value }) }} id="mssg" name="message" placeholder="Type message here" value={this.state.msg}></input> */}
                                                            <FieldControl name="message" render={TextInput}
                                                                          meta={{label: "Chat"}}/>
                                                            <input type="submit" name="submit" value="submit"
                                                                   id="submit"></input>
                                                            <input onChange={(event) => this.onChatFileChange(event)}
                                                                   id="chat-attachment" type="file"/>

                                                        </form>
                                                    )}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>}

                <div className="disnone">
                    <div className="modal fade" id="myModal" role="dialog">
                        <div className="modal-dialog modal-md">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4 className="modal-title"><Trans>Checklist</Trans></h4>
                                </div>
                                <div className="modal-body">
                                    {
                                        (typeof checkList !== 'undefined')
                                            ?
                                            checkList.map(list => {
                                                return (<div className="form-group">
                                                    <label>{list.module}</label>
                                                    <input checked={list.status} type="checkbox" name="{list}"
                                                           id="{list}"
                                                           onChange={(event) => this.handleCheckList(list.module, event)}/>
                                                </div>)
                                            })
                                            :
                                            <p><Trans>Checklist not available rightnow</Trans></p>
                                    }
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-default" data-dismiss="modal">
                                        <Trans>Close</Trans>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {data && <div className="content-wrapper disnone">
                    <div className="row">
                        <div className="container">
                            <div className="profile-inner">
                                <div className="biddetail-outer">
                                    <div className="row">
                                        <div className="col-md-6" style={{fontWeight: 'bold'}}>
                                            <p style={{fontWeight: 'bold'}}><Trans>TransactionID</Trans>:
                                                <span
                                                    style={{fontWeight: 'bold'}}> {btoa(data.title).replace(/={1,2}$/, '')} </span>
                                            </p>
                                        </div>
                                        {
                                            (this.state.data.property_bids[0].buyer_id == this.state.userProfile.id || this.state.data.property_bids[0].seller_id == this.state.userProfile.id)
                                                ?
                                                <div className="col-md-6" style={{textAlign: 'right'}}>
                                                    <button className="btn btn-danger" onClick={this.submit}><Trans>Cancel
                                                        Deal</Trans>
                                                    </button>
                                                </div>
                                                :
                                                null
                                        }
                                        {
                                            (progress.length == 0)
                                                ?
                                                <div className="col-md-6" style={{textAlign: 'right'}}>
                                                    <Link to={'/feedback/' + this.state.data.id}
                                                          className="btn-primary btn-detail mt-2">
                                                        <Trans>Submit Feedback </Trans></Link>
                                                </div>
                                                :
                                                null
                                        }
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="property-img">
                                                <img src="http://reverifi.trisec.io/images/property-1.png"
                                                     className="img-fluid"></img>

                                            </div>
                                            <div className="property-name">
                                                <p>{data.title}</p>
                                            </div>
                                            <div className="bid-details">
                                                <h5>
                                                    <Trans>Bid Details</Trans>
                                                </h5>
                                            </div>
                                            <div className="offers_detail_table">

                                                <table className="table">
                                                    <tbody>
                                                    <tr>
                                                        <td>
                                                            <Trans>Offer Price</Trans>
                                                        </td>
                                                        <td>
                                                            {
                                                                data.property_bids.map(bid => {
                                                                    if (bid.status == 1) {
                                                                        return `$ ${bid.offer_price}`
                                                                    }
                                                                })
                                                            }
                                                        </td>

                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <Trans>Property Address</Trans>
                                                        </td>
                                                        <td>
                                                            &nbsp;
                                                        </td>

                                                    </tr>
                                                    <tr className="outer-tr">
                                                        <td colSpan={100}>
                                                            {`${data.address}, ${data.city}, ${data.state}, ${data.country}`}

                                                        </td>


                                                    </tr>

                                                    </tbody>
                                                </table>
                                            </div>


                                        </div>
                                        <div className="col-md-6">
                                            <div className="property-detail-btn">
                                                <a href="" data-toggle="modal" data-target="#myModal"><Trans>Check List</Trans></a>
                                            </div>

                                            <div className="offers_detail_table" id="right-detail">

                                                <table className="table">
                                                    <tbody>
                                                    {/*<tr>*/}
                                                    {/*<td>*/}
                                                    {/*<div className="bid-accepted">*/}
                                                    {/*<a href="#" className='text text-success'><Trans>Bid Accepted</Trans></a>*/}
                                                    {/*</div>*/}
                                                    {/*</td>*/}
                                                    {/*<td>*/}
                                                    {/*<div className="seller-data">*/}
                                                    {/*<p><Trans>(Seller)</Trans></p>*/}
                                                    {/*</div>*/}

                                                    {/*</td>*/}

                                                    {/*</tr>*/}
                                                    {
                                                        data.progress.map(progress => {
                                                            return (
                                                                <tr>
                                                                    <td>
                                                                        <div className="bid-accepted">
                                                                            <a href="#"
                                                                               className={progress.status === true ? 'text text-success' : ''}>{progress.module}</a>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="seller-data">
                                                                            <p>{progress.who == 'buy' ? accepted_bid[0].user?.name + ' ' + accepted_bid[0].user?.last_name : this.state.seller?.name + ' ' + this.state.seller?.last_name}</p>
                                                                        </div>

                                                                    </td>
                                                                </tr>)
                                                        })
                                                    }

                                                    </tbody>
                                                </table>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    <div className="container">
                        <div className="row">
                            <div className="col-md-7">
                                {
                                    (this.state.error)
                                        ?
                                        <span className="col-md-12 text text-danger">{this.state.errorMessage}</span>
                                        :
                                        null
                                }

                                <div className="documents-uppers" style={{height: '100%'}}>
                                    {
                                        (progress.length > 0)
                                            ?
                                            <>
                                                <h2><Trans>Next Step</Trans> - {progress[0].module}</h2>
                                                {
                                                    ((isSeller && progress[0].who == 'seller') || (accepted_bid[0].buyer_id == this.state.userProfile.id && progress[0].who == 'buy'))
                                                        ?
                                                        this.commonProgress(progress, completedProgress, closed_date, confirm_close_date)
                                                        :
                                                        null
                                                }
                                            </>
                                            :
                                            <h2 className="text text-success" style={{
                                                position: 'absolute',
                                                marginTop: '26%',
                                                marginLeft: '35%'
                                            }}>Progress Completed !</h2>

                                    }
                                </div>
                            </div>
                            <div className="col-md-5">
                                <div className="documents-uppers">
                                    <h2><Trans>Progress Documents</Trans></h2>
                                    <div className="doc-upper">
                                        {
                                            (typeof this.state.documents !== 'undefined' && this.state.documents.length > 0)
                                                ?
                                                this.state.documents.map(attachment => {
                                                    return (
                                                        ((accepted_bid[0].buyer_id != this.state.userProfile.id
                                                            && accepted_bid[0].buyer_realtor_id != this.state.userProfile.id
                                                            //'Inspection Results'
                                                            && accepted_bid[0].lender_id != this.state.userProfile.id) && attachment.id == 8)
                                                            ?
                                                            null
                                                            :
                                                            <div className="document-outer-section">
                                                                <div className="documents-left">
                                                                    {/* <img src="/images/Capturess.png" alt=""></img> */}
                                                                </div>
                                                                <div className="document-right">
                                                                    <div className="docs-color">
                                                                        <div className="doc-pdf">
                                                                            <i className="fa fa-file-pdf"></i>
                                                                        </div>
                                                                        <div className="pdf-desc">
                                                                            <p>
                                                                                <b>{attachment.module}</b><br/>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <a href="javascript:void(0);"
                                                                       onClick={() => this.downloadProgressFile(attachment.module)}>
                                                                        <div className="pdf-download">
                                                                            <i className="fa fa-download"></i>
                                                                        </div>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                    )
                                                })
                                                :
                                                <div className="document-outer-section">
                                                    <div className="document-right" style={{textAlign: 'center'}}>
                                                        <Trans>No Document Available</Trans>
                                                    </div>
                                                </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <br/>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-7 propertyChatUpper">

                            </div>
                            <div className="col-md-5">
                                <div className="documents-uppers">
                                    <h2><Trans>Chat Documents</Trans></h2>
                                    <div className="doc-upper">
                                        {
                                            (attachments.length > 0)
                                                ?
                                                attachments.map(attachment => {
                                                    return <div className="document-outer-section">
                                                        <div className="documents-left">
                                                            {/* <img src="/images/Capturess.png" alt=""></img> */}
                                                        </div>
                                                        <div className="document-right">
                                                            <div className="docs-color">
                                                                <div className="doc-pdf">
                                                                    <i className="fa fa-file-pdf"></i>
                                                                </div>
                                                                <div className="pdf-desc">
                                                                    <p>
                                                                        <b>{attachment.attachment}</b><br/>
                                                                        {
                                                                            (typeof attachment.size != null || attachment.size != null)
                                                                                ?
                                                                                attachment.size + ' kb '
                                                                                :
                                                                                null
                                                                        }
                                                                        {moment(attachment.created_at).format('DD/MM/YYYY')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <a href="javascript:void();"
                                                               onClick={() => this.downloadFile(attachment.id)}>
                                                                <div className="pdf-download">
                                                                    <i className="fa fa-download"></i>
                                                                </div>
                                                            </a>
                                                        </div>
                                                    </div>
                                                })
                                                :
                                                <div className="document-outer-section">
                                                    <div className="document-right" style={{textAlign: 'center'}}>
                                                        <Trans>No Document Available</Trans>
                                                    </div>
                                                </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>}
            </React.Fragment>
        )

    }


    private commonProgress(progress: any, completedProgress: any, closed_date: any, confirm_close_date: any): React.ReactNode {

        return <FieldGroup control={recForm} render={({get, invalid}) => (
            <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                {
                    (this.state.datePicker)
                        ?
                        <>
                            {
                                (progress[0].date !== false)
                                    ?
                                    <>
                                        <label>
                                            {/*'Initial Contract'*/}
                                            <Trans> {(progress[0].id == 0) ? 'Target date for Closing' : 'Date'} </Trans></label>
                                        <div className="bid-npb-row">

                                            <DatePicker selected={this.state.selectedDate} onChange={this.validateDate}/>

                                            {/* <input className="bid-npb-textfld"
                                                onChange={(event) => this.validateDate(event)}
                                                type="date" name="date" required /> */}
                                        </div>
                                    </>
                                    :
                                    null
                            }
                            {
                                (progress[0].file_upload !== false)
                                    ?
                                    <div className="bid-npb-row">
                                        <span><Trans>Upload File</Trans>:</span>
                                        <input className="bid-npb-textfld" onChange={(event) => this.onFileChange(event)} type="file" name="attachment" accept=".doc, .docx, application/msword, application/pdf, image/*"/>
                                    </div>
                                    :
                                    null
                            }
                            <div className="submit-bid-btn">
                                {!this.state.loading
                                    ?
                                    <>
                                        <input type="submit" disabled={invalid} />
                                    </>
                                    :
                                    <button type="submit" name="submit" disabled className="btn btn-invite-buyers">
                                        <span
                                            className="spinner-grow spinner-grow-sm"
                                            role="status"
                                            aria-hidden="true">
                                        </span>
                                        <span className="sr-only"><Trans>Loading...</Trans></span>
                                    </button>}

                            </div>
                            {
                                //'Inspection Date'
                                (progress[0].id == 6 && progress[0].skip != undefined)
                                    ?
                                    <div className="submit-bid-btn pull-left">
                                        <input type="hidden" name="skip" value="yes"/>
                                        <input type="submit" value="Waive inspection" />
                                        {/* <input type="submit" disabled={invalid} value="Waive inspection" /> */}
                                    </div>
                                    :
                                    null
                            }
                        </>
                        :
                        null
                    // <div>        
                    //     <div className="bid-npb-row">
                    //         <span>Date</span>
                    //         <input type="date" className="bid-npb-textfld" />
                    //     </div>
                    //     <div className="bid-npb-row">
                    //         <span>Upload File:</span>
                    //         <input type="file" className="bid-npb-textfld" />
                    //     </div>
                    // </div>
                    // (this.state.datePicker)
                    //     ?
                    //     <>
                    //     {

                    //         (progress[0].date !== false)
                    //         ?
                    //         <><>
                    //                     {(progress[0].module === 'Set close Date')}
                    //             ?
                    //                     <label> <Trans>
                    //                         Suggested Closed Date
                    //                     </Trans></label>
                    //                     {completedProgress.length > 0 ? completedProgress[completedProgress.length - 1].value : ''}

                    //             :
                    //                 </><label> <Trans>
                    //                     {(progress[0].module == 'Initial Contract') ? 'Target date for Closing' : 'Date'}
                    //                 </Trans></label><div className="bid-npb-row">
                    //                         <span>Date</span>
                    //                     </div>
                    // <input className="bid-npb-textfld"
                    //     onChange={(event) => this.validateDate(event)}
                    //     type="date" name="date" required /></>

                    //         :
                    //             null

                    //     }
                    // {
                    // (progress[0].file_upload !== false)
                    // ?
                    //     <div className="bid-npb-row">
                    //         <span>Upload File:</span>
                    //         <input className="bid-npb-textfld"
                    //             onChange={(event) => this.onFileChange(event)}
                    //             type="file" name="attachment" />
                    //     </div>
                    // :
                    //     null
                    // }
                    // <div className="submit-bid-btn">
                    //     {!this.state.loading
                    //         ?
                    //         <input type="submit"
                    //             disabled={invalid}>
                    //         </input>
                    //         :
                    //         <button type="submit" name="submit" disabled
                    //             className="btn btn-invite-buyers">
                    //             <span
                    //                 className="spinner-grow spinner-grow-sm"
                    //                 role="status"
                    //                 aria-hidden="true">
                    //             </span>
                    //             <span
                    //                 className="sr-only"><Trans>Loading...</Trans></span>
                    //         </button>}

                    // </div>
                    //     :
                    // <table>
                    //     <tbody>
                    //         <tr>
                    //             <td>{completedProgress.length > 0 ? completedProgress[completedProgress.length - 1].module : ''}</td>
                    //             <td>{completedProgress.length > 0 ? completedProgress[completedProgress.length - 1].value : ''}</td>
                    //             <td>
                    //                 <button type="submit" name="submit"
                    //                     className="btn btn-invite-buyers">
                    //                     Confirm Date
                    //             </button>
                    //             </td>
                    //         </tr>
                    //     </tbody>
                    // </table>

                    // <div className="submit-bid-btn">
                    //     {!this.state.loading
                    //         ?
                    //         <input type="submit"
                    //             disabled={invalid}>
                    //         </input>
                    //         :
                    //         <button type="submit" name="submit" disabled
                    //             className="btn btn-invite-buyers">
                    //             <span
                    //                 className="spinner-grow spinner-grow-sm"
                    //                 role="status"
                    //                 aria-hidden="true">
                    //             </span>
                    //             <span
                    //                 className="sr-only"><Trans>Loading...</Trans></span>
                    //         </button>}

                    // </div>
                    //     </>
                    //     :
                    // <table>
                    //     <tbody>
                    //         <tr>
                    //             <td>{completedProgress[completedProgress.length - 1].module}</td>
                    //             <td>{completedProgress[completedProgress.length - 1].value}</td>
                    //             <td>
                    //                 <button type="submit" name="submit"
                    //                     className="btn btn-invite-buyers">
                    //                     Confirm Date
                    //             </button>
                    //             </td>
                    //         </tr>
                    //     </tbody>
                    // </table>
                }

                {
                    //'Set close Date'
                    (progress[0].id == 16)
                        ?
                        (this.state.datePicker)
                            ?

                            <div>
                                <button type="button" className="btn btn-invite-buyers" onClick={this.toggledatePicker}>
                                    <Trans>View Proposed Date</Trans>
                                </button>
                            </div>

                            :
                            <>
                                <table className="table">
                                    <tbody>
                                    <tr>
                                        <td><Trans>Proposed date:</Trans> {closed_date}</td>
                                        <td>
                                            <button type="submit" name="submit"
                                                    className="btn btn-invite-buyers">
                                                <Trans>Confirm Date</Trans>
                                            </button>
                                        </td>
                                        <td>
                                            <button type="button" className="btn btn-invite-buyers"
                                                    onClick={this.toggledatePicker}>
                                                <Trans>Suggest new Date</Trans></button>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </>
                        :
                        null
                }

                {
                    //'Confirm inspection Date or suggest alternative'
                    (progress[0].id === 7
                        ||
                        //'Confirm appraisal date or suggest alternative'
                        progress[0].id == 10
                        ||
                        //'Confirm close date'
                        progress[0].id == 18)
                        ?
                        (this.state.datePicker)
                            ?
                            <div>
                                <button type="button" className="btn btn-invite-buyers" onClick={this.toggledatePicker}>
                                <Trans>View Proposed Date</Trans>
                                </button>
                            </div>
                            :
                            <>

                                <table className="table">
                                    <tbody>
                                    <tr>
                                        <th>{progress[0].module}</th>
                                        {/*'Confirm close date'*/}
                                        <th>{(progress[0].id == 18) ? closed_date : completedProgress[completedProgress.length - 1].value}</th>
                                    </tr>
                                    <tr>
                                        <td>
                                            <button type="submit" name="submit"
                                                    className="btn btn-invite-buyers"><Trans>Confirm Date</Trans>
                                            </button>
                                        </td>
                                        <td>
                                            <button type="button" className="btn btn-invite-buyers"
                                                    onClick={this.toggledatePicker}>
                                                <Trans>Suggest new Date</Trans></button>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </>
                        :
                        null
                }

                {
                    (
                        //'Inspection Date'
                        (progress[0].id == 6 && progress[0].status === false && typeof progress[0].suggest !== 'undefined')
                        ||
                        //'Suggest Appraisal Date'
                        (progress[0].id == 9 && progress[0].status === false && typeof progress[0].suggest !== 'undefined')
                    )
                        ?
                        <table className="table">
                            <thead>
                            <th><Trans>Propsed Date</Trans></th>
                            <th><Trans>Suggested Date</Trans></th>
                            </thead>
                            <tbody>
                            <tr>
                                <td>{progress[0].value}</td>
                                <td>{progress[0].suggest}</td>
                            </tr>
                            </tbody>
                        </table>
                        :

                        null
                }
            </form>
        )}/>;
    }

    private inspectionProgress(progress: any, completedProgress: any): React.ReactNode {
        return <FieldGroup control={recForm} render={({get, invalid}) => (
            <form noValidate onSubmit={(event) => this.handleFormSubmit(event)}>
                {
                    <>

                    </>
                }
            </form>
        )}/>;
    }
}


export default BidDetail3;
