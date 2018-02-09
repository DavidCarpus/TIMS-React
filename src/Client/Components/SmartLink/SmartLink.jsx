import React from 'react';
import {Link} from 'react-router-dom';
import  './SmartLink.css'
var Config = require('../../config'),
configuration = new Config();

//==================================================
const getLinkStyle =(link, type) => {
    const extension = ((link && link.match(/\.[0-9a-z]+$/i, '') && link.match(/\.[0-9a-z]+$/i, '').length > 0) ?
        link.match(/\.[0-9a-z]+$/i, '')[0] :
        link).toUpperCase();
    const typeFromExtension = [
        {style: 'pdf_link', extensions:['.PDF']} ,
        {style: 'doc_link', extensions:['.DOC', '.DOCX']},
        {style: 'jpgImage_link', extensions:['.JPG', '.JPEG', '.PNG']},
        {style: 'excel_link', extensions:['.XLS', '.XLSX']},
        {style: 'odt_link', extensions:['.ODT']},
    ].reduce( (acc,val) => {
        if(val.extensions.includes(extension))
            return val.style
        return acc
    }, "")
    if(typeFromExtension.length>0) return typeFromExtension
    //-----------------------
    const typeFromIncludes = [
        {style: 'youtube_link', strMatch:'YOUTUBE.COM'},
        {style: 'townHallStream_link', strMatch:['TOWNHALLSTREAMS.COM']},
    ].reduce( (acc,val) => {
        if(link.toUpperCase().includes(val.strMatch))
            return val.style
        return acc
    }, "")
    if(typeFromIncludes.length>0) return typeFromIncludes
    //-----------------------
    if (! link.toUpperCase().includes(configuration.sourceTownURI.toUpperCase())
        && link.startsWith('http')
    ) {
        return 'external_link'
    }
    //-----------------------
    switch ( type) {
        case 'News': return 'news_link'
        default: return ''
    }
}
//==================================================
const getModifiedLink =(type, id) => {
    const fileAPIUrl = (configuration.mode === 'development'? 'localhost:45001/api/':configuration.ui.ROOT_URL)
    switch (type) {
        case 'News':
            return   'News/' + id;
        default:
            return fileAPIUrl + "fetchFile/"+id
    }
}
//==================================================
export default function SmartLink({id=0, link='', linkText, type=""}){
    var lnkStyle=getLinkStyle(link, type)
    var reduxLink = true;
    if(lnkStyle.length > 0) reduxLink = false

    if (!link.startsWith('/')) {
        reduxLink = false
    }
    if(lnkStyle==='news_link') reduxLink = true

    if (link.length === 0 ){
        return (<i className={lnkStyle} > {linkText}</i>)
    } else if (link.startsWith('http')) {
        return (<a
            className={lnkStyle}
            href={link}>{linkText}</a>)
    } else if (link.startsWith('MD://')) {
        link = getModifiedLink(type, id)
        return (<a
            className={'markdown_link'}
            href={link}>{ linkText}</a>)
    } else {
        if (lnkStyle.length > 0) {
            link = getModifiedLink(type, id)
            return (<Link to={link} className={lnkStyle} target="_blank" onClick={(event) => {
                event.preventDefault(); window.open(link);
            }} >{linkText}</Link>)
        } else if (reduxLink) {
            return(<Link to={link}>{linkText}</Link >)
        } else {
            link = getModifiedLink(type, id)
            return (<Link to={link} target="_blank" onClick={(event) => {
                event.preventDefault(); this ? window.open(this.makeHref(link)): alert(this+link);
            }} >{linkText}</Link>)
        }
    }
}
