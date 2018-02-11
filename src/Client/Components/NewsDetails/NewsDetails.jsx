import React from 'react';
import  './NewsDetails.css'
import {Link} from 'react-router-dom';
//=======================================
const formatPostedDate = (dateToFormat) => {
    const dateObj =new Date(dateToFormat)
    return dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1) + '-' + dateObj.getDate()
}
//--------------------------------------------------------
const linkToNewsAttachment = (attachment, index) =>{
    // const URI =  '/api/NewsAttachment/' + attachment.id
    const URI =  '/ViewFile/' + attachment.id
    return (
        <Link to={URI} target="_blank" onClick={(event) => { event.preventDefault(); window.open(URI);}}>
            {attachment.desc|| "Attachment " + (index+1)}
        </Link>
    )}
//=======================================
export default function NewsDetails({newsData, loading, attachments}){
    if ( loading || typeof newsData === 'undefined') {
        return (<div>Loading{JSON.stringify(newsData)}</div>)
    }
    return (
        <div id='NewsDetails'>
            <div id='newsElement'>
                <h2>{newsData.summary}</h2>
                <div dangerouslySetInnerHTML={{__html: newsData.html}} />
                <hr/>
                {attachments.map( (attachment, index)=>
                    <div key={attachment.id} className='fileLink'>
                        {linkToNewsAttachment(attachment, index)}
                    </div>
                )}
                <br/>
                Posted: {formatPostedDate(newsData.datePosted)}
            </div>
        </div>
    )
}
