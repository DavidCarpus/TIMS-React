import React from 'react';
import NoticesListUI from '../Components/NoticesList'
 import { connect } from 'react-redux'
 import {fetchGroupNotices} from '../../actions/PublicDocuments'

 const mapStateToProps = (state, ownProps) => {
     return {
         notices: state.PublicNotices.documents,
         noticesGroupName: state.PublicNotices.groupName,
         title: ownProps.title || 'Notices'
     };
 }

 const mapDispatchToProps = (dispatch) => {
   return {
       fetchNotices: (groupName) => {
           dispatch(fetchGroupNotices(groupName))
      }
   }
 }

export default connect(mapStateToProps, mapDispatchToProps)(NoticesListUI);
