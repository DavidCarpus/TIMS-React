// import React from 'react';
import DocumentListUI from './DocumentList'
 import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
    let recordState = state.GroupDocuments;

    let documents = [];
    if (recordState && recordState.documents) {
        documents = recordState.documents;
    }

    let recentDatePivot = new Date()
    recentDatePivot.setDate(recentDatePivot.getDate()-7)

    const unexpired = (rec) =>  rec.expiredate === null || rec.expiredate > new Date()
    const recentPost = (rec) =>  new Date(rec.date) > recentDatePivot
    const sortByViewCount = (a,b) =>  b.viewcount - a.viewcount

    const restrictDisplayCount=7
    const byViewCount = documents.filter(unexpired ).sort(sortByViewCount)
    documents = documents.filter(recentPost).slice(0,restrictDisplayCount)
    documents = documents.concat(byViewCount.slice(0,restrictDisplayCount-documents.length))

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
