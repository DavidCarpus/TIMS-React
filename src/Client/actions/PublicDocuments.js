import {PublicDocumentsConstants} from '../../constants'
import axios from 'axios';
var Config = require('../config'),
configuration = new Config();

const ROOT_URL = configuration.ui.ROOT_URL
//========================================
export function fetchMeetingDocs(groupName) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Meetings/`+ groupName,
    });
    return dispatch => {
        dispatch({type: PublicDocumentsConstants.FETCH_MEETING_DOCS});
        request.then( response => {
               dispatch(fetchMeetingsSuccess(groupName, response.data));
          })
          .catch( reason => {
              dispatch(fetchMeetingsFailure(reason));
          })

    }
}
//========================================
export function fetchDocumentsForMonth({groupName,documentType, year, month}) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/DocumentsForMonth/`+ groupName +  '/'  + documentType +  '/'  + year +  '/'  + month
    });
    return dispatch => {
        dispatch({type: PublicDocumentsConstants.FETCH_MEETING_DOCS});
        request.then( response => {
               dispatch(fetchPublicDocsSuccess(groupName, response.data));
          })
          .catch( reason => {
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
  return action;
}
//========================================
export function fetchMeetingsFailure(error) {
  return {
    type: PublicDocumentsConstants.FETCH_MEETING_DOCS_FAILURE,
    payload: error
  };
}
//========================================
//========================================
//========================================
export function fetchGroupDoc(groupName) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/Documents/`+ groupName,
    });

    return dispatch => {
        dispatch({type: PublicDocumentsConstants.FETCH_GROUP_DOCS});

        request.then( response => {
               dispatch(fetchGroupDocsSuccess(groupName, response.data));
          })
          .catch( reason => {
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
  return action;
}
//========================================
export function fetchGroupDocsFailure(groupName, error) {
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
    });

    return dispatch => {
        dispatch({type: PublicDocumentsConstants.FETCH_PUBLIC_DOCS});
        request.then( response => {
               dispatch(fetchPublicDocsSuccess(filter, response.data));
          })
          .catch( reason => {
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
  return {
    type: PublicDocumentsConstants.FETCH_PUBLIC_DOCS_FAILURE,
    payload: error
  };
}
//========================================
//========================================
//========================================
export function fetchGroupNews(groupName) {
    const request = axios({
      method: 'get',
      url: `${ROOT_URL}Records/News/`+ groupName,
    });
    return dispatch => {
        dispatch( {type:PublicDocumentsConstants.FETCH_GROUP_NOTICES});
        request.then( response => {
               dispatch(fetchGroupNewsSuccess(groupName, response.data));
          })
          .catch( reason => {
              dispatch(fetchGroupNewsFailure(reason));
          })

    }
}
//========================================
export function fetchGroupNewsSuccess(groupName, docs) {
    const action =   {
    type: PublicDocumentsConstants.FETCH_GROUP_NOTICES_SUCCESS,
    payload: docs,
    groupName: groupName
  };
  return action;
}
//========================================
export function fetchGroupNewsFailure(error) {
  return {
    type: PublicDocumentsConstants.FETCH_GROUP_NOTICES_FAILURE || 'Fail',
    payload: error
  };
}
//========================================
