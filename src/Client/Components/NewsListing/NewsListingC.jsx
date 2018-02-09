// import React from 'react';
import { connect } from 'react-redux'
import FAQListUI from './NewsListing'
import {fetchNewsList} from '../../actions/News'

const mapStateToProps = (state, ownProps) => {
    // }
    const dateToDateStr = (dateStr) => {
        const dateObj =new Date(dateStr)
        return dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1) + '-' + dateObj.getDate()
    }
    // const dateToDateStr = (dateStr) => dateStr
    // console.log('NewsDataC1:', state.NewsData.NewsData);
    let newsData=[]
    let totalCount=0
    if (state.NewsData) {
        totalCount=state.NewsData.NewsData.length
        newsData = state.NewsData.NewsData
        .sort((a,b) => { return new Date(b.datePosted) -new Date(a.datePosted); })
        .map( (elem)=> ({id:elem.id, summary:elem.summary, postedDate:dateToDateStr(elem.datePosted)}))
    }
    if (ownProps.limit > 0) {
        newsData = newsData.slice(0,ownProps.limit)
    }

    // console.log('NewsListingC:', newsData);

    return {
        newsData: newsData,
        totalCount:totalCount,
        title: ownProps.title || 'NewsListing',
        loading: state.FAQ.loading,
        groupName: ownProps.groupName,
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchNewsList: (groupName) => {
          dispatch(fetchNewsList(groupName))
     },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FAQListUI);
