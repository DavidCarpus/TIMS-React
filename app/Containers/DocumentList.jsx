import React from 'react';
 import SmartLink from '../Components/SmartLink'
 import DocumentListUI from '../Components/DocumentList'

 import data from '../Data/PublicRecords.json'

export default class DocumentList extends React.Component {
    render() {
        var groupName= this.props.groupName
        var id = groupName + '_Documents'
        var title = this.props.title || `${groupName} Documentation`

        var documents = data.filter( (record)=> {
            return  record.groupName == groupName && record.type == 'Document'
        } ).sort((a, b) => {
            const ad = new Date(a.date);
            const bd = new Date(b.date);
            return ad<bd ? -1: ad>bd ? 1: a.order - b.order
            // return ad<bd ? -1: ad>bd ? 1:  b.order - a.order
        })


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
