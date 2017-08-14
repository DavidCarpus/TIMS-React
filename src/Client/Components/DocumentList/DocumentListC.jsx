// import React from 'react';
import DocumentListUI from './DocumentList'
 import { connect } from 'react-redux'
 import {fetchGroupDoc} from '../../actions/PublicDocuments'

const mapStateToProps = (state, ownProps) => {
    let groupName =  ownProps.group.link;
    // console.log(state);
    let recordState = state.GroupDocuments;

    if (groupName && ownProps.store && !recordState.loading && recordState.groupName !==   groupName) {
        // console.log('fetchGroupDoc(groupName)', groupName, recordState);
        ownProps.store.dispatch(fetchGroupDoc(groupName))
    }
    let documents = [];
    if (recordState && recordState.documents) {
        documents = recordState.documents;
    }
    documents = documents.filter(document => document.expiredate === null || document.expiredate > new Date() )
    return {
        group: ownProps.group,
        documents: documents,
        documentsGroupName: recordState.groupName,
        loading: recordState.loading,
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
