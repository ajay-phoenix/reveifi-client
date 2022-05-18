import React, {Component} from "react";
import {connect} from "react-redux";

import UserStateInterface from "../../../interfaces/UserStateInterface";
import UserService from "../../../services/UserService";
import { setUser } from './../../../redux/actions/index';

interface Props {
  user: UserStateInterface;
  setUser: typeof setUser;
}

class Layout extends Component<Props> {
    async componentDidMount() {
        const response = await UserService.getCurrentUserProfile();
        this.props.setUser(response);
    }
    render() {
        return (
            <React.Fragment>

            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, { setUser })(Layout);