import React from 'react';
// import SmartLink from '../SmartLink/SmartLink'
import SmartLink from '../SmartLink'
import s from './AgendasAndMinutes.css'

 const AgendasAndMinutes = ({meetings, loading, id, title}) => {
     if ( loading) {         return (<div>Loading</div>)     }
     if (meetings.length === 0) {        return(null);    }
     if (Object.keys(meetings).length === 0) { return null }

     var currentMeetings = Object.keys(meetings)
         .map( _date  => {
             return {date:_date, values:  meetings[_date]}
         })

     return (
         <div id='AgendasAndMinutes' className={s.li}>
              <h2>{title}</h2>
              {currentMeetings.map( (meeting, index) => {
               return (
                   <li className={s.li}  key={index}>
                       {meeting.date} -
                       {meeting.values.map((element, index) => {
                           const text = element.desc || element.type;
                           return(<span  key={index}> <SmartLink link={element.link} id={element.id} linkText={text} />  </span>)
                       })}
                   </li>
               )
           })}
         </div>
     )
 }

 export default AgendasAndMinutes;
