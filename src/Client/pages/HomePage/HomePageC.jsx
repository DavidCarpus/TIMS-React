// import React from 'react';
import HomePageUI from './HomePage'
 import { connect } from 'react-redux'
 import {fetchGroupNews} from '../../actions/PublicDocuments'

const mapStateToProps = (state, ownProps) => {
    return {
      group: {'link' : 'Home'},
      municipalLongName:ownProps.Config.municipalLongName,
      notices: state.PublicNotices.documents || [],
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchData: () => {
         let groupName='Home'
         dispatch(fetchGroupNews(groupName));
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePageUI);
