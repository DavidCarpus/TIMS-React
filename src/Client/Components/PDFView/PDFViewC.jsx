// import React from 'react';
import { connect } from 'react-redux'
import PDFView from './PDFView'

let pageRoutines={}

const mapStateToProps = (state, ownProps) => {
    pageRoutines=ownProps.pageRoutines

    return {
        fileData: ownProps.fileData,
        title: ownProps.title || 'View PDF',
        loading: ownProps.loading,
        currentPage: ownProps.currentPage,
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      onDocumentLoad({numPages}){
          pageRoutines.setTotalPages(numPages)
      }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PDFView);
