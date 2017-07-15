import { combineReducers } from 'redux';
import AgendasAndMinutesReducer from './AgendasAndMinutes';
import PublicRecordsReducer from './PublicRecords';
import PublicRecordsNoticesReducer from './PublicRecords_Notices';
import OrganizationalUnitsReducer from './OrganizationalUnitData';
import MainMenusReducer from './MainMenuData';
import FAQReducer from './FAQData';
import PageAsidesReducer from './PageAsides';
import EB2ServicesReducer from './EB2Services';
import SystemIndexReducer from './SystemIndex';
import CalendarDataReducer from './CalendarData';
import { routerReducer as routing } from 'react-router-redux';


// import { reducer as formReducer } from 'redux-form';

const rootReducer = combineReducers({
    agendasAndMinutes: AgendasAndMinutesReducer,
    PublicRecords: PublicRecordsReducer,
    PublicNotices: PublicRecordsNoticesReducer,
    OrganizationalUnits: OrganizationalUnitsReducer,
    FAQ: FAQReducer,
    MainMenus : MainMenusReducer,
    PageAsides : PageAsidesReducer,
    EB2Services: EB2ServicesReducer,
    SystemIndex: SystemIndexReducer,
    CalendarData: CalendarDataReducer,
    routing
});

export default rootReducer;
