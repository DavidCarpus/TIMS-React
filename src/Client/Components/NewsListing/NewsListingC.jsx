// import React from 'react';
import { connect } from 'react-redux'
import FAQListUI from './NewsListing'

const mapStateToProps = (state, ownProps) => {
    // }
    const newsData = (ownProps.limit > 0)? ownProps.news.slice(0,ownProps.limit): ownProps.news

    // console.log('NewsListingC:', newsData);

    return {
        newsData: newsData,
        // totalCount:totalCount,
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
