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

export default function GroupMembers({groupName, title, members, loading}){
    if ( loading) {         return (<div>Loading</div>)     }
    if (members.length === 0) {        return(null);    }

     var id = groupName + '_Members'

     let cols=['Office', 'Term', 'Name', 'Phone'];
     return (
         <div id={id} className='groupMembers'>
             <h2>{title}</h2>
                 {  cols.map((col, colNum) => <div key={colNum} className={col.toLowerCase()}>{col}</div>) }
                 {members.map( (member, index) =>
                     memberBlock(member, index, cols) )}
         </div>
     )
 }
