import SessionConstants from './constants.session';

const initialState = {
  isAuthenticated: false,
  currentUser: null,
  socket: null,
  channel: null,
  error: null,
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case SessionConstants.CURRENT_USER:
      return { ...state, isAuthenticated: true, currentUser: action.currentUser, socket: action.socket, channel: action.channel, error: null };

    case SessionConstants.USER_SIGNED_OUT:
      return initialState;

    case SessionConstants.SESSIONS_ERROR:
      return { ...state, error: action.error };

    default:
      return state;
  }
}
