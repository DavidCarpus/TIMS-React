import { connect } from 'react-redux'
import NewsDetailsUI from './NewsDetails'
import {fetchNewsList} from '../../actions/News'

const mapStateToProps = (state, ownProps) => {
    const stateData = state.NewsData

    return {
        newsData: stateData.NewsDetails,
        title: ownProps.title || 'NewsDetails',
        loading: stateData.loading,
        groupName: ownProps.groupName,
        attachments: stateData.NewsDetails.attachments,
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchNewsList: (groupName) => {
          dispatch(fetchNewsList(groupName))
     },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsDetailsUI);
