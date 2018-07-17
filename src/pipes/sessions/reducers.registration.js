import Constants from '../app/constants.app';

export default function reducer(state = initialState, action = {}){
	switch (action.type) {
		case Constants.REGISTRATIONS_ERROR:
			return { ...state, errors: action.errors };

		default:
			return state;
	}
}
