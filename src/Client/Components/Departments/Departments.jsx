import { connect } from 'react-redux'
import DepartmentsUI from './DepartmentsUI'
import { fetchOrganizationalUnitData } from '../../actions/OrganizationalUnitData'
import { fetchPageAsides } from '../../actions/PageAsides'
import {fetchGroupNotices} from '../../actions/PublicDocuments'
import {fetchGroupDoc} from '../../actions/PublicDocuments'

const mapStateToProps = (state, ownProps) => {

    var groupName=  ownProps.match.params.department;
    let recordState = state.OrganizationalUnits;
    let loading= recordState.loading

    if (groupName === 'TransferRules') {
        groupName = 'PublicWorks'
    }
    // console.log('DepartmentsUI:' +  ownProps.groupName + '-' + recordState.groupName + '-' + recordState.loading );
    if (ownProps.store &&  recordState.groupName !== ownProps.groupName && !recordState.loading) {
        // console.log('mapStateToProps:fetchData:', ownProps.groupName);
        ownProps.store.dispatch(fetchOrganizationalUnitData(groupName))
        // ownProps.store.dispatch(fetchPageAsides(groupName))
        // ownProps.store.dispatch(fetchGroupNotices(groupName))
        // ownProps.store.dispatch(fetchGroupDoc(groupName))
        loading=true;
    }

    return {
        groupName:  groupName,
        groupData:  recordState.groupData,
        loading: loading,
        store: ownProps.store
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: (groupName) => {
          dispatch(fetchOrganizationalUnitData(groupName))
          dispatch(fetchPageAsides(groupName));
          dispatch(fetchGroupNotices(groupName));
          dispatch(fetchGroupDoc(groupName));
       }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DepartmentsUI);
