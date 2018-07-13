import React                from 'react';
import { connect }          from 'react-redux';
import { Link }             from 'react-router-dom';

import { setDocumentTitle } from '../../services/utils';
import Actions              from '../../pipes/sessions/actions.session';

class SignIn extends React.Component{
  componentDidMount() {
    setDocumentTitle('Sign in');
  }

  _handleSubmit(e) {
    e.preventDefault();

    const { email, password } = this.refs;
    console.log(email.value + ":" + password.value);
    const { dispatch } = this.props;
    dispatch(Actions.signIn(email.value, password.value));
  }

  _renderError() {
    const { error } = this.props;
    if(!error) return false;

    return (
      <div className="error">
        {error}
      </div>
    );
  }

  render(){
    return(
      <div className="container-fluid mt-5 pt-5">
        <div className="row">
          <div className="col-md-4 mx-auto">
            <div className="card mb-4">
              <div className="card-header text-center">
                <h3>Sign in to DoMore</h3>
                <small>Start being extremely productive!!</small>
              </div>
              <div className="card-body">
                <form onSubmit={this._handleSubmit.bind(this)}>
                  {this._renderError()}
                  <div className="form-group">
                    <input ref="email" type="Email" placeholder="Email" required="true" defaultValue="john@be.com" className="form-control with-border"/>
                  </div>
                  <div className="form-group">
                    <input ref="password" type="password" placeholder="Password" required="true" defaultValue="12345678" className="form-control with-border"/>
                  </div>
                  <button type="submit" className="btn btn-success btn-block">Sign in</button>
                  <Link to="/sign_up" className="btn btn-outline-default btn-block">Sign up</Link>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => (
  state.session
);

export default connect(mapStateToProps)(SignIn);
