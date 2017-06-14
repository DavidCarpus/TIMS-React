// import React from 'react';
import { connect } from 'react-redux'
import FAQListUI from './FAQList'
import {fetchFAQData} from '../../actions/FAQData'

const mapStateToProps = (state, ownProps) => {
    // if (ownProps.store && !state.FAQ.loading && state.FAQ.groupName !==   groupName) {
    //     // console.log(state.PageAsides.groupName + '-' +  groupName + '-' + state.PageAsides.loading + '-' + ownProps.store);
    //     ownProps.store.dispatch(fetchFAQData(groupName))
    // }

    return {
        questions: state.FAQ.faqData,
        title: ownProps.title || 'FAQ',
        loading: state.FAQ.loading,
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
