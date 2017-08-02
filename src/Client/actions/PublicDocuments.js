import {PublicDocumentsConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
const actionsName='PublicDocuments';
//========================================
export function fetchMeetingDocs(groupName) {
    if (! groupName && process.env.NODE_ENV === 'development') {
        debugger; // eslint-disable-line no-debugger
    }

    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Meetings/`+ groupName,
      // headers: []
    });
    return dispatch => {
        dispatch({type: PublicDocumentsConstants.FETCH_MEETING_DOCS});
        request.then( response => {
               dispatch(fetchMeetingsSuccess(groupName, response.data));
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
  // console.log(actionsName +'  fetchMeetingsSuccess:'+JSON.stringify(action.groupName));
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
    if (! groupName && process.env.NODE_ENV === 'development' ) {
        debugger; // eslint-disable-line no-debugger
    }

    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Documents/`+ groupName,
      // headers: []
    });

    return dispatch => {
        dispatch({type: PublicDocumentsConstants.FETCH_GROUP_DOCS});

        request.then( response => {
            // console.log(actionsName +'  fetchGroupDocs response '+groupName + ' ' +JSON.stringify(groupName));
               dispatch(fetchGroupDocsSuccess(groupName, response.data));
          })
          .catch( reason => {
            //   console.log("fetchGroupDocsFailure?? : ", request);
              dispatch(fetchGroupDocsFailure(groupName, reason));
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
export function fetchGroupDocsFailure(groupName, error) {
    // console.log(actionsName + '-' +groupName + '  fetchGroupDocsFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_GROUP_DOCS_FAILURE || 'Fail',
    payload: error
  };
}
//========================================
//========================================
//========================================
//========================================
export function fetchPublicDocs(recordtype) {
    if (! recordtype && process.env.NODE_ENV === 'development') {
        debugger; // eslint-disable-line no-debugger
    }

    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/PublicDocs/`+ recordtype,
      // headers: []
    });
    return dispatch => {
        dispatch({type: PublicDocumentsConstants.FETCH_PUBLIC_DOCS});
        request.then( response => {
               dispatch(fetchPublicDocsSuccess(recordtype, response.data));
          })
          .catch( reason => {
            //   if (isEmpty(reason))  return;
            //   console.log(actionsName +'  fetchPublicDocDocs? : ' + JSON.stringify(reason));
              dispatch(fetchPublicDocsFailure(reason));
          })

    }
}
//========================================
export function fetchPublicDocsSuccess(recordtype, meetingDocs) {
    // console.log(actionsName +'  fetchPublicDocsSuccess?:'+JSON.stringify(recordtype));

    const action =   {
    type: PublicDocumentsConstants.FETCH_PUBLIC_DOCS_SUCCESS,
    payload: meetingDocs,
    recordtype: recordtype
  };
  return action;
}
//========================================
export function fetchPublicDocsFailure(error) {
    // console.log(actionsName +'  fetchPublicDocsFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_PUBLIC_DOCS_FAILURE,
    payload: error
  };
}
//========================================
//========================================
//========================================
export function fetchGroupNotices(groupName) {
    // console.log(actionsName +'  fetchGroupNotices'+JSON.stringify(groupName));
    if (! groupName && process.env.NODE_ENV === 'development' ) {
        debugger; // eslint-disable-line no-debugger
    }
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Notices/`+ groupName,
      // headers: []
    });
    return dispatch => {
        dispatch( {type:PublicDocumentsConstants.FETCH_GROUP_NOTICES});
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
    // console.log(actionsName +'  fetchGroupNoticesFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_GROUP_NOTICES_FAILURE || 'Fail',
    payload: error
  };
}
//========================================
//========================================
//========================================
