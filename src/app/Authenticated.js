import React from 'react';
import {connect} from 'react-redux';
import {routerActions} from 'react-router-redux';
import { withRouter, Route } from 'react-router-dom';

import Actions from '../pipes/sessions/actions.session';

class AuthenticatedRoute extends React.Component{
	constructor(props) {
		super(props);
	}	

	componentWillMount(){
		this._checkAuth(this.props);
	}

	shouldComponentUpdate(nextProps, nextState){
		const update = !this._signIn(nextProps);
		return update;
	}

	_checkAuth(params){
		if (!this._signIn(params)){
			const {dispatch, currentUser} = params;
			if (!currentUser){
			  // If user refreshes browser or revisits signin without logging out
			  // ... the current user will need to be regenerated to put currentUser in store
				dispatch>(Actions.currentUser());
			}
		}
	}

	_signIn(params){
		const {dispatch, location} = params;
		const phoenixAuthToken = localStorage.getItem('phoenixAuthToken');

		if (!phoenixAuthToken && location.pathname !== '/sign_in'){
			dispatch(routerActions.push('/sign_in'));
		}
		return (phoenixAuthToken == null);
	}

	render(){
		return (
			<React.Fragment>
      	<div id="content-wrapper" className="main-container">
      		<Route {...this.props} />
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	currentUser: state.session.currentUser,
});

export default withRouter(connect(mapStateToProps)(AuthenticatedRoute)) ;
