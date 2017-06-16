// import React from 'react';
import AsideUI from './Aside'
 import { connect } from 'react-redux'
import { fetchPageAsides } from '../../actions/PageAsides'

const mapStateToProps = (state, ownProps) => {
    let groupName = ownProps.group.link;
    let recordState = state.PageAsides;


    if (groupName && groupName.length > 0 && ownProps.store && !recordState.loading && recordState.groupName !==   groupName) {
        ownProps.store.dispatch(fetchPageAsides(groupName));
    }
    let asides = recordState.PageAsides || [];
    if (recordState.groupName !==   groupName) {        asides = [];    }

    return {
        asides: asides,
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
