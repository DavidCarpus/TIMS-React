// import React from 'react';
import GroupMembersUI from './GroupMembers'
 import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
    var members = ownProps.group.members || []
    // console.log('GroupMembersUI:state:', state);
  return {
      members: members,
      loading: state.OrganizationalUnits.loading
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchDocs: () => { console.log('Test') }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupMembersUI);
