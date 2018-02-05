// import React from 'react';
import FileViewer from './FileViewer'
 import { connect } from 'react-redux'
 import { fetchFileToView,setTotalPages,setCurrentPage } from '../../actions/FileViewer'

const mapStateToProps = (state, ownProps) => {
    const titleElements = [state.FileViewer.Description] || ['PDFView']

    return {
        fileData: state.FileViewer,
        id:ownProps.match.params.fileID,
        store: ownProps.store,
        title: titleElements,
        currentPage: state.FileViewer.currentPage,
        totalPages:state.FileViewer.totalPages,
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: (fileID) => {
        dispatch(fetchFileToView(fileID))
    },
    setCurrentPage: (currentPage) => {
        dispatch(setCurrentPage(currentPage))
    },
    setTotalPages: (totalPages) => {
        dispatch(setTotalPages(totalPages))
    },

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FileViewer);
