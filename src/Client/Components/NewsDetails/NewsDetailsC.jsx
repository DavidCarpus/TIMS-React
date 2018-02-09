import { connect } from 'react-redux'
import FAQListUI from './NewsDetails'
import {fetchNewsList} from '../../actions/News'

const mapStateToProps = (state, ownProps) => {
    const dateToDateStr = (dateStr) => {
        const dateObj =new Date(dateStr)
        return dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1) + '-' + dateObj.getDate()
    }
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
