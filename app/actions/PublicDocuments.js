import {PublicDocumentsConstants} from '../constants'
import axios from 'axios';

 const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/' : '/';
// const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/' : 'http://carpusconsulting.com/milton/api/';
// const ROOT_URL = 'http://carpusconsulting.com/milton/api/';
const actionsName='PublicDocuments';


//========================================
export function fetchMeetingDocs(groupName) {
    // console.log(actionsName +' fetchMeetings'+JSON.stringify(groupName));
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Meetings/`+ groupName,
      // headers: []
    });
    return dispatch => {
        // console.log('fetchMeetings'+JSON.stringify(groupName));
        request.then( response => {
               dispatch(fetchMeetingsSuccess(groupName, response.data));
            //    console.log(actionsName +'  fetchMeetingDocs... success: ');
          })
          .catch( reason => {
            //   if (isEmpty(reason))  return;
              console.log(actionsName +'  fetchMeetingDocs? : ' + JSON.stringify(reason));
              dispatch(fetchMeetingsFailure(reason));
          })

    }
}
//========================================
export function fetchMeetingsSuccess(groupName, meetingDocs) {
    const action =   {
    type: PublicDocumentsConstants.FETCH_MEETING_DOCS_SUCCESS,
    payload: meetingDocs,
    groupName: groupName
  };
  console.log(actionsName +'  fetchMeetingsSuccess:'+JSON.stringify(action.groupName));
  return action;
}
//========================================
export function fetchMeetingsFailure(error) {
    console.log(actionsName +'  fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_MEETING_DOCS_FAILURE,
    payload: error
  };
}
//========================================
//========================================
//========================================
export function fetchGroupDoc(groupName) {
    console.log(actionsName +'  fetchGroupDocs'+JSON.stringify(groupName));
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Documents/`+ groupName,
      // headers: []
    });
    return dispatch => {
        request.then( response => {
            // dispatch({type: PublicDocumentsConstants.FETCH_GROUP_DOCS, groupName: groupName});

            // console.log(actionsName +'  fetchGroupDocs response '+groupName + ' ' +JSON.stringify(groupName));
               dispatch(fetchGroupDocsSuccess(groupName, response.data));
          })
          .catch( reason => {
              dispatch(fetchGroupDocsFailure(reason));
          })

    }
}
//========================================
export function fetchGroupDocsSuccess(groupName, docs) {
    const action =   {
    type: PublicDocumentsConstants.FETCH_GROUP_DOCS_SUCCESS,
    payload: docs,
    groupName: groupName
  };
  // console.log(actionsName +'  fetchGroupDocsSuccess:'+docs.length);
  // console.log(JSON.stringify(action));
  return action;
}
//========================================
export function fetchGroupDocsFailure(error) {
    console.log(actionsName +'  fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_GROUP_DOCS_FAILURE || 'Fail',
    payload: error
  };
}
//========================================
//========================================
//========================================
export function fetchGroupNotices(groupName) {
    // console.log(actionsName +'  fetchGroupNotices'+JSON.stringify(groupName));
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Notices/`+ groupName,
      // headers: []
    });
    return dispatch => {
        request.then( response => {
               dispatch(fetchGroupNoticesSuccess(groupName, response.data));
          })
          .catch( reason => {
              dispatch(fetchGroupNoticesFailure(reason));
          })

    }
}
//========================================
export function fetchGroupNoticesSuccess(groupName, docs) {
    const action =   {
    type: PublicDocumentsConstants.FETCH_GROUP_NOTICES_SUCCESS,
    payload: docs,
    groupName: groupName
  };
  // console.log(actionsName +'  fetchGroupNoticesSuccess:'+JSON.stringify(docs.length));
  return action;
}
//========================================
export function fetchGroupNoticesFailure(error) {
    console.log(actionsName +'  fetchGroupNoticesFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_GROUP_NOTICES_FAILURE || 'Fail',
    payload: error
  };
}
