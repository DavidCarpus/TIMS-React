import React from 'react';
import documentData from '../Data/Documents.json'
 import SmartLink from '../UI/SmartLink'
 import DocumentListUI from '../UI/DocumentList'

export default class DocumentList extends React.Component {
    render() {
        var groupName= this.props.groupName
        var id = groupName + '_Documents'
        var title = this.props.title || `${groupName} Documentation`
        var documents = documentData.filter( (doc)=>
                    {return doc.department == groupName } )

        return (
            <div>
                <DocumentListUI documents={documents} title={title} groupName={groupName} />
            </div>
        )
    }
}

/*

DocumentList:
{JSON.stringify(groupName)}
{JSON.stringify(documents)}

*/
