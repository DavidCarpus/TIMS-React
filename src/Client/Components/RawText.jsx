import React from 'react';

export default function RawText({groupPageText, block }){
    if(groupPageText === null || typeof groupPageText === 'undefined') return null

    var rawText = ''
    if (Array.isArray(groupPageText)) {
        const blockData = groupPageText.filter(item => item.sectionName === block);
        if (blockData.length > 0) {
            rawText = blockData[0].html
            rawText =  {__html: rawText}
            return (<p  dangerouslySetInnerHTML={rawText} ></p>)
        }
    } else {
        console.log("groupPageText not array:", groupPageText);
        return (<p></p>)
    }
    return null
}
