import React from 'react';
 import SmartLink from '../Components/SmartLink'
 import s from '../Styles/AgendasAndMinutes.css'

export default class AgendasAndMinutes extends React.Component {
    componentWillMount() {
        // console.log('AgendasAndMinutes:componentWillMount: ' + this.props.groupName);
        if (! this.props.loading && this.props.meetingGroupName != this.props.groupName) {
            this.props.fetchMeetings(this.props.groupName);
        }
    }

    renderMeeting(meetingElements) {
        return meetingElements.map( (element, index) => {
            const text = element.desc || element.type;
         return (
             <span  key={index}> <SmartLink link={element.link} id={element.id} linkText={text} />  </span>
         )
     });
    }

    renderMeetings(meetings) {
        var component=this
        var currentMeetings = Object.keys(meetings).
            map( _date  => {
                return {date:_date, values:  meetings[_date]}
            })
           return currentMeetings.map( (meeting, index) => {
            //    <li className="list-group-item " + s.li  key={index}>
            return (
                <li className={s.li}  key={index}>
                    {meeting.date} -
                    {component.renderMeeting(meeting.values)}
                </li>
            )
        });
    }

    render() {
        var id = this.props.group.link + '_AgendasAndMinutes'
        var title = this.props.title ||  'Agendas And Minutes'
        var meetings = this.props.meetings || []
        // title = '<h2>'+title + '</h2>'

        return (
            <div id={id} className={s.li}>
                {Object.keys(meetings).length> 0 ? <h2>{title}</h2> : ''}
                {meetings && this.renderMeetings(meetings) }
            </div>
        )
    }
}

AgendasAndMinutes.propTypes = {
    loading: React.PropTypes.bool.isRequired,
    meetings: React.PropTypes.object.isRequired,
}
