import {PublicDocumentsConstants} from '../constants'
import axios from 'axios';

 const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/' : '/';

 //========================================
// http://stackoverflow.com/questions/4994201/is-object-empty
var hasOwnProperty = Object.prototype.hasOwnProperty;
function isEmpty(obj) {
    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    if (typeof obj !== 'object') return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}
//========================================
export function fetchMeetingDocs(groupName) {
    // console.log('fetchMeetings'+JSON.stringify(groupName));
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Meetings/`+ groupName,
      // headers: []
    });
    return dispatch => {
        // console.log('fetchMeetings'+JSON.stringify(groupName));
        request.then( response => {
               dispatch(fetchMeetingsSuccess(groupName, response.data));
            //    console.log('fetchMeetingDocs... success: ');
          })
          .catch( reason => {
            //   if (isEmpty(reason))  return;
            //   console.log('fetchMeetingDocs? : ' + JSON.stringify(reason));
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
  // console.log('fetchMeetingsSuccess:'+JSON.stringify(action));
  return action;
}
//========================================
export function fetchMeetingsFailure(error) {
    console.log('fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_MEETING_DOCS_FAILURE,
    payload: error
  };
}
//========================================
//========================================
//========================================
export function fetchGroupDoc(groupName) {
    // console.log('fetchGroupDocs'+JSON.stringify(groupName));
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Documents/`+ groupName,
      // headers: []
    });
    return dispatch => {
        request.then( response => {
            // console.log('fetchGroupDocs response'+JSON.stringify(response.data.length));
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
  console.log('fetchGroupDocsSuccess:'+docs.length);
  // console.log(JSON.stringify(action));
  return action;
}
//========================================
export function fetchGroupDocsFailure(error) {
    console.log('fetchMeetingsFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_GROUP_DOCS_FAILURE || 'Fail',
    payload: error
  };
}
//========================================
//========================================
//========================================
export function fetchGroupNotices(groupName) {
    console.log('fetchGroupNotices'+JSON.stringify(groupName));
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
  console.log('fetchGroupNoticesSuccess:'+JSON.stringify(action));
  return action;
}
//========================================
export function fetchGroupNoticesFailure(error) {
    console.log('fetchGroupNoticesFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_GROUP_NOTICES_FAILURE || 'Fail',
    payload: error
  };
}
