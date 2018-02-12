import GroupMembersUI from './GroupMembers'
 import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
  return {
      members: ownProps.group.members || [],
      loading: state.OrganizationalUnits.loading,
      showTerm: typeof ownProps.showTerm !== 'undefined' ? ownProps.showTerm :false,
      hourstr: ownProps.group.hours || '',
      addressstr: ownProps.group.address || '',
  };
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupMembersUI);
