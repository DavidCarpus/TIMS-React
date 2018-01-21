import { connect } from 'react-redux'
import PublicRecordsUI from './PublicRecordsUI'
import {fetchPublicDocs} from '../../actions/PublicDocuments'

// let updatedFilter=false

let currentFilter = {}
const updateFilter = (currentFilter, field, value ) => {
    console.log('updateFilter', field, value);
    currentFilter[field] = value
    // updatedFilter=true
}

const mapStateToProps = (state, ownProps) => {
    var recordType=  ownProps.match.params.recordtype;
    let recordState = state.PublicRecords;
    let loading= recordState.loading
    // console.log("ownProps.match.params:",   ownProps.match.params);

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
        console.log('Clear currentFilter.');
        currentFilter = {}
    }
    if (!currentFilter.groupName || currentFilter.groupName.length === 0) {
        if (ownProps.match.params.groupName) {
            updateFilter(currentFilter, "groupName", ownProps.match.params.groupName)
        }
    }
    // console.log("currentFilter", updatedFilter, currentFilter);
    // if (ownProps.match.params.groupName) {
    //     currentFilter.groupName = ownProps.match.params.groupName
    // }

    const now=new Date();
    let filterRecords = (record) => {
        let match = true;
        if (currentFilter.groupName ){
                if (record.groupName !== currentFilter.groupName ) {
                    match = false;
                }
        }
        if (now - new Date(record.date)  > 1000*60*60*24*365*1) {
            match = false;
        }

        return match
    }

    let sortedRecords=[]
    if (recordState.publicRecords
    && recordState.publicRecords.length > 0)
    {
        sortedRecords = recordState.publicRecords.sort((a,b) => {
            let dateDiff = new Date(b.date) - new Date(a.date);
            if (dateDiff !== 0) { return dateDiff; }
            const grpCmp =  a.groupName.localeCompare(b.groupName);
            if (grpCmp !== 0) { return grpCmp; }
            if (a.recorddesc) {
                return a.recorddesc.localeCompare(b.recorddesc);
            }
            return 0;
        })
    }
    const groupSelection = sortedRecords.reduce( (acc, elem) => {
        if (acc.filter( accElem => accElem.id === elem.groupName).length === 0) {
            acc.push({id:elem.groupName,description:elem.groupDescription || elem.groupName})
        }
        return acc
    },[{id:'',description:''}]).sort((a,b)=> a.description.localeCompare(b.description))


    sortedRecords = sortedRecords.filter(filterRecords)

    // updatedFilter=false
    return {
        recordType:  recordType,
        records:  sortedRecords,
        groupData:  recordState.groupData,
        groupSelection: groupSelection,
        loading: loading,
        currentFilter: currentFilter,
        store: ownProps.store
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: (recordType) => {
          dispatch(fetchPublicDocs({recordType:recordType}));
    },
    updateFilter: updateFilter
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicRecordsUI);
