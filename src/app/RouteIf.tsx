import * as React from "react";
import {
  Redirect,
  Route,
  RouteComponentProps,
  RouteProps
} from "react-router-dom";

interface IAuthenticatedRouteProps extends RouteProps {
  readonly condition: boolean;
  readonly elsePath: string;
  readonly component: React.ComponentClass<any> | React.StatelessComponent<any>;
}

export default function RouteIf({
  component,
  elsePath,
  condition,
  ...rest
}: IAuthenticatedRouteProps) {
  const Component = component;

  const render = (renderProps: RouteComponentProps<any>) => {
    let element = (
      <Redirect
        to={{
          pathname: elsePath,
          state: { from: renderProps.location }
        }}
      />
    );

    if (condition) {
      element = <Component {...renderProps} />;
    }

    return element;
  };

  return <Route {...rest} render={render} />;
}