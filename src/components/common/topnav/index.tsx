import React, { Component } from "react";
import { Trans } from "react-i18next";
import {Link} from 'react-router-dom';

class TopNav extends Component {
    render() {
        return (
            <>
            
                <nav className="navbar navbar-expand-lg navbar-light bg-white w-100 d-md-none">
                <img src="../images/reverifi-logo.png" className="navbar-brand" style={{ height: '40px' }}/>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                      <ul className="navbar-nav mr-auto">
                        <li className="nav-item active">
                          <a className="nav-link" href="https://www.reverifi.com"><Trans>Home</Trans></a>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" href="https://www.reverifi.com/about.html"><Trans>About Us</Trans></a>
                        </li>
                        {/* <li className="nav-item">
                            <Link to="/realtors-leaderboard" className="nav-link"><Trans>Realtors Leaderboard</Trans></Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/lenders-leaderboard" className="nav-link"><Trans>Lenders Leaderboard</Trans></Link>
                        </li> */}
                        <li className="nav-item">
                            <a className="nav-link" href="https://www.reverifi.com/contact.html"><Trans>Contact Us</Trans></a>
                        </li>
                       
                    </ul>
                  </div>
                </nav>
            
            <header className="loginheader">
                <div className="lh-logo-box d-md-block">
                    <img src="../images/reverifi-logo.png"/>
                </div>

                <ul className="lh-navigation-list d-md-block">
                    <li>
                        <a href="https://www.reverifi.com">
                            <Trans>Home</Trans>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.reverifi.com/about.html">
                            <Trans>About Us</Trans>
                        </a>
                    </li>
                    {/* <li>
                        <Link to="/public-properties">
                            <Trans>Public Properties</Trans>
                        </Link>
                    </li> */}
                   {/*  <li>
                        <Link to="/realtors-leaderboard">
                            <Trans>Realtors Leaderboard</Trans>
                        </Link>
                    </li>
                    <li>
                        <Link to="/lenders-leaderboard">
                            <Trans>Lenders Leaderboard</Trans>
                        </Link>
                    </li> */}
                    <li>
                        <a href="https://www.reverifi.com/contact.html">
                            <Trans>Contact Us</Trans>
                        </a>
                    </li>
                </ul>
            </header>
        </>
        );
    }
}
export default TopNav;