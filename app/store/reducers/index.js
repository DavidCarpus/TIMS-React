import { combineReducers } from 'redux';
import AgendasAndMinutesReducer from './AgendasAndMinutes';
import PublicRecordsReducer from './PublicRecords';

import { reducer as formReducer } from 'redux-form';

const rootReducer = combineReducers({
    agendasAndMinutes: AgendasAndMinutesReducer,
    PublicRecords: PublicRecordsReducer
});

export default rootReducer;
