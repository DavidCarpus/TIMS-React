import React from 'react';
import FAQData from '../Data/FAQ.json'
 import SmartLink from '../Components/SmartLink'
 import FAQListUI from '../Components/FAQList'


export default class FAQList extends React.Component {
    render() {
        var groupName= this.props.groupName
        var id = groupName + '_FAQ'
        var title = this.props.title || `Milton ${groupName} FAQ`
        var questions = FAQData.filter( (doc)=>
                    {return doc.department == groupName } )

        return (
            <div>
                <FAQListUI questions={questions} title={title} groupName={groupName} />
            </div>
        )
    }
}

/*


*/
