import React from 'react';
import SmartLink from '../SmartLink'

export default function  TownNewsletters({title, newsletters}){
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
                        <SmartLink link={entry.link}
                            linkText={entry.description}/>
                    </li>
                </div>
            )}

        </ul>
    </div>
)
}
