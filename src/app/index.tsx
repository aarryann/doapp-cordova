import * as React from "react";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router-dom";
import Routes from "./Routes";
import IStoreState from "./IStoreState";

interface IAppProps extends RouteComponentProps<any> {
  isAuthenticated: boolean;
}

class App extends React.Component<IAppProps> {
  constructor(props: IAppProps) {
    super(props);
  }

  public render() {
    return (
			<React.Fragment>
      	<div id="content-wrapper" className="main-container">
          <Routes isAuthenticated={this.props.isAuthenticated} />
        </div>
			</React.Fragment>
    );
  }

}

function mapStateToProps(state: IStoreState) {
  return {
    isAuthenticated: state.isAuthenticated,
  };
}

// Casting to prevent error where used in index.ts that isBusy is mandatory, since it is being provided by Redux.
export default withRouter(
  connect<{}, {}, IAppProps, IStoreState>(mapStateToProps)(App)
) as React.ComponentClass<any>;