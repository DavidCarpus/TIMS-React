import React from 'react';
import DocumentListUI from '../Components/DocumentList'
 import { connect } from 'react-redux'
 import {fetchGroupDoc, resetGroupDoc} from '../actions/PublicDocuments'

const mapStateToProps = (state, ownProps) => {
    return {
        group: ownProps.group,
        documents: state.PublicRecords.documents,
        documentsGroupName: state.PublicRecords.groupName,
        loading: state.PublicRecords.loading,
        title: ownProps.title || 'Documentation',
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchDocs: (groupName) => {
          dispatch(fetchGroupDoc(groupName))
     },
     resetGroupDoc: (groupName) => {
         dispatch(resetGroupDoc(groupName))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentListUI);
