// import React from 'react';
import HomePageUI from './HomePage'
 import { connect } from 'react-redux'
 import { fetchPageAsides } from '../../actions/PageAsides'
 import {fetchGroupNotices} from '../../actions/PublicDocuments'

const mapStateToProps = (state, ownProps) => {
    return {
      group: {'link' : 'Home'},
      municipalLongName:ownProps.Config.municipalLongName
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchData: () => {
         let groupName='Home'
         dispatch(fetchPageAsides(groupName));
         dispatch(fetchGroupNotices(groupName));
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePageUI);
