import React from 'react';
import DocumentListUI from '../Components/DocumentList'
 import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
    // console.log(JSON.stringify(ownProps));
    var documents = state.PublicRecords.filter( (record)=> {
        return  record.groupName == ownProps.group.link && record.type == 'Document'
    } ).
    sort((a, b) => {
        const ad = new Date(a.date);
        const bd = new Date(b.date);
        // return (ad < bd) ? -1 : (ad > bd) ? 1:  b.order - a.order
        return ad>bd ? -1: ad < bd ? 1:  a.order - b.order
    })

  return {
      documents: documents,
      title: ownProps.title || 'Documentation'
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchDocs: () => { console.log('Test') }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentListUI);
