import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';
import session from './sessions/reducers.session';
import boards from './boards/reducers.board';
import IStoreState from '../app/IStoreState';

export default combineReducers({
	routing: routerReducer,
	session: session,
	boards: boards,
});
