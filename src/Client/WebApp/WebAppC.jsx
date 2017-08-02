// import React from 'react';
import WebApp from './WebApp'
 import { connect } from 'react-redux'
 import { fetchMainMenuData } from '../actions/MainMenuData'
 import { fetchOrganizationalUnitData } from '../actions/OrganizationalUnitData'
var Config = require('../config')

const mapStateToProps = (state, ownProps) => {
    return {
        MainMenus: state.MainMenus,
        store: ownProps.store,
        Config: Config(),
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

export default connect(mapStateToProps, mapDispatchToProps)(WebApp);
