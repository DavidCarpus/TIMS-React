// import React from 'react';
import NoticesListUI from './NoticesList'
 import { connect } from 'react-redux'
 import {fetchGroupNotices} from '../../actions/PublicDocuments'

 const mapStateToProps = (state, ownProps) => {
     let groupName =  ownProps.group.link;

     if (groupName && ownProps.store && !state.PublicNotices.loading && state.PublicNotices.groupName !==   groupName) {
             ownProps.store.dispatch(fetchGroupNotices(groupName))
     }

     let notices = [];
     if (state.PublicNotices && state.PublicNotices.documents) {
         notices = state.PublicNotices.documents;
     }

     return {
         group: ownProps.group,
         notices: notices,
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
