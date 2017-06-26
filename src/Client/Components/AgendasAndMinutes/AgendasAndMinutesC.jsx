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

    let sortedDocuments=[]
    if (agendaState.documents) {
         sortedDocuments = Object.keys(agendaState.documents)
         .sort((a,b) => { return new Date(b) - new Date(a); })
         .map(function(val) {
             return [val, agendaState.documents[val] ] }
         );

        //  sortedDocuments = sortedDocuments.reduce( (acc, curr, i) => {
        //      acc[curr[0]] = curr[1];
        //      return acc;
        //  }, {})

         sortedDocuments = sortedDocuments.reduce( (acc, curr, i) => {
            //  console.log(curr[0]);
             let year = (new Date(curr[0])).getFullYear();

            //  console.log(year);
             acc[year] = acc[year]? acc[year]: [];
             acc[year].push(curr)
             return acc;
         }, {})
        //  console.log(sortedDocuments);
    }


  return {
      meetings: sortedDocuments,
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
