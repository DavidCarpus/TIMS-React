import React from 'react';
import Aside from './Aside'
import SmartLink from './SmartLink'
import layoutStyles from './MainLayout.css'

import data from './Data/CemeteryTrustees.json'
var asideData = data.asideData
var documents = data.documents

export default class CemeteryTrustees extends React.Component {

    render() {
        return (
            <div id="CemeteryTrustees">
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Cemetery Trustees Department</h1>

                    <h2>Cemetery Trustees Documentation</h2>

                </div>
                <Aside data={asideData}/>
            </div>
        );
    }

}
/*

{documents.
    sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
    }).
    map( (document, index) =>
        <div>{document.dateDesc} - {document.desc} </div>
    )}


*/
