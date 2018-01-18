import React from 'react';
import  './NewsList.css'
import SmartLink from '../SmartLink'

export default class NewsList extends React.Component {
    componentWillMount() {
        this.props.fetchNewsList(this.props.group.link);
    }

    createMarkup(desc){
        return {__html: desc};
    }

    render() {
        if ( this.props.loading) {
            return (<div>Loading</div>)
        }

        return (
            <div id='NewsList'>
                <a id="NewsList-bookmark">NewsList bookmark</a>
                <h2>News</h2>
                <ul>
                    {this.props.newsData.map( (news,index) =>
                    <li>
                        <SmartLink link={"/News/"+news.id} id={news.id} linkText={news.summary} />
                    </li>
                )}
                </ul>
            </div>
        )
    }
}
