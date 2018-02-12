import React from 'react';
import  './NewsList.css'
import SmartLink from '../SmartLink'

export default function NewsList({newsData, loading, totalCount}){
    if ( loading) {         return (<div>Loading</div>)     }
    if (newsData.length === 0) {        return(null);    }

    return (
        <div id='NewsList'>
            <a id="NewsList-bookmark">NewsList bookmark</a>
            <h2>News</h2>
            <ul>
                {newsData.map( (news,index) =>
                <li key={news.id}>
                    <SmartLink link={"/News/"+news.id} id={news.id} linkText={news.summary} />
                </li>
            )}
            </ul>
            { (newsData.length < totalCount) &&  (<SmartLink link={"/PublicRecords/News"} linkText={"More>>"} /> ) }
        </div>
    )
}
