import React 							from 'react';
import { Route, Switch, withRouter, RouteComponentProps } 	from 'react-router-dom';

import AuthenticatedRoute 				from './Authenticated';
import SignIn 							from '../scenes/Session';
//import Boards 							from '../scenes/Board';
import Dash from '../components/dash/Dash';

interface IRouteProps extends RouteComponentProps<any> {
  isAuthenticated: boolean;
}
class Routes extends React.Component<IRouteProps>{
	render(){
		return(
			<Switch>
				<Route exact path="/sign_in" component={SignIn} />
				<AuthenticatedRoute exact path="/" component={Dash} />
			</Switch>
		);
	}
}

export default withRouter(Routes);
