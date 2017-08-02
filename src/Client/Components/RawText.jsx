import React from 'react';

export default function RawText({groupPageText, block }){
    var rawText = ''
    if (groupPageText ) {
        if (Array.isArray(groupPageText)) {
            rawText = groupPageText.filter(item => typeof item[block] !== 'undefined')[0];
            if (typeof rawText !== 'undefined') {
                rawText = rawText[block]
                rawText =  {__html: rawText}
            }
        } else {
            // console.log("groupPageText:", groupPageText);
            if (block in groupPageText) {
                rawText =groupPageText[block];
                rawText =  {__html: rawText}
            }
        }
    }

    if (rawText) {
        return (
            <p  dangerouslySetInnerHTML={rawText} ></p>
        )
    }else {
        return (
            <p></p>
        )
    }
}
