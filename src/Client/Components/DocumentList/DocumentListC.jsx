// import React from 'react';
import DocumentListUI from './DocumentList'
 import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
    let recordState = state.GroupDocuments;

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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentListUI);
