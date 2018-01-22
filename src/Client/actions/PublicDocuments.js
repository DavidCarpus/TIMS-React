import {PublicDocumentsConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
const scriptName='PublicDocuments';
//========================================
export function fetchMeetingDocs(groupName) {
    // console.log(scriptName +'  fetchMeetingDocs:'+groupName);
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
              dispatch(fetchMeetingsFailure(reason));
          })

    }
}
//========================================
export function fetchDocumentsForMonth({groupName,documentType, year, month}) {
    if (! groupName && process.env.NODE_ENV === 'development') {
        debugger; // eslint-disable-line no-debugger
    }

    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/DocumentsForMonth/`+ groupName +  '/'  + documentType +  '/'  + year +  '/'  + month
      // headers: []
    });
    return dispatch => {
        dispatch({type: PublicDocumentsConstants.FETCH_MEETING_DOCS});
        request.then( response => {
               dispatch(fetchPublicDocsSuccess(groupName, response.data));
          })
          .catch( reason => {
            //   if (isEmpty(reason))  return;
              console.log(scriptName +'  fetchDocumentsForMonth? : ' + JSON.stringify(reason));
              dispatch(fetchPublicDocsFailure(reason));
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
  // console.log(scriptName +'  fetchMeetingsSuccess:'+JSON.stringify(action.groupName));
  return action;
}
//========================================
export function fetchMeetingsFailure(error) {
    console.log(scriptName +'  fetchMeetingsFailure:'+JSON.stringify(error));
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
            // console.log(scriptName +'  fetchGroupDocs response '+groupName + ' ' +JSON.stringify(groupName));
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
  // console.log(scriptName +'  fetchGroupDocsSuccess:'+docs.length);
  // console.log(JSON.stringify(action));
  return action;
}
//========================================
export function fetchGroupDocsFailure(groupName, error) {
    // console.log(scriptName + '-' +groupName + '  fetchGroupDocsFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_GROUP_DOCS_FAILURE || 'Fail',
    payload: error
  };
}
//========================================
//========================================
//========================================
//========================================
export function fetchPublicDocsFromServer(filter) {
    if ( (! filter || typeof filter !== 'object') && process.env.NODE_ENV === 'development') {
        debugger; // eslint-disable-line no-debugger
    }
    const url = Object.keys(filter).reduce( (acc, val) => {
        if(filter[val] && filter[val].length > 0){
            return acc+`${val}=${filter[val]}&`
        }else {
            return acc
        }
    }, `${ROOT_URL}Records/PublicDocs/filtered?` )

    const request = axios({
      method: 'get',
      url: url,
      // headers: []
    });

    return dispatch => {
        dispatch({type: PublicDocumentsConstants.FETCH_PUBLIC_DOCS});
        request.then( response => {
               dispatch(fetchPublicDocsSuccess(filter, response.data));
          })
          .catch( reason => {
            //   if (isEmpty(reason))  return;
            //   console.log(scriptName +'  fetchPublicDocDocs? : ' + JSON.stringify(reason));
              dispatch(fetchPublicDocsFailure(reason));
          })

    }
}
//========================================
export function fetchPublicDocsSuccess(filter, meetingDocs) {
    const action =   {
    type: PublicDocumentsConstants.FETCH_PUBLIC_DOCS_SUCCESS,
    payload: meetingDocs,
    filter: filter
  };
  return action;
}
//========================================
export function fetchPublicDocsFailure(error) {
    // console.log(scriptName +'  fetchPublicDocsFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_PUBLIC_DOCS_FAILURE,
    payload: error
  };
}
//========================================
//========================================
//========================================
export function fetchGroupNotices(groupName) {
    // console.log(scriptName +'  fetchGroupNotices'+JSON.stringify(groupName));
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
  // console.log(scriptName +'  fetchGroupNoticesSuccess:'+JSON.stringify(docs.length));
  return action;
}
//========================================
export function fetchGroupNoticesFailure(error) {
    // console.log(scriptName +'  fetchGroupNoticesFailure:'+JSON.stringify(error));
  return {
    type: PublicDocumentsConstants.FETCH_GROUP_NOTICES_FAILURE || 'Fail',
    payload: error
  };
}
//========================================
//========================================
//========================================
