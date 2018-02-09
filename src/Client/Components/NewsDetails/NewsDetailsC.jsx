import { connect } from 'react-redux'
import NewsDetailsUI from './NewsDetails'
import {fetchNewsList} from '../../actions/News'

const mapStateToProps = (state, ownProps) => {

    console.log('NewsDetailsC:', newsData);
    const stateData = state.NewsData

    return {
        newsData: stateData.NewsDetails,
        title: ownProps.title || 'NewsDetails',
        loading: stateData.loading,
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

export default connect(mapStateToProps, mapDispatchToProps)(NewsDetailsUI);
