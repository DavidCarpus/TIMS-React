import React from 'react';
import {Link} from 'react-router-dom';
import  './SmartLink.css'
var Config = require('../../config'),
configuration = new Config();

export default function SmartLink({id=0, link='', linkText}){
    var lnkStyle=''
    var reduxLink = true;
    if (!link || typeof link === 'undefined') {
        link = '';
    }
    if (link.toUpperCase().endsWith('PDF')) {
        lnkStyle='pdf_link'
        reduxLink = false
    }
    if (link.toUpperCase().endsWith('.DOC') || link.toUpperCase().endsWith('.DOCX')) {
        lnkStyle='doc_link'
        reduxLink = false
    }
    if (link.toUpperCase().endsWith('.JPG') || link.toUpperCase().endsWith('.JPEG')) {
        lnkStyle='jpgImage_link'
        reduxLink = false
    }
    if (link.toUpperCase().endsWith('.PNG') ) {
        lnkStyle='jpgImage_link'
        reduxLink = false
    }
    if (link.toUpperCase().endsWith('.XLS') || link.toUpperCase().endsWith('.XLSX')) {
        lnkStyle='excel_link'
        reduxLink = false
    }
    if (link.toUpperCase().endsWith('.ODT')) {
        lnkStyle='odt_link'
        reduxLink = false
    }


    if (link.toUpperCase().includes('YOUTUBE.COM')) {
        lnkStyle='youtube_link'
        reduxLink = false
    }
    if (link.toUpperCase().includes('TOWNHALLSTREAMS.COM')) {
        lnkStyle='townHallStream_link'
        reduxLink = false
    }

    if (!link.startsWith('/')) {
        reduxLink = false
    }

    if (! link.toUpperCase().includes(configuration.sourceTownURI.toUpperCase())
        && link.startsWith('http')
    ) {
        lnkStyle='external_link'
        reduxLink = false
    }

    if (link.length === 0 ){
        return (<i
            className={lnkStyle}
            >
            {linkText}
        </i>)
    } else if (link.startsWith('http')) {
        return (<a
            className={lnkStyle}
            href={link}>{linkText}</a>)
    } else if (link.startsWith('MD://')) {
        link =  '/notice/' + id;
        return (<a
            className={'markdown_link'}
            href={link}>{ linkText}</a>)
            // href={link}>{'MARKDOWN:' + linkText}</a>)
    } else {
        if (lnkStyle.length > 0) {
            link = configuration.ui.ROOT_URL + 'fetchfile/' + id;
            return (<Link to={link} className={lnkStyle} target="_blank" onClick={(event) => {
                event.preventDefault(); window.open(link);
            }} >{linkText}</Link>)

        } else if (reduxLink) {
            // console.log(link);
            return(<Link  className={lnkStyle} to={link}>{linkText}</Link >)
        }
        else {
            link = configuration.ui.ROOT_URL + 'fetchfile/' + id;
            return (<Link to={link} target="_blank" onClick={(event) => {
                event.preventDefault(); this ? window.open(this.makeHref(link)): alert(this+link);
            }} >{linkText}</Link>)
        }
    }
}
