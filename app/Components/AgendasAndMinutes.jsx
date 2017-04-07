import React from 'react';
 import SmartLink from '../Components/SmartLink'

export default class AgendasAndMinutes extends React.Component {
    renderMeeting(meetingElements) {
        return meetingElements.map( (element, index) => {
            const text = element.desc || element.type;
         return (
             <span> <SmartLink link={element.link} linkText={text} />  </span>
         )
     });
    }

    renderMeetings(meetings) {
        var component=this
           return meetings.map( (meeting, index) => {
            return (
                <li className="list-group-item" >
                    {meeting.date} -
                    {component.renderMeeting(meeting.values)}
                </li>
            )
        });
    }

    render() {
        var id = this.props.groupName + '_AgendasAndMinutes'
        var title = this.props.title || 'Agendas And Minutes'
        var meetings = this.props.meetings

        return (
            <div id={id}>
                {meetings.length > 0 ? <h2>{title }</h2> : ''}
                {this.renderMeetings(meetings) }
            </div>
        )
    }
}
