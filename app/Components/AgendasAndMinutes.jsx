import React from 'react';
 import SmartLink from '../Components/SmartLink'

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
                 ---
                 {minutesLink}
                 {meeting.agendaLink ? <SmartLink link={meeting.agendaLink} linkText='Agenda' /> : ''}
                 {meeting.videoLink ? <SmartLink link={meeting.videoLink} linkText='Video' /> : ''}
             </div>
         )
     }
 }
 /*
 {meeting.minutesLink ? '-' : ''}
 {meeting.agendaLink ? '-' : ''}
 {meeting.videoLink ? '-' : ''}

 */

export default class AgendasAndMinutes extends React.Component {
    render() {
        var id = this.props.groupName + '_AgendasAndMinutes'
        var title = this.props.title
        var meetings = this.props.meetings

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
