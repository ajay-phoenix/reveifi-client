import React, { Component } from "react";

import { AdminTopNav, SideBar } from "components/common/imports/navigations";
import { UserService, UrlService } from "services/imports/index";
import Topnav from "components/common/topnav";

import { Trans } from "react-i18next";
import moment from "moment";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import $ from 'jquery';
import { Button } from 'react-bootstrap';
import defaultImage from "../../../assets/images/defaultImage.png"
import "./_style.scss";

const country = { "840": "USA", "826": "UK" };

class PropertyStatus extends Component<{}, any> {
    slider1: any;
    slider2: any;

    constructor(props) {
        super(props);
        this.state = {
            props: [],
            loading: 'true',
            propertystatusstate: false,
            nav1: null,
            nav2: null,
            images: [],
            showVideoPopup: false,
            realtor_info: {},
            realtors: [],
            current_user_id: 0
        }
        this.handler = this.handler.bind(this)
    }

    handler() {
        this.setState({
            updateLanguage: true
        })
    }

    async componentDidMount() {
        const propId = window.location.pathname.split("/").pop();
        const response = await UserService.getSingleProperty(propId);
        const current_user = await UserService.getCurrentUserProfile();

        this.setState({
            images: response[0].images ? response[0].images.split(', ') : [],
            prop_id: propId,
            youtube_video: response[0].youtube_video,
            media: response[0].media,
            title: response[0].title,
            city: response[0].city,
            country: response[0].country,
            mls_link: response[0].mls_link,
            state: response[0].state,
            zipcode: response[0].zipcode,
            address: response[0].address,
            propsPrice: response[0].price,
            counties: response[0].counties,
            cDate: response[0].created_at,
            seller_id: response[0].property_association[0].user_id,
            selling_realtor_id: response[0].property_association[0].realtor_id,
            current_user_id: current_user?.userProfile.id,
            loading: 'false',
            nav1: this.slider1,
            nav2: this.slider2,
            
        });

        const all_realtors = await UserService.getUserActsList(2);
        var realtor_emails = [];
        var realtors = [];
        for(let i=0; i<all_realtors?.length; i++){
            if(all_realtors[i].email){
                if(!realtor_emails.includes(all_realtors[i].email)){
                    realtors.push(all_realtors[i])
                    realtor_emails.push(all_realtors[i].email)
                }
            } else{
                if(!realtor_emails.includes(all_realtors[i].to_email)){
                    realtors.push(all_realtors[i])
                    realtor_emails.push(all_realtors[i].to_email)
                }
            }
        }

        this.setState({ realtors:realtors })
        var realtor_id = response[0].property_association[0].realtor_id;
        var realtor_info = await UserService.getUserProfile(realtor_id);
        if(!realtor_info){
            realtor_info = { 
                name: 'Not Existing',
                last_name: '',
            }
        }

        this.setState({ realtor_info:realtor_info })
        $('.slick-arrow.slick-prev').html('')
        $('.slick-arrow.slick-next').html('')
    }

    async delistProperty(){
        const propId = window.location.pathname.split("/").pop();
        var delist_property = await UserService.delistProperty(propId);
        if(delist_property.success){
            alert('Property Delisted Successfully!');
        }
    }

    showVideoPopup = () => {
        if (this.state.showVideoPopup == true) {
            this.setState({ showVideoPopup: false })
        } else {
            this.setState({ showVideoPopup: true })
        }
    }

    toggleContactRealtor = () => {
        this.setState({ ContactRealtor: this.state.ContactRealtor ? false: true })
    }

    hidepopup = () => {
        this.setState({ showVideoPopup: false })
    }

    render() {
        const priceSplitter = (number) => (number && number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
        var bottomSlider = {
            className: "center",
            centerMode: true,
            infinite: true,
            responsive: [
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: true,
                    dots: true
                  }
                },
                {
                  breakpoint: 600,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    initialSlide: 3
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                  }
                }
              ]
        }


        return (
            <React.Fragment>
                { this.state.current_user_id ?
                <><AdminTopNav handler={this.handler}></AdminTopNav><SideBar handler={this.handler}></SideBar></> : 
                <Topnav /> }
                <section className="property-status-section">
                    <div className="ps-title">
                        <div className="backbtn-box">
                            <Link to={'/public-properties'}>
                                <img src="../images/back-icon.png" />
                            </Link>
                        </div>
                        <span><Trans>Bid details - {this.state['title']}</Trans></span>
                        <div className="pst-icon-menu-box">
                            <div className="pst-icon">
                                <img src="../images/3-dot-icon.png" />
                            </div>
                            {(this.state.propertystatusstate == true) && (
                                <div className="bid-offer-list-popup-box">
                                    <ul className="bid-offer-list">
                                        <li>
                                            <span><Trans>Change Offer</Trans></span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
                                                viewBox="0 0 17 17">
                                                <path id="Icon_ionic-ios-arrow-dropdown-circle"
                                                    data-name="Icon ionic-ios-arrow-dropdown-circle"
                                                    d="M3.375,11.875a8.5,8.5,0,1,0,8.5-8.5A8.5,8.5,0,0,0,3.375,11.875ZM15.189,10.1a.792.792,0,0,1,1.116,0,.779.779,0,0,1,.229.556.793.793,0,0,1-.233.56l-3.854,3.841a.788.788,0,0,1-1.087-.025l-3.911-3.9A.789.789,0,0,1,8.565,10.02l3.314,3.347Z"
                                                    transform="translate(-3.375 20.375) rotate(-90)" fill="#e5e6e5" />
                                            </svg>
                                        </li>
                                        <li>
                                            <span><Trans>Change Offer</Trans></span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
                                                viewBox="0 0 17 17">
                                                <path id="Icon_ionic-ios-arrow-dropdown-circle"
                                                    data-name="Icon ionic-ios-arrow-dropdown-circle"
                                                    d="M3.375,11.875a8.5,8.5,0,1,0,8.5-8.5A8.5,8.5,0,0,0,3.375,11.875ZM15.189,10.1a.792.792,0,0,1,1.116,0,.779.779,0,0,1,.229.556.793.793,0,0,1-.233.56l-3.854,3.841a.788.788,0,0,1-1.087-.025l-3.911-3.9A.789.789,0,0,1,8.565,10.02l3.314,3.347Z"
                                                    transform="translate(-3.375 20.375) rotate(-90)" fill="#e5e6e5" />
                                            </svg>
                                        </li>
                                        <li>
                                            <span><Trans>Change Offer</Trans></span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
                                                viewBox="0 0 17 17">
                                                <path id="Icon_ionic-ios-arrow-dropdown-circle"
                                                    data-name="Icon ionic-ios-arrow-dropdown-circle"
                                                    d="M3.375,11.875a8.5,8.5,0,1,0,8.5-8.5A8.5,8.5,0,0,0,3.375,11.875ZM15.189,10.1a.792.792,0,0,1,1.116,0,.779.779,0,0,1,.229.556.793.793,0,0,1-.233.56l-3.854,3.841a.788.788,0,0,1-1.087-.025l-3.911-3.9A.789.789,0,0,1,8.565,10.02l3.314,3.347Z"
                                                    transform="translate(-3.375 20.375) rotate(-90)" fill="#e5e6e5" />
                                            </svg>
                                        </li>
                                        <li>
                                            <span><Trans>Change Offer</Trans></span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
                                                viewBox="0 0 17 17">
                                                <path id="Icon_ionic-ios-arrow-dropdown-circle"
                                                    data-name="Icon ionic-ios-arrow-dropdown-circle"
                                                    d="M3.375,11.875a8.5,8.5,0,1,0,8.5-8.5A8.5,8.5,0,0,0,3.375,11.875ZM15.189,10.1a.792.792,0,0,1,1.116,0,.779.779,0,0,1,.229.556.793.793,0,0,1-.233.56l-3.854,3.841a.788.788,0,0,1-1.087-.025l-3.911-3.9A.789.789,0,0,1,8.565,10.02l3.314,3.347Z"
                                                    transform="translate(-3.375 20.375) rotate(-90)" fill="#e5e6e5" />
                                            </svg>
                                        </li>
                                        <li>
                                            <span><Trans>Change Offer</Trans></span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
                                                viewBox="0 0 17 17">
                                                <path id="Icon_ionic-ios-arrow-dropdown-circle"
                                                    data-name="Icon ionic-ios-arrow-dropdown-circle"
                                                    d="M3.375,11.875a8.5,8.5,0,1,0,8.5-8.5A8.5,8.5,0,0,0,3.375,11.875ZM15.189,10.1a.792.792,0,0,1,1.116,0,.779.779,0,0,1,.229.556.793.793,0,0,1-.233.56l-3.854,3.841a.788.788,0,0,1-1.087-.025l-3.911-3.9A.789.789,0,0,1,8.565,10.02l3.314,3.347Z"
                                                    transform="translate(-3.375 20.375) rotate(-90)" fill="#e5e6e5" />
                                            </svg>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-md-5 pt-md-4 pl-4 text-center images-slider"> 
                                <Slider asNavFor={this.state.nav2} ref={slider => (this.slider1 = slider)} className="position-relative">
                                    {this.state.images.map((image, i)=>{
                                        return <div className="col-md-12 pt-md-1" key={i}>
                                            <img src={UrlService.imagesPath() + '/' +image} className="top-slider-image"/>
                                        </div>
                                    })}
                                        
                                </Slider>

                               {/*  {this.state.images!=0 && this.state.youtube_video ? 
                                    <button className="btn theme-btn mt-2 font-weight-bold ml-2" onClick={()=>this.showVideoPopup()}>Reverifi Virtual Tour</button>
                                : null } */}
                                
                                <Slider asNavFor={this.state.nav1}
                                ref={slider => (this.slider2 = slider)}
                                slidesToShow={3}
                                swipeToSlide={true}
                                focusOnSelect={true}
                                {...bottomSlider}
                                className="mt-0 pl-1 hide-slider-buttons">
                                    {this.state.images.map((image, i)=>{
                                        return <div className="col-md-12" key={i}>
                                            <img src={UrlService.imagesPath() + '/' +image} className="bottom-slider-image"/>
                                        </div>
                                    })}
                                </Slider>

                                {this.state.images==0 ? <>
                                <img src={UrlService.imagesPath() + '/' + this.state['media']} className="img-fluid" style={{ height: '400px', objectFit: 'contain' }} />
                                    {/* {this.state.youtube_video ? 
                                        <button className="btn theme-btn mt-2 font-weight-bold ml-2" onClick={()=>this.showVideoPopup()}>Reverifi Virtual Tour</button>
                                    : null } */}
                                    </>
                                 : null}
                            </div>
                            <div className="col-md-7 mt-md-5 pr-4 bdetails"> 
                                {/* <li>
                                    <b><Trans>Title</Trans>:</b>
                                    <span><Trans>{this.state['title']}</Trans></span>
                                </li> */}
                                <div className="row mt--4px">
                                    <div className="col-md-7 mt-5 mt-md-0">
                                        <h5 className="mb-3"><b>Date Listed:</b> <span className="text-black-50">{ moment(this.state.cDate).format('MM/DD/YYYY') }</span></h5>
                                    </div>
                                    <div className="col-md-5">
                                        {this.state.youtube_video ? 
                                            <button className="btn-mod float-md-right btn theme-btn font-weight-bold mb-3" onClick={()=>this.showVideoPopup()}>reverifi virtual tour</button>
                                        : null }

                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                    <h5><b>Street:</b> <span className="text-black-50">{ this.state.address }</span></h5>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                    <h5><b>Town/ City:</b> <span className="text-black-50">{ this.state.city }</span></h5>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                    <h5><b>State:</b> <span className="text-black-50">{ this.state.state }</span></h5>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                    <h5><b>Zip:</b> <span className="text-black-50">{ this.state.zipcode }</span></h5>
                                    </div>
                                </div>
                               {/*  <div className="row">
                                    <div className="col-md-12">
                                    <h5><b>Country:</b> <span className="text-black-50">{ country[this.state.property.country] }</span></h5>
                                    </div>
                                </div> */}
                                <div className="row">
                                    <div className="col-md-12">
                                    <h5><b>County:</b> <span className="text-black-50">{ this.state.counties }</span></h5>
                                    </div>
                                </div>
                                <div className="row d-dir-row mt-4">
                                    <div className="col-md-12 col-lg-7">
                                        <h1 className="d-inline"><span style={{ fontSize: '30px' }}>${ priceSplitter(this.state.propsPrice) }</span></h1>{/* <h2 className="d-inline">{ priceSplitter(this.state.property.price) }</h2> */}
                                        <h6 className="text-black-50 ml-4">Listing Price</h6>
                                    </div>
                                    <div className="col-md-12 col-lg-5 mb-3">
                                        { this.state.current_user_id ?
                                            <Link to={"/submit-bid/"+this.state.prop_id} className="float-md-right btn-mod btn theme-btn font-weight-bold d-block">Submit Bid</Link>
                                        : <Link to="/sign-up" className="float-md-right btn-mod btn theme-btn font-weight-bold d-block">Signup to make an offer</Link>  }
                                    </div>
                                </div>
                                
                                <div className="row d-dir-row mt-4">
                                    <div className="col-md-12 col-lg-7">
                                    <h5><b>Real-estate Agent:</b> <span className="text-black-50">{ this.state.realtor_info.name+' '+this.state.realtor_info.last_name }</span></h5>
                                    </div>
                                    <div className="col-md-12 col-lg-5">
                                    {this.state.realtors.length===0 ?
                                        <Button className="theme-btn btn-mod float-md-right text-dark font-weight-bold d-block" onClick={this.toggleContactRealtor}>Contact Realtor</Button>
                                        : this.state.realtors.length===1 ? 
                                            <Link to={'/profile/'+this.state.realtors[0].id} className="btn theme-btn font-weight-bold w-100 d-block">Contact Realtor</Link>
                                            : <Link to={'/realtor-list'} className="btn theme-btn font-weight-bold w-100 d-block">Contact Realtor</Link>}
                                    </div>
                                </div>
                               
                                </div>
                            </div>
                        </div>
                    </section>

                    { this.state.ContactRealtor ?
                    <div className="add-realtor-popup-page">
                        <div className="arp-close-btn">
                            <img src="../images/close-btn.svg" onClick={this.toggleContactRealtor} />
                        </div>
                        <div className="add-realtor-popup">
                            <div className="arp-title"><Trans>Contact Realtor</Trans></div>
                            <div className="arp-content container-fluid">
                                <div className="row d-dir-row">
                                    <div className="col-7 mt-2 col-sm-3">
                                        <img src={ this.state.realtor_info.avatar ? UrlService.imagesPath()+'/'+this.state.realtor_info.avatar : defaultImage} className="img-fluid"/>
                                        <div className="text-center mt-3"><Link to={'/profile/'+this.state.realtor_info.id} className="btn btn-block theme-btn">View Profile</Link></div>
                                    </div>
                                    <div className="col-12 col-sm-9">
                                        <div className="row d-dir-row">
                                            <div className="col-12 col-sm-6 font-weight-bold">Realtor Name</div>
                                            <div className="col-12 col-sm-6">{ this.state.realtor_info.name+' '+this.state.realtor_info.last_name }</div>
                                        </div>
                                        <div className="row d-dir-row mt-2">
                                            <div className="col-12 col-sm-6 font-weight-bold">Realtor Email</div>
                                            <div className="col-12 col-sm-6">
                                                {this.state.realtor_info.email ? 
                                                <a href={'mailto:'+this.state.realtor_info.email}>{this.state.realtor_info.email}</a>
                                                : <span>Not Existing</span> }
                                            </div>
                                        </div>
                                        <div className="row d-dir-row mt-2">
                                            <div className="col-12 col-sm-6 font-weight-bold">Mobile Number</div>
                                            <div className="col-12 col-sm-6">
                                                {this.state.realtor_info.mobile_number ?
                                                <a href={'tel:'+this.state.realtor_info.mobile_number}>{this.state.realtor_info.mobile_number}</a>
                                                : <span>Not Existing</span> }
                                            </div>
                                        </div>
                                       
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                : null }


                    {(this.state.showVideoPopup == true) && (
                        <div className="add-realtor-popup-page">
                            <div className="arp-close-btn">
                                <img src="/images/close-btn.svg" onClick={this.hidepopup} />
                            </div>
                            <div className="add-realtor-popup">
                                <div className="arp-title"><Trans>Reverifi Virtual Tour</Trans></div>
                                <div className="arp-content">
                                    <iframe src={"https://www.youtube.com/embed/"+this.state.youtube_video.split('/').pop().split('?v=').pop()} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ height: '54vh', width: '100%' }}></iframe>
                                </div>
                            </div>
                        </div>
                    )}
            </React.Fragment>
        )

    }

}


export default PropertyStatus;