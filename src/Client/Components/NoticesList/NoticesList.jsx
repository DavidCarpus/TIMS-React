import React from 'react';
import  './Notices.css'
import SmartLink from '../SmartLink'

export default function  NoticesList({alertnotices, notices}){
    if (notices.length === 0) {        return(null);    }

    return (
        <section id='notices'>
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
                {notices.map( (notice,index) =>
                    <li key={notice.id || index}>
                        <SmartLink link={notice.link || ""} id={notice.id} linkText={notice.description} />
                    </li>
                )}
            </ul>
        </section>
    )
}
