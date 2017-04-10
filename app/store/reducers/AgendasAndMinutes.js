import {MeetingConstants } from '../../constants';
import axios from 'axios';

// const ROOT_URL = location.href.indexOf('localhost') > 0 ? 'http://localhost:3000/api' : '/api';
// const ROOT_URL = 'http://localhost:3000';

// export function fetchMeetingDocs(groupName) {
//     const req = {
//         method: 'get',
//         url: `${ROOT_URL}/Records/Meetings/` + groupName,
//         headers: []
//       }
//     console.log(req.url);
//     const request = axios(req);
//   return {
//     type: MeetingConstants.FETCH_MEETING_DOCS,
//     payload: request
//   };
// }

export function fetchMeetingDocsSuccess(meetingDocs) {
  return {
    type: MeetingConstants.FETCH_MEETING_DOCS_SUCCESS,
    payload: meetingDocs
  };
}

export function fetchMeetingDocsFailure(error) {
  return {
    type: MeetingConstants.FETCH_MEETING_DOCS_FAILURE,
    payload: error
  };
}
