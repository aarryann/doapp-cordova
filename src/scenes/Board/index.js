import React                from 'react';
import { connect }          from 'react-redux';
import classnames           from 'classnames';

import { setDocumentTitle } from '../../services/utils';
import Actions              from '../../pipes/boards/actions.board';

class Board extends React.Component {
  componentDidMount() {
    setDocumentTitle('Boards');
    this.props.dispatch(Actions.fetchBoards());
  }

  componentWillUnmount() {
    this.props.dispatch(Actions.reset());
  }

  _renderOwnedBoards() {
    const { fetching } = this.props.boards;

    let content = false;

    const iconClasses = classnames({
      fa: true,
      'fa-user': !fetching,
      'fa-spinner': fetching,
      'fa-spin':    fetching,
    });

    if (!fetching) {
      content = (
        <div className="boards-wrapper">
        </div>
      );
    }

    return (
      <section>
        <header className="view-header">
          <h3><i className={iconClasses} /> My boards</h3>
        </header>
        {content}
      </section>
    );
  }

  _renderOtherBoards() {
    const { invitedBoards } = this.props.boards;

    if (invitedBoards.length === 0) return false;

    return (
      <section>
        <header className="view-header">
          <h3><i className="fa fa-users" /> Other boards</h3>
        </header>
        <div className="boards-wrapper">
        </div>
      </section>
    );
  }

  _renderAddButton() {
    return (
      <div className="board add-new">
        <div className="inner">
          <a id="add_new_board">Add new board...</a>
        </div>
      </div>
    );
  }

  _handleAddNewClick() {
    let { dispatch } = this.props;

    dispatch(Actions.showForm(true));
  }

  _handleCancelClick() {
    this.props.dispatch(Actions.showForm(false));
  }

  render() {
    return (
      <div className="view-container boards index">
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  boards: state.boards,
  socket: state.session.socket
});

export default connect(mapStateToProps)(Board);
