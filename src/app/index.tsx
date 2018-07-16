import * as React from "react";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps } from "react-router-dom";
//import { withRouter } from "react-router-dom";
import Routes from "../components/Routes";
import IStoreState from "./IStoreState";

interface IAppProps extends RouteComponentProps<any> {
//interface IApProps{
  isAuthenticated: boolean;
}

class App extends React.Component<IAppProps> {
  constructor(props: IAppProps) {
    super(props);
  }

  public render() {
    return (
      <div>
        <div className="container-fluid">
          <Routes isAuthenticated={this.props.isAuthenticated} />
        </div>
      </div>
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