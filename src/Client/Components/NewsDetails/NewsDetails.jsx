import React from 'react';
import  './NewsDetails.css'
import {Link} from 'react-router-dom';

function createMarkup(txt) { return {__html: txt}; };
const formatPostedDate = (dateToFormat) => {
    const dateObj =new Date(dateToFormat)
    return dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1) + '-' + dateObj.getDate()
}

const linkToNewsAttachment = (attachment, index) =>(
    <Link to={'/api/NewsAttachment/' + attachment.id} target="_blank"
        onClick={(event) => { event.preventDefault(); window.open('/api/NewsAttachment/' + attachment.id);}}
        >{attachment.desc|| "Attachment " + (index+1)}</Link>
)

export default function NewsDetails({newsData, loading, attachments}){
    if ( loading || typeof newsData === 'undefined') {
        return (<div>Loading{JSON.stringify(newsData)}</div>)
    }
        return (
            <div id='NewsDetails'>
                <div id='newsElement'>
                    <h2>{newsData.summary}</h2>
                    <div dangerouslySetInnerHTML={createMarkup(newsData.html)} />
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
