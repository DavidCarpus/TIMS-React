import React from 'react';
 import  './GroupMembers.css'

function memberBlock(member, index, cols){
    return (
        <div key={index} className="memberBlock">
            {cols.map((col, colNum) =>
                <div key={colNum} className={col.toLowerCase()}>{member[col.toLowerCase()]}&nbsp;</div>)}
        </div>
    )
}
function addressBlock(addressstr) {
    if (typeof addressstr === 'undefined' || addressstr.length === 0) {        return(null);    }
    let addressElements =  addressstr.split('\n');
    return (
        <div id='addressBlock'>
            <h3>Address</h3>
            <address>
            {addressElements.map( (address, addressLine) =>
                <div key={addressLine}>{address}</div>
            )}
        </address>
    </div>     )
}
function hourBlock(hourstr) {
    if (typeof hourstr === 'undefined' || hourstr.length === 0) {        return(null);    }
    let hours =  hourstr.split('\n');
    return (
        <div id='hours'>
            <br/>
            <h3>Hours</h3>
            {hours.map( (line, index) =>
                <div key={index}>{line}</div>
            )}
         </div>
    )

}


export default function GroupMembers({groupName, title, members, loading, addressstr, hourstr, groupEmail, showTerm=true, showEmail}){
    if ( loading) {         return (<div>Loading</div>)     }
    if (members.length === 0) {        return(null);    }

     let cols=['Office', 'Name', 'Phone'];
     if(showTerm) cols.push('Term')
     if(showEmail) cols.push('Email')

     return (
         <div id='groupMembers'>
             <a id="groupMembers-bookmark">groupMembers Start</a>
             <h2>{title}</h2>
                 {  cols.map((col, colNum) =>
                     <div key={colNum} className={col.toLowerCase()}>{col}</div>)
                 }
                 {members.map( (member, index) =>
                     memberBlock(member, index, cols) )}

                 {groupEmail ? groupEmail: ''}
                 {hourBlock (hourstr)}
                 {addressBlock (addressstr)}
         </div>
     )
 }
