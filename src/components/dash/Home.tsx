import React from 'react';
import { RouteComponentProps } from 'react-router';

interface IHomeProps extends RouteComponentProps<any> {
  readonly isAuthenticated: boolean;
  readonly exact: boolean;
  readonly currentLocation: string;
  readonly path: string;
  readonly component: React.ComponentClass<any> | React.StatelessComponent<any>;
}

export default class Home extends React.Component<IHomeProps>{
	render(){
        return (
            <div>
                Home
            </div>
        );
    }
}