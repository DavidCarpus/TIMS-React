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
    if (link.endsWith('pdf')) {
        lnkStyle='pdf_link'
        reduxLink = false
    }
    if (link.endsWith('.doc') || link.endsWith('.docx')) {
        lnkStyle='doc_link'
        reduxLink = false
    }
    if (link.endsWith('.jpg') || link.endsWith('.jpeg')) {
        lnkStyle='jpgImage_link'
        reduxLink = false
    }
    if (link.endsWith('.xls') || link.endsWith('.xlsx')) {
        lnkStyle='excel_link'
        reduxLink = false
    }

    if (link.includes('youtube.com')) {
        lnkStyle='youtube_link'
        reduxLink = false
    }
    if (!link.startsWith('/')) {
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
                event.preventDefault(); window.open(this.makeHref(link));
            }} >{linkText}</Link>)
        }
    }
}
