import React from 'react';
import  './NewsList.css'
import SmartLink from '../SmartLink'

function NewsListElement({id, summary, postedDate}) {
    // console.log('summary',id, summary);
    // <SmartLink link={notice.link || ""} id={id} linkText={summary} />
    // {id} - {summary} - {postedDate}

    return (
        <div id='newsElement'>
            <SmartLink link={"/News/"+id} id={id} linkText={summary} />
            <br/>
        </div>
    )
}

export default class NewsList extends React.Component {
    componentWillMount() {
        this.props.fetchNewsList(this.props.group.link);
    }

    createMarkup(desc){
        // var desc = this.props.item.desc
        return {__html: desc};
    }

    render() {
        if ( this.props.loading) {
            // console.log('***NewsList loading. ');
            return (<div>Loading</div>)
        }

        return (
            <div id='NewsList'>
                <a id="NewsList-bookmark">NewsList bookmark</a>
                <h2>News</h2>
                    {this.props.newsData.map( (news,index) =>
                        <NewsListElement
                            summary={news.summary}
                            key={news.id}
                            id={news.id}
                            postedDate={news.postedDate} />
                    )}
            </div>
        )
    }
}
/*
<div>
{JSON.stringify(news.summary)}
<hr/>
</div>
{JSON.stringify(this.props.newsData)}
{this.props.newsData.map( (news,index) =>
    <div>
        {JSON.stringify(news)}
    </div>
)}


{out}

<div>{out}</div>


*/
