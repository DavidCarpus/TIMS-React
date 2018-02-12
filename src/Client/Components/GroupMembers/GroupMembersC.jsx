import GroupMembersUI from './GroupMembers'
 import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
    const  members = ownProps.group.members || []
    const showTerm= typeof ownProps.showTerm !== 'undefined' ? ownProps.showTerm :false
  return {
      members: members,
      loading: state.OrganizationalUnits.loading,
      showTerm: showTerm,
      hourstr: ownProps.group.hours || '',
      addressstr: ownProps.group.address || '',
  };
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupMembersUI);
