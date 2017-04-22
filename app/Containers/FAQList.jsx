import React from 'react';
import { connect } from 'react-redux'
import FAQListUI from '../Components/FAQList'
import {fetchFAQData} from '../actions/FAQData'

const mapStateToProps = (state, ownProps) => {
    return {
        questions: state.FAQ.faqData,
        title: ownProps.title || 'FAQ',
        groupName: ownProps.groupName,
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchFAQ: (groupName) => {
          dispatch(fetchFAQData(groupName))
     },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FAQListUI);
