import React from 'react';
import  './Notices.css'
import SmartLink from '../SmartLink'

const dateStr =(date)=> date && (date.getUTCMonth()+1) + '/' + date.getUTCDate()+ '/' + date.getUTCFullYear()
const maxDisplay = 5
export default function  NoticesList({alertnotices, notices}){
    if (notices.length === 0) {        return(null);    }

    return (
        <section id='notices' >
            <a id="Notices-bookmark">Notices Start</a>
            <div id='alerts'>
                <ul className="hidebullets">
                    {alertnotices.map( (notice,index) =>
                        <li key={notice.id || index}>
                            <SmartLink link={notice.link || ""} id={notice.id} linkText={notice.description} />
                        </li>
                    )}
                </ul>
            </div>

            <h2>Notices</h2>
            <ul className="hidebullets">
                {notices.slice(0,maxDisplay).map( (notice,index) =>
                    <li key={notice.id || index}>
                        <SmartLink link={notice.link || ""} id={notice.id} linkText={notice.description || (notice.pageLink + "-"+ notice.recordtype)} />
                        <span className="posted">
                            (Posted {dateStr(new Date(notice.date))})
                            {typeof notice.pageLink !== 'undefined' && notice.pageLink !== 'UNK'  ?
                                "- " + notice.pageLink :
                                ""
                            }
                        </span>
                    </li>
                )}
            </ul>
            {notices.length > maxDisplay &&
                <SmartLink link="/PublicRecords/Notices" id="0" linkText=" ... More" />
            }

        </section>
    )
}
