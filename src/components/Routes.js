import React 													from 'react';
import { Route, Switch, withRouter } 	from 'react-router-dom';

import AuthenticatedRoute 						from './Authenticated';
import SignIn 												from '../scenes/Session';
import Boards 													from '../scenes/Board';

class Routes extends React.Component{
	render(){
		return(
			<Switch>
				<Route exact path="/sign_in" component={SignIn} />
				<AuthenticatedRoute exact path="/" component={Boards} />
			</Switch>
		);
	}
}

export default withRouter(Routes);
