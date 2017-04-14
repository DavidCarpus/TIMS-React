import React from 'react';
 import AgendasAndMinutesUI from '../Components/AgendasAndMinutes'
 import { connect } from 'react-redux'
 import {fetchMeetingDocs} from '../actions/PublicDocuments'

const mapStateToProps = (state, ownProps) => {
  return {
      meetings: state.agendasAndMinutes.documents,
      meetingGroupName: state.agendasAndMinutes.groupName
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchMeetings: (groupName) => {
         dispatch(fetchMeetingDocs(groupName))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AgendasAndMinutesUI);
