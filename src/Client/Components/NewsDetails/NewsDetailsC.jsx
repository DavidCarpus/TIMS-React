// import React from 'react';
import { connect } from 'react-redux'
import FAQListUI from './NewsDetails'
import {fetchNewsList} from '../../actions/News'

const mapStateToProps = (state, ownProps) => {
    // if (ownProps.store && !state.FAQ.loading && state.FAQ.groupName !==   groupName) {
    //     // console.log(state.PageAsides.groupName + '-' +  groupName + '-' + state.PageAsides.loading + '-' + ownProps.store);
    //     ownProps.store.dispatch(fetchFAQData(groupName))
    // }
    const dateToDateStr = (dateStr) => {
        const dateObj =new Date(dateStr)
        return dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1) + '-' + dateObj.getDate()
    }
    // const dateToDateStr = (dateStr) => dateStr
    // console.log('NewsDataC1:', state.NewsData.NewsData);
    let newsData=[]
    if (state.NewsData) {
        newsData = state.NewsData.NewsData.map( (elem)=> ({id:elem.id, summary:elem.summary, postedDate:dateToDateStr(elem.datePosted)}))
    }

    console.log('NewsDetailsC:', newsData);

    return {
        newsData: newsData,
        title: ownProps.title || 'NewsDetails',
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
