import React from 'react';
import SmartLink from '../SmartLink'

export default function  TownNewsletters({title, newsletters}){
    if (newsletters.length === 0) {        return(null);    }

    return (
        <div>
            <h2>{title}</h2>
            <ul>
                {newsletters.sort((a, b) => {
                    return new Date(b.date) - new Date(a.date);
                })
                .map((entry, index) =>
                <div key={index}>
                    <li>
                        <SmartLink id={entry.id} link={entry.fileLink} linkText={entry.description || entry.fileLink} />
                    </li>
                </div>
            )}

        </ul>
    </div>
)
}
