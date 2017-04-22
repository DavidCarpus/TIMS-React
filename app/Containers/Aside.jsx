import React from 'react';
import AsideUI from '../Components/Aside'
 import { connect } from 'react-redux'
import { fetchPageAsides } from '../actions/PageAsides'

const mapStateToProps = (state, ownProps) => {
    var asides = ownProps.group.asides || []
    // console.log('GroupAsides:' + JSON.stringify(ownProps.group));
    return {
        asides: state.PageAsides,
        group: ownProps.group,
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchData: (groupName) => {
        //  console.log('fetchPageAsides:');
         dispatch(fetchPageAsides(groupName))
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AsideUI);
