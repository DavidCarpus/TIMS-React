import React from 'react';
import  './NewsDetails.css'
import {Link} from 'react-router-dom';

function createMarkup(txt) { return {__html: txt}; };
const dateToDateStr = (dateStr) => {
    const dateObj =new Date(dateStr)
    return dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1) + '-' + dateObj.getDate()
}

const linkToNewsAttachment = (link, linkText) => {
    return (<Link to={link} target="_blank" onClick={(event) => {
        event.preventDefault(); window.open(link);
    }} >{linkText}</Link>)

}
export default function NewsDetails({newsRec, loading}){
    if ( loading || typeof newsRec[0] === 'undefined') {
        console.log('***NewsDetails loading.', newsRec);
        return (<div>Loading{JSON.stringify(newsRec)}</div>)
    }
        const news = newsRec[0]
        const attachments = newsRec['attachments'] || []
        const posted = news.datePosted
        return (
            <div id='NewsDetails'>
                <div id='newsElement'>
                    <h2>{news.summary}</h2>
                    <div dangerouslySetInnerHTML={createMarkup(news.html)} />
                    <hr/>
                    {attachments.map( (attachment, index)=>
                        <div>
                            <div className='fileLink'>
                                {linkToNewsAttachment('/api/NewsAttachment/' + attachment.id, "Attachment " + (index+1))}
                                <span className='filePostedDate'>
                                </span>
                            </div>
                            <br/>
                        </div>
                    )}
                    <br/>
                    Posted: {dateToDateStr(posted)}
                </div>
            </div>
        )
}
