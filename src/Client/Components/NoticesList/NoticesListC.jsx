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
     let checkDate = new Date()
     checkDate.setDate(checkDate.getDate()-1)
    //  notices.map(notice => {
    //      let dte = new Date(notice.expiredate)
    //     //  console.log('notice:', notice);
    //      console.log("Chk:", dte , '|' , checkDate, typeof dte, Math.abs(new Date(notice.expiredate) - new Date(notice.date))< 60*60*24 );
     //
    //      (notice.expiredate === "0000-00-00")?  console.log('Zero Date?'): "";
    //  } )

     let alertnotices = notices.filter(notice => Math.abs(new Date(notice.expiredate) - new Date(notice.date)) < 60*60*24  && new Date(notice.expiredate) > checkDate )
     notices = notices.filter(notice => notice.expiredate === null || notice.expiredate === "0000-00-00" || new Date(notice.expiredate) > checkDate )

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
