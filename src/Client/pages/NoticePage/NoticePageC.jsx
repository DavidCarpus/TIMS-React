// import React from 'react';
import NoticePage from './NoticePage'
 import { connect } from 'react-redux'
 import { fetchSingleNotice } from '../../actions/SingleNotice'

const mapStateToProps = (state, ownProps) => {
    let notice = [];
    // console.log('params:',ownProps.match.params);
    // console.log(state.SingleNotice.notice.id, ownProps.match.params.noticeID);
    if (state.SingleNotice && state.SingleNotice.notice.id === parseInt(ownProps.match.params.noticeID, 10)) {
        notice = state.SingleNotice.notice.html;
    }
    console.log("NoticePage:", ownProps);
    // let pageText = {description:this.props.notice.html}
    let titleElements = []
    if (state.SingleNotice){
        titleElements = [ownProps.Config.municipalShortName, state.SingleNotice.notice.groupDescription];
        titleElements.push(state.SingleNotice.notice.recordtype)
    }

    console.log("titleElements:", titleElements);
    // console.log("state.SingleNotice.notice:", state.SingleNotice.notice);
    return {
        notice: {description:notice},
        noticeID: ownProps.match.params.noticeID,
        store: ownProps.store,
        title: titleElements
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: (noticeID) => {
        //   console.log('fetchData: (noticeID)', noticeID);
        dispatch(fetchSingleNotice(noticeID))
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NoticePage);
