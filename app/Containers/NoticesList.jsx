import React from 'react';
import NoticesListUI from '../Components/NoticesList'
 import { connect } from 'react-redux'
 import {fetchGroupNotices} from '../actions/PublicDocuments'

 const mapStateToProps = (state, ownProps) => {
     // var documents = [];
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

// const mapStateToProps = (state, ownProps) => {
//     var notices = [];
//     // notices =  state.PublicRecords.filter( (record)=> {
//     //     return  record.type == 'Notice'
//     // } ).
//     // sort((a, b) => {
//     //     const ad = new Date(a.date);
//     //     const bd = new Date(b.date);
//     //     // return (ad < bd) ? -1 : (ad > bd) ? 1:  b.order - a.order
//     //     return ad>bd ? -1: ad < bd ? 1:  a.order - b.order
//     // })
//     // if(ownProps.group.link == 'Home')
//     // {
//     //     notices = notices.filter( (notice) =>
//     //     {return notice.mainpage } )
//     // } else {
//     //     notices = notices.filter( (notice) =>
//     //     {return notice.groupName == ownProps.group.link } )
//     // }
//
//   return {
//       notices: notices
//   };
// }
//
// const mapDispatchToProps = (dispatch) => {
//   return {
//      fetchDocs: () => { console.log('Test') }
//   }
// }

export default connect(mapStateToProps, mapDispatchToProps)(NoticesListUI);
