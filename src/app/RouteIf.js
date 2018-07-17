import * as React from "react";
import { Redirect, Route } from "react-router-dom";

export default function RouteIf({ component, elsePath, condition, ...rest }) {
  const Component = component;

  const render = (renderProps) => {
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