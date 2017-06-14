// import React from 'react';
import GroupMembersUI from './GroupMembers'
 import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
    var members = ownProps.group.members || []
  return {
      members: members
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchDocs: () => { console.log('Test') }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupMembersUI);
