 import AgendasAndMinutesUI from './AgendasAndMinutes'
 import { connect } from 'react-redux'
 import {documentsByYear} from '../../libs/AgendasAndMinutes'

const mapStateToProps = (state, ownProps) => {
    let agendaState = ownProps.agendasAndMinutes || state.agendasAndMinutes;
    let sortedDocuments= ownProps.agendasAndMinutes || documentsByYear(agendaState.documents)

  return {
      meetings: sortedDocuments,
      // meetingGroupName: ownProps.group.groupName,
      loading: agendaState.loading,
      title: ownProps.title ||  'Agendas And Minutes'
  };
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(AgendasAndMinutesUI);
