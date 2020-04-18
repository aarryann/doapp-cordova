import React from 'react';
import { Route, Switch } from 'react-router-dom';

import RouteIf from './RouteIf';
import SignIn from '../scenes/Session';
//import Boards from '../scenes/Board';
//import Home from '../components/dash/Home';
import Dash from '../components/dash/Dash';

export default function Routes(props){
	let signInPath = "/sign_in";
	return(
		<Switch>
			<Route exact path={signInPath} component={SignIn} />
			<RouteIf exact path="/" component={Dash} condition={props.isAuthenticated} elsePath={signInPath} />
		</Switch>
	);
}
