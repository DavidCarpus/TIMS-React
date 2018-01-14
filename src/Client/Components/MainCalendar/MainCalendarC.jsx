import MainCalendar from './MainCalendar'
 import { connect } from 'react-redux'
import { fetchCalendarData, editCalendarFilter } from '../../actions/CalendarData'
import {getEventList,getCalByWeek,    getInitialFilter,    getEventsMonth} from '../../libs/CalendarData'

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
const mapStateToProps = (state, ownProps) => {
    let recordState = state.CalendarData;

    let calendarData = recordState.CalendarData ? recordState.CalendarData.map( evt=>{
        evt.startDate = new Date(evt.startDate)
        evt.endDate = (evt.endDate !== null) ? new Date(evt.endDate): null
       return evt;
   }) : []
console.log('calendarData',calendarData);
    return {
        eventList:calendarData,
        monthName:  getEventsMonth(calendarData),
        group: ownProps.group,
        getEventList:getEventList,
        getCalByWeek: getCalByWeek,
        displayFilters: recordState.filter,
        initialValues:  Object.assign(getInitialFilter(),recordState.filter),
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchData: () => {
         dispatch(fetchCalendarData())
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainCalendar);
