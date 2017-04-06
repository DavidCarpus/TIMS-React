import React from 'react';
 import data from '../Data/AgendasAndMinutes.json'
 import AgendasAndMinutesUI from '../Components/AgendasAndMinutes'

export default class AgendasAndMinutes extends React.Component {
    render() {
        var groupName= this.props.groupName
        var id = groupName + '_AgendasAndMinutes'
        var title = this.props.title || 'Meeting Agendas and Minutes'
        var meetings = data.filter( (meeting)=> {return meeting.groupName == groupName } )

        return (
        <div>
            <AgendasAndMinutesUI meetings={meetings} title={title} groupName={groupName}/>
        </div>
        )
    }
}
