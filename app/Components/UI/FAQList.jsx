import React from 'react';
 import FAQData from '../Data/FAQ.json'
// var documents = documentData.filter( (document)=>
//             {return document.department == 'Assessing'} )
//
class FAQ extends React.Component {
    render() {
        // <li ><p dangerouslySetInnerHTML={desc} ></p></li>
        var question = {__html: this.props.question.question}
        var answer = {__html: this.props.question.answer}
        return (
            <div className='FAQ'>
                <i className='question' dangerouslySetInnerHTML={question} ></i>
                <div className='answer' dangerouslySetInnerHTML={answer} ></div>
                <br/>
            </div>
        )
    }
}

export default class FAQList extends React.Component {
    createMarkup(desc){
        // var desc = this.props.item.desc
        return {__html: desc};
    }

    render() {
        // var groupName= 'Sewer'
        var groupName= this.props.groupName
        var id = groupName + '_FAQ'
        var title = this.props.title || `Milton ${groupName} FAQ`
        var questions = FAQData.filter( (doc)=>
                    {return doc.department == groupName } )

        var out = JSON.stringify(questions)
        return (
            <div id={id}>
                {questions.length > 0 ? <h2>{title}</h2> : ''}
                    {questions.map( (question, index) =>
                        <FAQ key={index} question={question} />
                        )}
            </div>
        )
    }
}

/*
<div>{out}</div>


*/
