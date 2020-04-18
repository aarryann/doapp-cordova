import React from "react";
//import { Dispatch } from "redux";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router-dom";
//import { routerActions } from 'react-router-redux';

import Routes from "./Routes";
import Header from "../components/header/Header";
import IStoreState from "./IStoreState";

class App extends React.Component {
  constructor( props ) {
    super(props);
  }

  _renderHeader() {
    const { isAuthenticated } = this.props;
    if(!isAuthenticated) return false;

    return (
      <Header></Header>
    );
  }

  render() {
    /*
		const {dispatch, location} = this.props;
		const phoenixAuthToken = localStorage.getItem('phoenixAuthToken');

		if (!phoenixAuthToken && location.pathname !== '/sign_in'){
			dispatch(routerActions.push('/sign_in'));
		}
    return (phoenixAuthToken == null);
    */
    return (
			<React.Fragment>
        {this._renderHeader()}
      	<div id="content-wrapper" className="main-container">
          <Routes isAuthenticated={this.props.isAuthenticated} />
        </div>
			</React.Fragment>
    );
  }

}

function mapStateToProps(state) {
  return {
    isAuthenticated: state.session.isAuthenticated,
  };
}

// Casting to prevent error where used in index.ts that isBusy is mandatory, since it is being provided by Redux.
export default withRouter(
  connect(mapStateToProps)(App)
);