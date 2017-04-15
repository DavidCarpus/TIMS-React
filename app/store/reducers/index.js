import { combineReducers } from 'redux';
import AgendasAndMinutesReducer from './AgendasAndMinutes';
import PublicRecordsReducer from './PublicRecords';
import PublicRecordsNoticesReducer from './PublicRecords_Notices';

import { reducer as formReducer } from 'redux-form';

const rootReducer = combineReducers({
    agendasAndMinutes: AgendasAndMinutesReducer,
    PublicRecords: PublicRecordsReducer,
    PublicNotices: PublicRecordsNoticesReducer,
});

export default rootReducer;
