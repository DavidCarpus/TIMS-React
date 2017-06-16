import React from 'react';
import {Link} from 'react-router-dom';
import  './SmartLink.css'
var Config = require('../../config'),
configuration = new Config();

export default function SmartLink({id, link='', linkText}){
    var lnkStyle={}
    if (!link || typeof link === 'undefined') {
        link = '';
    }
    if (link.endsWith('pdf')) {
        lnkStyle='pdf_link'
    }
    if (link.includes('youtube.com')) {
        lnkStyle='youtube_link'
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
    } else {
        // TODO: Add link/call to 'downloader'
        if (lnkStyle === 'pdf_link') {
            link = configuration.ui.ROOT_URL + 'fetchfile/' + id;
            return (<a
                className={lnkStyle}
                href={link}>{linkText}</a>)
        }
        return(<Link  className={lnkStyle} to={link}>{linkText}</Link >)
    }
}
