// import React from 'react';
import About from './About'
 import { connect } from 'react-redux'
 import { fetchOrganizationalUnitData } from '../../actions/OrganizationalUnitData'

const mapStateToProps = (state, ownProps) => {
    // let groupName =  ''; //ownProps.group.link;
    // let recordState = state.OrganizationalUnits
    // console.log('MainLayout:ownProps:' , ownProps );
    // console.log('MainLayoutUI:' +  ownProps.group + '-' + recordState.groupName + '-' + recordState.loading + '-' + ownProps.store);

    // console.log(require('util').inspect(state, { depth: null }));
    // store.dispatch(fetchOrganizationalUnitData(groupName));
    let recordState = state.OrganizationalUnits;

    return {
        groupName:  'About',
        groupData:  recordState.groupData,
        group:  recordState.groupData,
        store: ownProps.store
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
     fetchData: (groupName) => {
         dispatch(fetchOrganizationalUnitData(groupName))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(About);
