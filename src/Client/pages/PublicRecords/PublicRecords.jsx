import { connect } from 'react-redux'
import PublicRecordsUI from './PublicRecordsUI'
import {fetchPublicDocs} from '../../actions/PublicDocuments'

const mapStateToProps = (state, ownProps) => {
    var recordType=  ownProps.match.params.recordtype;
    let recordState = state.PublicRecords;
    let loading= recordState.loading

    let loadedRecordType = recordState.recordtype
    let selectedRecordType = recordType
    // console.log('loadedRecordType / selectedRecordType:', loadedRecordType , selectedRecordType);

    if (ownProps.store && loadedRecordType !== selectedRecordType && !recordState.loading) {
        // Check if last group loaded was not in 'Department' mainMenu, do NOT load here. Will do it in componentWillMount
        if (state.MainMenus && state.MainMenus.menus && Object.keys(state.MainMenus.menus).length > 0 ) {
            let records = state.MainMenus.menus['/PublicRecords']
            let newRecordType = records.menus
            .filter(menu =>  (menu.pageLink === '/'+selectedRecordType) )

            let oldRecordType = records.menus
            .filter(menu =>  (menu.pageLink === '/'+loadedRecordType) )

            // new group and old group both in 'PublicRecords', fetch from here (otherwise do in componentWillMount )
            if ( newRecordType.length > 0 && oldRecordType.length >  0) {
                ownProps.store.dispatch(fetchPublicDocs(selectedRecordType))
                loading=true;
            }
        }
    }

    let sortedRecords=[]
    if (recordState.publicRecords) {
        sortedRecords = Object.keys(recordState.publicRecords)
        .sort((a,b) => {
            let dateDiff = new Date(b) - new Date(a);
            //  console.log(dateDiff);
            if (dateDiff !== 0) { return dateDiff; }
            //  console.log(a, b);
            return a.groupName.localeCompare(b.groupName);
            // return new Date(b) - new Date(a);
        })
        .map(function(val) {
            return [val, recordState.publicRecords[val] ] }
        )

        sortedRecords = sortedRecords.reduce( (acc, curr, i) => {
            //  console.log(curr[0]);
            let year = (new Date(curr[0])).getFullYear();

            //  console.log(year);
            acc[year] = acc[year]? acc[year]: [];
            acc[year].push(curr)
            return acc;
        }, {})
        //  console.log(sortedRecords);
    }


    return {
        recordType:  recordType,
        records:  sortedRecords,
        groupData:  recordState.groupData,
        loading: loading,
        store: ownProps.store
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: (recordType) => {
        //   dispatch(fetchOrganizationalUnitData(groupName))
        //   dispatch(fetchPageAsides(groupName));
          dispatch(fetchPublicDocs(recordType));
        //   dispatch(fetchGroupDoc(groupName));
       }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicRecordsUI);
