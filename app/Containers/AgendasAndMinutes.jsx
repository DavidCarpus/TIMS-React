import React from 'react';
 import AgendasAndMinutesUI from '../Components/AgendasAndMinutes'
 import data from '../Data/PublicRecords.json'

export default class AgendasAndMinutes extends React.Component {
    groupBy(xs, key) {
        return xs.reduce(function(rv, x) {
            const _order = x.type == 'Agenda' ? 1 : x.type == 'Minutes' ? 2: 3;
            (rv[x[key]] = rv[x[key]] || []).push({link:x.link, desc:x.desc, type: x.type, order: _order});
            return rv;
        }, {});
    }

    render() {
        var groupName= this.props.groupName
        var id = groupName + '_AgendasAndMinutes'
        var title = this.props.title || 'Meeting Agendas and Minutes'

        var meetings = data.filter( (record)=> {
            return  record.groupName == groupName &&
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
        var groupedMeetings = this.groupBy(meetings, 'date')
        var meetings2 = Object.keys(groupedMeetings).
            map( _date  => {
                return {date:_date, values:  groupedMeetings[_date]}
            })


        return (
        <div>
            <AgendasAndMinutesUI meetings={meetings2} title={title} groupName={groupName}/>
        </div>
        )
    }
}
