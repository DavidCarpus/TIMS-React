import { combineReducers } from 'redux';
// import PostsReducer from './reducer_posts';
// import UserReducer from './reducer_user';
// import ValidateUserFieldsReducer from './reducer_validateUserFields';
// import ResendEmailReducer from './reducer_resendEmail';
// import UpdateEmailReducer from './reducer_updateEmail';
// import AgendasAndMinutesReducer from './AgendasAndMinutes';
import { reducer as formReducer } from 'redux-form';

const rootReducer = combineReducers({
    // agendasAndMinutes: AgendasAndMinutesReducer
  // user: UserReducer,
  // validateFields: ValidateUserFieldsReducer,
  // posts: PostsReducer, //<-- Posts
  // form: formReducer, // <-- redux-form
  // resendEmail: ResendEmailReducer,
  // updateEmail: UpdateEmailReducer
});

export default rootReducer;
