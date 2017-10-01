import React from 'react';
 import SmartLink from '../SmartLink'
 import  './DocumentList.css'

 const dateStr =(date)=> date && (date.getUTCMonth()+1) + '/' + date.getUTCDate()+ '/' + date.getUTCFullYear()

 export default function DocumentList({groupName, loading, id, title, documents}){
     if ( loading) {         return (<div>Loading</div>)     }
     if (documents.length === 0) {        return(null);    }

     return (
         <div id='DocumentList'>
             <a id="DocumentList-bookmark">DocumentList Start P</a>
             <h2>{title} </h2>
             {documents.map( (document, index) =>
                     <div key={index} >
                         <SmartLink id={document.id} link={document.link} linkText={document.description || document.link} />
                         <span className="posted">
                             (Posted {dateStr(new Date(document.date))})
                             {typeof document.pageLink !== 'undefined' && document.pageLink !== 'UNK'  ?
                                 "- " + document.pageLink :
                                 ""
                             }
                         </span>
                     </div>
                 )}
                 <SmartLink link={"/PublicRecords/Documents/"+groupName} id="0" linkText=" ... More" />
         </div>
     )
 }
