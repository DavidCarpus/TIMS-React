import React from 'react';
 import data from '../Data/AgendasAndMinutes.json'
 import SmartLink from './SmartLink'

 class MeetingBlock extends React.Component {
     render() {
         var meeting = this.props.meeting
         // TODO: Have meeting.minutesLabel display even if link not there
        //  var minutesLabel = meeting.minutesLabel
         var minutesLink=meeting.minutesLabel
         if (meeting.minutesLink) {
             var minutesLabel = meeting.minutesLabel || 'Minutes'
             minutesLink = <SmartLink link={meeting.minutesLink} linkText={minutesLabel} />
         }
         return (
             <div id='MeetingBlock'>
                 {meeting.meetingDate}
                 {meeting.agendaLink ? '-' : ''}
                 {meeting.agendaLink ? <SmartLink link={meeting.agendaLink} linkText='Agenda' /> : ''}
                 {meeting.minutesLink ? '-' : ''}
                 {minutesLink}
                 {meeting.videoLink ? '-' : ''}
                 {meeting.videoLink ? <SmartLink link={meeting.videoLink} linkText='Video' /> : ''}
             </div>
         )
     }
 }

export default class AgendasAndMinutes extends React.Component {
    render() {
        var groupName= this.props.groupName
        var id = groupName + '_AgendasAndMinutes'
        var title = this.props.title || 'Meeting Agendas and Minutes'
        var meetings = data.filter( (meeting)=>
                    {return meeting.groupName == groupName } )

        var out = JSON.stringify(meetings)
        return (
            <div id={id}>
                {meetings.length > 0 ? <h2>{title}</h2> : ''}
                    {meetings.
                        sort((a, b) => {
                        return new Date(b.meetingDate) - new Date(a.meetingDate);
                        }).
                        map( (meeting, index) =>
                            <div key={index} >
                                <MeetingBlock meeting={meeting}/>
                            </div>
                        )}
            </div>
        )
    }
}
