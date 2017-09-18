// import React from 'react';
import NoticesListUI from './NoticesList'
 import { connect } from 'react-redux'
 import {fetchGroupNotices} from '../../actions/PublicDocuments'

const isAlertNotice = (notice) => notice.expiredate && Math.abs(new Date(notice.expiredate) - new Date(notice.date)) < 60*60*24;
  // && new Date(notice.expiredate) > new Date()

 const mapStateToProps = (state, ownProps) => {
     let groupName =  ownProps.group.link;

     if (groupName && ownProps.store && !state.PublicNotices.loading && state.PublicNotices.groupName !==   groupName) {
             ownProps.store.dispatch(fetchGroupNotices(groupName))
     }

     let notices = [];
     if (state.PublicNotices && state.PublicNotices.documents) {
         notices = state.PublicNotices.documents;
     }
     let checkDate = new Date()
     checkDate.setDate(checkDate.getDate()-1)

     let alertnotices = notices.filter(isAlertNotice)
     notices = notices.filter(notice => !isAlertNotice(notice) ).sort((a,b) => { return b.date -a.date; })

     return {
         group: ownProps.group,
         alertnotices:alertnotices,
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
