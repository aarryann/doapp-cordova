import Constants from '../app/constants.app';
import { IRegistrationState } from '../../app/IStoreState';

const initialState: IRegistrationState = {
	errors: null,
};

export default function reducer(state: IRegistrationState = initialState, action: IRegistrationState = {}){
	switch (action.type) {
		case Constants.REGISTRATIONS_ERROR:
			return { ...state, errors: action.errors };

		default:
			return state;
	}
}
