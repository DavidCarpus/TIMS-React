import React from 'react';
// import { Document,Page } from 'react-pdf/build/entry.webpack';
import { Document,Page } from 'react-pdf';

export default function PDFView({fileData, loading, id, onDocumentLoad, currentPage}){
    if(loading) return (<div>Loading</div>)

    if(typeof fileData.id === 'undefined'){
        // console.log('Missing ID');
        return (null)
    }
    const dataURI='data:' + fileData.FileType + ';base64, ' + fileData.FileData

    return (
        <div>
            <Document file={dataURI} onLoadSuccess={onDocumentLoad} >
              <Page pageNumber={currentPage} />
            </Document>
        </div>
    )
}
