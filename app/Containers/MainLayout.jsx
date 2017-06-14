import React from 'react';
import MainLayoutUI from '../Components/MainLayoutUI'
 import { connect } from 'react-redux'
 import { fetchMainMenuData } from '../../actions/MainMenuData'

const mapStateToProps = (state, ownProps) => {
    return {
        MainMenus: state.MainMenus
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: () => {
          dispatch(fetchMainMenuData())
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainLayoutUI);
