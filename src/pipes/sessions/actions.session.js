import { routerActions }                  from 'react-router-redux';
import { Socket }                         from 'phoenix';

import { apiCall }                        from '../../services/utils/apicall.utils';

import SessionConstants                   from './constants.session';
import AppConstants                       from '../app/constants.app';
import BoardConstants                     from '../boards/constants.board';
import schema                             from './schema.session';
//import { httpGet, httpPost, httpDelete }  from '../../services/utils';

const Actions = {
  setCurrentUser: (dispatch, user) => {
    const socket = new Socket('ws://10.0.2.2:4000/socket', {
    //const socket = new Socket('ws://localhost:4000/socket', {
        params: { token: localStorage.getItem('phoenixAuthToken') },
      logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data);
      },
    });

    // Add socket to global variable, to be controlled through online / offline event listener
    if(window.cordova){
      window.SDATA.socket = socket;
    }
    socket.connect();

    const channel = socket.channel(`users:${user.id}`);

    if (channel.state !== 'joined') {
      channel.join().receive('ok', () => {
        dispatch({
          type: SessionConstants.CURRENT_USER,
          currentUser: user,
          socket: socket,
          channel: channel,
        });
      });
    }

    channel.on('boards:add', (msg) => {
      dispatch({
          type: BoardConstants.BOARDS_ADDED,
          board: msg.board,
        });
    });
  },

  // On signin click
  signIn: (email, password) => {
    return dispatch => {
      // graphql query for local authentication
      const query = 'query LocalAuthentication ($email: String!, $password: String!) { localAuth(email: $email, password: $password) { jwt user { id email password } } }';
      // values for user auth
      const payload = {
        schema: schema,
        query: query,
        values: {
          email: email,
          password: password,
        },
      };
      // Local auth in cordova mode, or remote call in web mode
      const response = apiCall('api/v1/sessions', payload, window.cordova?"local":"post");
      response
      .then(async (data) => {
        try{
          //console.log( JSON.stringify(data, null, " ") );
          if(window.cordova){
            if(!data.data && !data.data.localAuth){
              throw Error ("signIn local Error");
            }
            data = data.data.localAuth;
            //Cordova mode
            // Add event listeners to connect or disconnect socket as app becomes online / offline
          	document.addEventListener("offline", () => { console.log('++++++++++OFFLINE AGAIN++++++++++'); Actions.endRemoteSync(); }, false);
          	document.addEventListener("online", () => { console.log('++++++++++ONLINE AGAIN++++++++++'); Actions.startRemoteSync(dispatch, payload); }, false);
            if(window.navigator.connection.type !== window.Connection.NONE){
              // If online, setup authtoken and socket connection right away.
              // If offline, event listener will add these when online
          	  Actions.startRemoteSync(dispatch, payload);
            }
          } else {
            //Web application mode
            localStorage.setItem('phoenixAuthToken', data.jwt);
            Actions.setCurrentUser(dispatch, data.user);
          }
          // signed in, go to landing page
          // Note: authtoken may not be available at this stage in cordova mode (offline or async delay)
          dispatch({
            type: SessionConstants.CURRENT_USER,
            currentUser: data.user
          });
          dispatch(routerActions.push('/'));
        }
        catch(e){
          console.log("Error signin.then: " + e);
        }
      })
      .catch((error) => {
        error.response.json()
        .then((errorJSON) => {
          dispatch({
            type: SessionConstants.SESSIONS_ERROR,
            error: errorJSON.error,
          });
        });
      });
    };
  },

  startRemoteSync: async (dispatch, payload) => {
    try{
      // Only for cordova mode
      // startSync will be called when connection is online
    	const phoenixAuthToken = localStorage.getItem('phoenixAuthToken');
      // If authtoken has not been set, make a remote post call and get authtoken from server
      // set the authtoken in local localStorage
    	if (!phoenixAuthToken){
        const result = await apiCall('api/v1/sessions', payload, 'post');
        // If connection is spotty and post call to server does not make through, local storage will not be set
        // If localStorage is not set, startSync and post call to the server will be called again at next online
        if(result.jwt){
          localStorage.setItem('phoenixAuthToken', result.jwt);
          Actions.setCurrentUser(dispatch, result.user);
        }
      }
      const socket = window.SDATA.socket;
      // After socket is established, when offline, socket has been disconnected.
      // If online after offline, reconnect the socket
      if(socket && !socket.isConnected()){
        console.log('Socket connect');
        socket.connect();
      }
    }
    catch(e){
      console.log("Error startSync: " + e);
    }
  },

  endRemoteSync: () => {
    try{
      // delSync will be called when connection is online
      const socket = window.SDATA.socket;
      //If socket is established, disconnect socket on offline
      if(socket){
        console.log('Socket disconnect');
        socket.disconnect();
      }
    }
    catch(e){
      console.log("Error delSync: " + e);
    }
  },

  // If user refreshes browser or revisits signin without logging out
  // ... the current user will need to be regenerated to put currentUser in store
  currentUser: () => {
    return dispatch => {
      /*
      httpGet('/api/v1/current_user')
      .then(function (data) {
          dispatch({
            type: SessionConstants.CURRENT_USER,
            currentUser: data.user
          });
        Actions.setCurrentUser(dispatch, data);
      })
      .catch(function (error) {
        console.log(error);
        dispatch(routerActions.push('/'));
      });
      */
    };
  },

  signOut: () => {
    return dispatch => {
      /*
      httpDelete('/api/v1/sessions')
      .then((data) => {
        localStorage.removeItem('phoenixAuthToken');
        dispatch(routerActions.push('/'));
        dispatch({ type: SessionConstants.USER_SIGNED_OUT, });
        dispatch({ type: BoardConstants.BOARDS_FULL_RESET });
      })
      .catch(function (error) {
        console.log(error);
      });
      */
    };
  },
};

export default Actions;
