// import React from 'react';
import MainLayoutUI from './MainLayoutUI'
 import { connect } from 'react-redux'
 import { fetchMainMenuData } from '../../actions/MainMenuData'
 import { fetchOrganizationalUnitData } from '../../actions/OrganizationalUnitData'

 // function OrgUnitChange(groupType, store) {
 //   return (nextState, replace) => {
 //       var groupName = nextState.params[groupType];
 //       store.dispatch(fetchOrganizationalUnitData(groupName));
 //    //    store.dispatch(fetchPageAsides(groupName));
 //    //    store.dispatch(fetchMeetingDocs(groupName));
 //    //    store.dispatch(fetchGroupDoc(groupName));
 //   };
 // }

const mapStateToProps = (state, ownProps) => {
    // let groupName =  ''; //ownProps.group.link;
    // let recordState = state.OrganizationalUnits
    // console.log('MainLayout:ownProps:' , ownProps );
    // console.log('MainLayoutUI:' +  ownProps.group + '-' + recordState.groupName + '-' + recordState.loading + '-' + ownProps.store);

    // console.log(require('util').inspect(state, { depth: null }));
    // store.dispatch(fetchOrganizationalUnitData(groupName));

    return {
        MainMenus: state.MainMenus,
        store: ownProps.store
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: () => {
          dispatch(fetchMainMenuData())
     },
     fetchOUData: (groupName) => {
         dispatch(fetchOrganizationalUnitData(groupName))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainLayoutUI);
