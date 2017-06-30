// import React from 'react';
import MainLayoutUI from './MainLayoutUI'
 import { connect } from 'react-redux'
 import { fetchMainMenuData } from '../../actions/MainMenuData'
 import { fetchOrganizationalUnitData } from '../../actions/OrganizationalUnitData'

const mapStateToProps = (state, ownProps) => {
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
