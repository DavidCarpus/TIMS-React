import MainCalendar from './MainCalendar'
 import { connect } from 'react-redux'
import { fetchCalendarData, editCalendarFilter } from '../../actions/CalendarData'
import {getEventList, getCalByWeek, getInitialFilter, getEventsMonth, getMonthFromNum} from '../../libs/CalendarData'

//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
const mapStateToProps = (state, ownProps) => {
    let recordState = state.CalendarData;

    let calendarData = recordState.CalendarData ? recordState.CalendarData.map( evt=>{
        evt.startDate = new Date(evt.startDate)
        evt.endDate = (evt.endDate !== null) ? new Date(evt.endDate): null
       return evt;
   }) : []
    return {
        eventList:calendarData,
        monthName:  getEventsMonth(calendarData),
        group: ownProps.group,
        getEventList:getEventList,
        getCalByWeek: getCalByWeek,
        getMonthFromNum: getMonthFromNum,
        displayFilters: recordState.filter,
        initialValues:  Object.assign(getInitialFilter(),recordState.filter),
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchData: ( year,  month ) =>
    {
         dispatch(fetchCalendarData(year, month) )
     },
     modifyFilter: (field, event, newValue, previousValue) => {
         // dispatch(editCalendarFilter(field, event, newValue, previousValue))
         dispatch(editCalendarFilter(field, newValue))
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainCalendar);
