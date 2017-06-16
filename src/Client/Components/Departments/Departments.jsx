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

    if (ownProps.store &&  recordState.groupName !== ownProps.groupName && !recordState.loading) {
        // Check if last group loaded was not in 'Department' mainMenu, do NOT load here. Will do it in componentWillMount
        if (state.MainMenus && state.MainMenus.menus.length > 0) {
            let chk = state.MainMenus.menus
            .filter(menu => menu.desc === 'Departments')[0].menus
            .filter(menu => menu.link === '/'+recordState.groupName)[0]
            if (typeof chk !== 'undefined') {
                ownProps.store.dispatch(fetchOrganizationalUnitData(groupName))
                loading=true;
            }
        }
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
