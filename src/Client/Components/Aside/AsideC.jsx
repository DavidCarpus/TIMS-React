// import React from 'react';
import AsideUI from './Aside'
 import { connect } from 'react-redux'
import { fetchPageAsides } from '../../actions/PageAsides'

const mapStateToProps = (state, ownProps) => {
    let groupName = ownProps.group.link;
    let recordState = state.PageAsides;

    if (groupName && ownProps.store && !recordState.loading && recordState.groupName !==   groupName) {
        console.log('fetchPageAsides:' +  groupName);
        ownProps.store.dispatch(fetchPageAsides(groupName));
    }

    return {
        asides: recordState.PageAsides || [],
        group: ownProps.group,
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchData: (groupName) => {
         dispatch(fetchPageAsides(groupName))
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AsideUI);
