// import React from 'react';
import News from './News'
 import { connect } from 'react-redux'
 import { fetchNewsDetails } from '../../actions/News'

const mapStateToProps = (state, ownProps) => {
    // console.log("News:", ownProps);
    // let pageText = {description:this.props.notice.html}
    // if (state.SingleNotice && state.SingleNotice.notice.id === parseInt(ownProps.match.params.noticeID, 10)) {
    //     notice = state.SingleNotice.notice.html;
    // }
    // console.log('News:params:', ownProps.match.params.newsID);

    const titleElements = ['News']
    console.log(' News: ownProps',  state.NewsData.NewsDetails);
    return {
        news: state.NewsData.NewsDetails,
        id:ownProps.match.params.newsID,
        store: ownProps.store,
        title: titleElements,
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: (noticeID) => {
        //   console.log('fetchData: (noticeID)', noticeID);
        dispatch(fetchNewsDetails(noticeID))
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(News);
