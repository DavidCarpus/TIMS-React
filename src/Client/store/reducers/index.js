import { combineReducers } from 'redux';
import AgendasAndMinutesReducer from './AgendasAndMinutes';
import GroupDocumentsReducer from './GroupDocuments';
import PublicRecordsNoticesReducer from './PublicRecords_Notices';
import OrganizationalUnitsReducer from './OrganizationalUnitData';
import MainMenusReducer from './MainMenuData';
import FAQReducer from './FAQData';
import PageAsidesReducer from './PageAsides';
import EB2ServicesReducer from './EB2Services';
import SystemIndexReducer from './SystemIndex';
import CalendarDataReducer from './CalendarData';
import SingleNoticeReducer from './SingleNotice';
import { routerReducer as routing } from 'react-router-redux';
import PublicRecordsReducer from './PublicRecords';
import AlertRequestsReducer from './AlertRequests';
import AuthenticationReducer from './Authentication';
import ChangeRequestsReducer from './ChangeRequests';
import StaticPageReducer from './StaticPage';
import FileViewerReducer from './FileViewer';

import NewsDataReducer from './NewsData';
import { reducer as formReducer } from 'redux-form'



// import { reducer as formReducer } from 'redux-form';

const rootReducer = combineReducers({
    agendasAndMinutes: AgendasAndMinutesReducer,
    GroupDocuments:GroupDocumentsReducer,
    PublicNotices: PublicRecordsNoticesReducer,
    OrganizationalUnits: OrganizationalUnitsReducer,
    FAQ: FAQReducer,
    MainMenus : MainMenusReducer,
    PageAsides : PageAsidesReducer,
    EB2Services: EB2ServicesReducer,
    SingleNotice: SingleNoticeReducer,
    AlertRequests: AlertRequestsReducer,
    SystemIndex: SystemIndexReducer,
    CalendarData: CalendarDataReducer,
    PublicRecords: PublicRecordsReducer,
    Authentication: AuthenticationReducer,
    ChangeRequests: ChangeRequestsReducer,
    NewsData: NewsDataReducer,
    StaticPage:StaticPageReducer,
    FileViewer: FileViewerReducer,

    routing,
    form: formReducer
});

export default rootReducer;
