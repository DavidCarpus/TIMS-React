// import React from 'react';
import MiniCalendar from './MiniCalendar'
 import { connect } from 'react-redux'
import { fetchCalendarData } from '../../actions/CalendarData'

const mapStateToProps = (state, ownProps) => {
    let recordState = state.CalendarData;

    let calendarData = recordState.CalendarData || [];

    return {
        calendarData: calendarData,
        group: ownProps.group,
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchData: () => {
         dispatch(fetchCalendarData())
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MiniCalendar);
