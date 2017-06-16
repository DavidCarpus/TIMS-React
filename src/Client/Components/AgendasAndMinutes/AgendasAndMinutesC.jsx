// import React from 'react';
 import AgendasAndMinutesUI from './AgendasAndMinutes'
 import { connect } from 'react-redux'
 import {fetchMeetingDocs} from '../../actions/PublicDocuments'

const mapStateToProps = (state, ownProps) => {
    let groupName =  ownProps.group.link;
    let agendaState = state.agendasAndMinutes;

    if (groupName && ownProps.store && !agendaState.loading && agendaState.groupName !==   groupName) {
        // console.log('fetchMeetingDocs:' +agendaState.groupName + '-' +  groupName );
        ownProps.store.dispatch(fetchMeetingDocs(groupName))
    }

  return {
      meetings: agendaState.documents || [],
      meetingGroupName: agendaState.groupName,
      loading: agendaState.loading,
      title: ownProps.title ||  'Agendas And Minutes'
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
