import { connect } from 'react-redux'
import NewsDetailsUI from './NewsDetails'

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
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsDetailsUI);
