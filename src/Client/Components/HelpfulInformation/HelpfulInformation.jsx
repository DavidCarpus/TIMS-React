import React from 'react';
import SmartLink from '../SmartLink'
import  './HelpfulInformation.css'

export default function HelpfulInformation({informationArray, loading, title="Helpful Information"}){
    if ( loading) {         return (<div>Loading</div>)     }
    if (informationArray.length === 0) {        return(null);    }

        return (
            <div id='HelpfulInformation'><h2>{title}</h2>
                {informationArray.map((information, index) =>
                    <div key={information.id}><SmartLink id={information.id} link={information.fileLink} linkText={information.description} /></div>
                )}
                </div>
        );

}
