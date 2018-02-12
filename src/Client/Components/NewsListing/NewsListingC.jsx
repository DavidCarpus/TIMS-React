// import React from 'react';
import { connect } from 'react-redux'
import FAQListUI from './NewsListing'

const mapStateToProps = (state, ownProps) => {
    return {
        newsData: (ownProps.limit > 0)? ownProps.news.slice(0,ownProps.limit): ownProps.news,
        totalCount:ownProps.news.length,
        title: ownProps.title || 'NewsListing',
        loading: state.FAQ.loading,
        groupName: ownProps.groupName,
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FAQListUI);
