import React from 'react';
 import SmartLink from '../SmartLink'
 import  './DocumentList.css'

 export default function DocumentList({groupName, loading, id, title, documents}){
     if ( loading) {         return (<div>Loading</div>)     }
     if (documents.length === 0) {        return(null);    }

     return (
         <div id='DocumentList'>
             <h2>{title} </h2>
             {documents.map( (document, index) =>
                     <div key={index} >
                         <SmartLink link={document.link} linkText={document.description || document.link} />
                     </div>
                 )}
         </div>
     )
 }
