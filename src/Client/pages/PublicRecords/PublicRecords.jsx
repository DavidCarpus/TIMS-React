import { connect } from 'react-redux'
import PublicRecordsUI from './PublicRecordsUI'
import {fetchPublicDocsFromServer} from '../../actions/PublicDocuments'

const getFilterOptions = (recordState) => {
    return [
        {fieldName:"pageLink", description:"Organization",
            options:  ( recordState.publicRecords.groups.length <= 0 )? [ ]:
            [{id:"", description:"Any"}].concat(
                recordState.publicRecords.groups.map(group=> ({id: group.pageLink, description:group.description}))
            )},
        {fieldName: "recordType", description:"Document type",
            options:( recordState.publicRecords.types.length <= 0 )? [ ]:
            [{id:"", description:"Any"}].concat(
                recordState.publicRecords.types.map(type=> ({id: type, description:type}))
            )},
    ]
}
const mapStateToProps = (state, ownProps) => {
    let recordState = state.PublicRecords;
    const records = state.PublicRecords.publicRecords.records.map(rec=>{
        if(rec.link === null && rec.type === 'News'){
            return Object.assign(rec, {link:"/News/"+rec.id})
        } else {
            return rec
        }
    })

    return {
        records:  records,
        meta:  state.PublicRecords.publicRecords.meta,
        groupData:  recordState.groupData,
        currentFilter: recordState.filter,
        filterFields: getFilterOptions(recordState),
        loading: recordState.loading,
        store: ownProps.store
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: (filter) => {
        dispatch(fetchPublicDocsFromServer(filter));
    },
    changeFilter: (evt, currentFilter, fieldName, previousValue, newValue)=>{
        dispatch(fetchPublicDocsFromServer(Object.assign({}, currentFilter, {[fieldName]:newValue})))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicRecordsUI);
