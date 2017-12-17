// import React from 'react';
import GroupMembersUI from './GroupMembers'
 import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
    const  members = ownProps.group.members || []
    const showTerm= typeof ownProps.showTerm !== 'undefined' ? ownProps.showTerm :false
    // console.log('showTerm',ownProps);
    // console.log('GroupMembersUI:group:', ownProps.group);
    // console.log('GroupMembersUI:', ownProps);
  return {
      members: members,
      loading: state.OrganizationalUnits.loading,
      showTerm: showTerm,
      hourstr: ownProps.group.hours || '',
      addressstr: ownProps.group.address || '',
    //   groupAddress: ['PO Box 310', 'Milton, NH 03851']
        // groupEmail: 'assessing@miltonnh-us.com'
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchDocs: () => { console.log('Test') }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupMembersUI);
