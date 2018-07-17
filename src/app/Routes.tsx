import React from 'react';
import { Route, Switch, withRouter, RouteComponentProps } from 'react-router-dom';

import AuthenticatedRoute from './AuthenticatedRoute';
import SignIn from '../scenes/Session';
//import Boards from '../scenes/Board';
//import Dash from '../components/dash/Dash';
import Home from '../components/dash/Home';

interface IRouteProps {
  isAuthenticated: boolean;
}
export default function Routes(props: IRouteProps){
	return(
		<Switch>
			<Route exact path="/sign_in" component={SignIn} />
			<AuthenticatedRoute exact path="/" component={Home} />
		</Switch>
	);
}
