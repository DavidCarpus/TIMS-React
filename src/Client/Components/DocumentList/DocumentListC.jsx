// import React from 'react';
import DocumentListUI from './DocumentList'
 import { connect } from 'react-redux'
 import {fetchGroupDoc} from '../../actions/PublicDocuments'

const mapStateToProps = (state, ownProps) => {
    let groupName =  ownProps.group.link;
    let recordState = state.PublicRecords;

    if (groupName && ownProps.store && !recordState.loading && recordState.groupName !==   groupName) {
        // console.log('fetchGroupDoc:' +recordState.groupName + '-' +  groupName );
        ownProps.store.dispatch(fetchGroupDoc(groupName))
    }
    let documents = [];
    if (state.PublicRecords && state.PublicRecords.documents) {
        documents = state.PublicRecords.documents;
    }
    return {
        group: ownProps.group,
        documents: documents,
        documentsGroupName: state.PublicRecords.groupName,
        loading: state.PublicRecords.loading,
        title: ownProps.title || 'Documentation',
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchDocs: (groupName) => {
          dispatch(fetchGroupDoc(groupName))
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentListUI);
