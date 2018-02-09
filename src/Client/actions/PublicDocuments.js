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
        request.then( response => dispatch(fetchMeetingsSuccess(groupName, response.data)) )
        .catch( reason =>  dispatch(fetchMeetingsFailure(reason)) )
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
        request.then( response => dispatch(fetchPublicDocsSuccess(groupName, response.data)) )
        .catch( reason => dispatch(fetchPublicDocsFailure(reason)) )
    }
}
//========================================
const fetchMeetingsSuccess = (groupName, meetingDocs)  => ({
    type: PublicDocumentsConstants.FETCH_MEETING_DOCS_SUCCESS,
    payload: meetingDocs,
    groupName: groupName
})
//========================================
const fetchMeetingsFailure = (error) => ({
    type: PublicDocumentsConstants.FETCH_MEETING_DOCS_FAILURE,
    payload: error
})
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
        request.then( response => dispatch(fetchGroupDocsSuccess(groupName, response.data)) )
        .catch( reason => dispatch(fetchGroupDocsFailure( reason)) )
    }
}
//========================================
const fetchGroupDocsSuccess = (groupName, docs)  => ({
    type: PublicDocumentsConstants.FETCH_GROUP_DOCS_SUCCESS,
    payload: docs,
    groupName: groupName
})
//========================================
const fetchGroupDocsFailure = (error) => ({
    type: PublicDocumentsConstants.FETCH_GROUP_DOCS_FAILURE || 'Fail',
    payload: error
})
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
        request.then( response => dispatch(fetchPublicDocsSuccess(filter, response.data)) )
        .catch( reason => dispatch(fetchPublicDocsFailure(reason)) )
    }
}
//========================================
const fetchPublicDocsSuccess =(filter, meetingDocs)  => ({
    type: PublicDocumentsConstants.FETCH_PUBLIC_DOCS_SUCCESS,
    payload: meetingDocs,
    filter: filter
})
//========================================
const fetchPublicDocsFailure = (error) => ({
    type: PublicDocumentsConstants.FETCH_PUBLIC_DOCS_FAILURE,
    payload: error
})
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
        request.then( response =>  dispatch(fetchGroupNewsSuccess(groupName, response.data)) )
        .catch( reason => dispatch(fetchGroupNewsFailure(reason)) )
    }
}
//========================================
const fetchGroupNewsSuccess=(groupName, docs)  => ({
    type: PublicDocumentsConstants.FETCH_GROUP_NOTICES_SUCCESS,
    payload: docs,
    groupName: groupName
})
//========================================
const fetchGroupNewsFailure = (error) => ({
    type: PublicDocumentsConstants.FETCH_GROUP_NOTICES_FAILURE || 'Fail',
    payload: error
})
