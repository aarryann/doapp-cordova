import {combineReducers} 		from 'redux';
import {routerReducer} 			from 'react-router-redux';
import session              from './sessions/reducers.session';
import boards               from './boards/reducers.board';

export default combineReducers({
	routing: routerReducer,
	session: session,
	boards: boards,
});
