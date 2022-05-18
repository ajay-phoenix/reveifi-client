import React, { Component } from "react";
import { Trans } from "react-i18next";

class Footer extends Component {
  render() {
    return (
      <div className="App">
        <footer className="main-footer">
          <strong><Trans>Copyright &copy; 2014-2020</Trans> <a href="">Reverifi</a>.</strong>
          <Trans>All rights reserved.</Trans>
          <div className="float-right d-none d-sm-inline-block">
            <b><Trans>Version</Trans></b> 3.0.5
          </div>
        </footer>
      </div>
    );
  }
}

export default Footer;