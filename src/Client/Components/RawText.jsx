import React from 'react';

export default function RawText({groupPageText, block }){
    var text1 = ''
    if (groupPageText ) {
        if (block in groupPageText) {
            text1 =groupPageText[block];
            text1 =  {__html: text1}
        }
    }

    if (text1) {
        return (
            <p  dangerouslySetInnerHTML={text1} ></p>
        )
    }else {
        return (
            <p></p>
        )
    }
}
