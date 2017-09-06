import React from 'react';
import  './FAQList.css'

class FAQ extends React.Component {

    render() {
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
    componentWillMount() {
        this.props.fetchFAQ(this.props.group.link);
    }

    createMarkup(desc){
        // var desc = this.props.item.desc
        return {__html: desc};
    }

    render() {
        if ( this.props.loading) {
            // console.log('***FAQList loading. ');
            return (<div>Loading</div>)
        }

        return (
            <div id='FAQList'>
                <a id="FAQList-bookmark">FAQList bookmark</a>

                {this.props.questions.length > 0 ? <h2>{this.props.title}</h2> : ''}
                { this.props.questions.map( (question, index) =>
                    <FAQ key={index} question={question} />
                )}
            </div>
        )
    }
}
/*
{out}

<div>{out}</div>


*/
