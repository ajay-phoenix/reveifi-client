import React, { Component } from "react";

import { AdminTopNav, SideBar } from "components/common/imports/navigations";
import { UserService, UrlService } from "services/imports/index";

import { Trans } from "react-i18next";
import moment from "moment";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import $ from 'jquery';

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
            showVideoPopup: false
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
            current_user_id: current_user.userProfile.id,
            loading: 'false',
            nav1: this.slider1,
            nav2: this.slider2
        });

        $('.slick-arrow.slick-prev').html('')
        $('.slick-arrow.slick-next').html('')
    }

    async delistProperty(){
        const propId = window.location.pathname.split("/").pop();
        var delist_property = await UserService.delistProperty(propId);
        if(delist_property.success){
            alert('Property Delisted Successfully!');
            window.location.href='/my-properties';
        }
    }

    showVideoPopup = () => {
        if (this.state.showVideoPopup == true) {
            this.setState({ showVideoPopup: false })
        } else {
            this.setState({ showVideoPopup: true })
        }
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
                <AdminTopNav handler={this.handler}></AdminTopNav>
                <SideBar handler={this.handler}></SideBar>
                <section className="property-status-section">
                    <div className="ps-title">
                        <div className="backbtn-box">
                            <Link to={'/my-properties'}>
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
                            <div className="col-md-5 mt-5 text-center images-slider"> 
                                <Slider asNavFor={this.state.nav2} ref={slider => (this.slider1 = slider)} className="position-relative">
                                    {this.state.images.map((image, i)=>{
                                        return <div className="col-md-12" key={i}>
                                            <img src={UrlService.imagesPath() + '/' +image} className="top-slider-image"/>
                                        </div>
                                    })}
                                        
                                </Slider>

                                {this.state.images!=0 && this.state.youtube_video ? 
                                    <button className="btn theme-btn mt-2 font-weight-bold ml-2" onClick={()=>this.showVideoPopup()}>Reverifi Virtual Tour</button>
                                : null }
                                
                                <Slider asNavFor={this.state.nav1}
                                ref={slider => (this.slider2 = slider)}
                                slidesToShow={3}
                                swipeToSlide={true}
                                focusOnSelect={true}
                                {...bottomSlider}
                                className="mt-5 hide-slider-buttons">
                                    {this.state.images.map((image, i)=>{
                                        return <div className="col-md-12" key={i}>
                                            <img src={UrlService.imagesPath() + '/' +image} className="bottom-slider-image"/>
                                        </div>
                                    })}
                                </Slider>


                                {this.state.images==0 ? <>
                                <img src={UrlService.imagesPath() + '/' + this.state['media']} className="img-fluid" style={{ height: '400px', objectFit: 'contain' }} />
                                    {this.state.youtube_video ? 
                                        <button className="btn theme-btn mt-2 font-weight-bold ml-2" onClick={()=>this.showVideoPopup()}>Reverifi Virtual Tour</button>
                                    : null }</>
                                : null}
                            </div>
                            <div className="col-md-7 mt-5"> 
                                <div className="psp-price-row">
                                    <div className="psp-price-left-box">
                                        <div className="psp-amount-box">
                                            ${priceSplitter(this.state['propsPrice'])}
                                        </div>
                                        <div className="psp-tag"><Trans>Listing Price</Trans></div>
                                    </div>
                                    <div className="psp-price-right-box">
                                        <div className="psp-amount-box">
                                            ${priceSplitter(this.state['propsPrice'])}
                                        </div>
                                        <div className="psp-tag"><Trans>Listing Price</Trans></div>
                                        <div
                                            className="psp-date"> {moment(this.state['cDate']).format('MM/DD/YYYY hh:mm A')}</div>
                                    </div>
                                </div>
                                <ul className="psp-property-detail-list">
                                    {/* <li>
                                        <b><Trans>Title</Trans>:</b>
                                        <span><Trans>{this.state['title']}</Trans></span>
                                    </li> */}
                                    <li>
                                        <b><Trans>Street</Trans>:</b>
                                        <span><Trans>{this.state['address']}</Trans></span>
                                    </li>
                                    <li>
                                        <b><Trans>Town/ City</Trans>:</b>
                                        <span><Trans>{this.state['city']}</Trans></span>
                                    </li>
                                   
                                    <li>
                                        <b><Trans>State</Trans>:</b>
                                        <span><Trans>{this.state['state']}</Trans></span>
                                    </li>
                                    <li className="psp-pdl-mls">
                                        <b><Trans>Zipcode</Trans>:</b>
                                        <span><Trans>{this.state['zipcode']}</Trans></span>
                                    </li>
                                    {this.state['mls_link'] ?
                                        <li>
                                            <b><Trans>MLS Link</Trans>:</b>
                                            <span><Trans>{this.state['mls_link']}</Trans></span>
                                        </li>
                                    : null }
                                   {/*  <li>
                                        <b><Trans>Country</Trans>:</b>
                                        <span><Trans>{country[this.state['country']]}</Trans></span>
                                    </li> */}
                                    <li>
                                        <b><Trans>County</Trans>:</b>
                                        <span><Trans>{this.state['counties']}</Trans></span>
                                    </li>
                                </ul>
                                
                                {this.state.current_user_id==this.state.seller_id || this.state.current_user_id==this.state.selling_realtor_id ?
                                    <><button className="btn btn-danger mt-2" onClick={()=>this.delistProperty()}>Delist Property</button>
                                    <Link to={"/edit-listing/"+this.state.prop_id} className="btn btn-light-primary mt-2 ml-2 text-light">Edit Listing</Link></>
                                : null }

                                </div>
                            </div>
                        </div>
                    </section>



                    {(this.state.showVideoPopup == true) && (
                        <div className="add-realtor-popup-page">
                            <div className="arp-close-btn">
                                <img src="/images/close-btn.svg" onClick={this.hidepopup} />
                            </div>
                            <div className="add-realtor-popup">
                                <div className="arp-title"><Trans>Reverifi Virtual Tour</Trans></div>
                                <div className="arp-content">
                                    { console.log(this.state.youtube_video.split('/').pop().split('?v=').pop()) }

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