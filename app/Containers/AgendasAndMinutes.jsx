import React from 'react';
 import AgendasAndMinutesUI from '../Components/AgendasAndMinutes'
 import { connect } from 'react-redux'

function groupBy(xs, key) {
     return xs.reduce(function(rv, x) {
         (rv[x[key]] = rv[x[key]] || []).push({link:x.link, desc:x.desc, type: x.type});
         return rv;
     }, {});
 }
const mapStateToProps = (state, ownProps) => {
    var meetings = state.PublicRecords.filter( (record)=> {
        return  record.groupName == ownProps.groupName &&
            (record.type == 'Agenda' || record.type == 'Minutes' || record.type == 'Video' )
    } ).map( record => {
        var _order
        switch (record.type) {
            case 'Agenda':  _order=1; break;
            case 'Minutes': _order=2;break;
            case 'Video':    _order=3;break;
            default:
                _order=99;
        }
        return {...record, order: _order}
    }).sort((a, b) => {
        const ad = new Date(a.date);
        const bd = new Date(b.date);
        // return (ad < bd) ? -1 : (ad > bd) ? 1:  b.order - a.order
        return ad>bd ? -1: ad < bd ? 1:  a.order - b.order
    })
    var groupedMeetings = groupBy(meetings, 'date')
    var meetings2 = Object.keys(groupedMeetings).
        map( _date  => {
            return {date:_date, values:  groupedMeetings[_date]}
        })

  return {
      meetings: meetings2,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchDocs: () => { console.log('Test') }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AgendasAndMinutesUI);
