import React from 'react';
 import documentData from '../Data/Documents.json'
 import SmartLink from './SmartLink'
// var documents = documentData.filter( (document)=>
//             {return document.department == 'Assessing'} )
//
export default class DocumentList extends React.Component {
    render() {
        // var groupName= 'Sewer'
        var groupName= this.props.groupName
        var id = groupName + '_Documents'
        var title = this.props.title || `${groupName} Documentation`
        var documents = documentData.filter( (doc)=>
                    {return doc.department == groupName } )

        var out = JSON.stringify(documents)
        return (
            <div id={id}>
                {documents.length > 0 ? <h2>{title}</h2> : ''}
                    {documents.
                        sort((a, b) => {
                        return new Date(b.date) - new Date(a.date);
                        }).
                        map( (document, index) =>
                            <div key={index} >
                                <SmartLink link={document.link} linkText={document.desc || document.link} />
                            </div>
                        )}
            </div>
        )
    }
}
