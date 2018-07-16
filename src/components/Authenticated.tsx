import React 					from 'react';
import {Dispatch} 				from 'redux';
import {connect}				from 'react-redux';
import {routerActions} 			from 'react-router-redux';
import { RouteComponentProps, withRouter, Route } 	from 'react-router-dom';

import IState 					from '../pipes/sessions/ISessionState';
import Actions 					from '../pipes/sessions/actions.session';

interface IAppProps extends RouteComponentProps<any> {
	dispatch: Dispatch,
	currentUser: string,
	location: any
}

class AuthenticatedRoute extends React.Component<IAppProps>{
	constructor(props: IAppProps) {
		super(props);
	}	

	componentWillMount(){
		this._checkAuth(this.props);
	}

	shouldComponentUpdate(nextProps: IAppProps, nextState: IState){
		const update = !this._signIn(nextProps);
		return update;
	}

	_checkAuth(params: IAppProps){
		if (!this._signIn(params)){
			const {dispatch, currentUser} = params;
			if (!currentUser){
			  // If user refreshes browser or revisits signin without logging out
			  // ... the current user will need to be regenerated to put currentUser in store
				dispatch<any>(Actions.currentUser());
			}
		}
	}

	_signIn(params: IAppProps){
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

const mapStateToProps = (state: IState) => ({
	currentUser: state.session.currentUser,
});

export default withRouter(connect<{}, {}, IAppProps, IState>(mapStateToProps)(AuthenticatedRoute)) as React.ComponentClass<any> ;
