import React from 'react';
import {  Col } from 'react-bootstrap';
import SmartLink from '../../Components/SmartLink'
import  './IndexPage.css'

function LinkBlock(elementBlock, index){
    // console.log('elementBlock:', elementBlock);
    return (
        <div key={index} className="LinkBlock">
            <div >{elementBlock.elementBlock.key}</div>
            <ul>
            {elementBlock.elementBlock.links.map((link, colNum) =>
                <li key={colNum} >
                <span >
                    <SmartLink link={link.link} linkText={link.desc} /><br /></span>
                </li>
                )}
            </ul>
        </div>
    )
    // {JSON.stringify(elementBlock)}
    // <li key={colNum}><SmartLink link={link.link} linkText={link.desc} /></li>
    // <div key={colNum} >{JSON.stringify(lnk)}&nbsp;</div>)}
}

export default class IndexPage extends React.Component {
    componentWillMount() {
        this.props.fetchData();
    }

    /*
     {JSON.stringify(this.props.links)}
    <li key={index}><SmartLink {...link}/></li>
    <li key={index}><SmartLink link={link.link} linkText={link.desc} /></li>
    <li key={index}>{element}</li>
*/

// <div style={{columnCount: 2}} className='indexListLinks'>
render() {
    return (
        <div id='IndexPage'>
            <Col md={12}  id="contentArea"  >
            <h1 style={{textAlign:'center'}}>{this.props.title}</h1>
            <div className='indexListLinks'>
            {this.props.links.map((keyElement, index) =>
                <LinkBlock key={index} elementBlock={keyElement} index={index}></LinkBlock>
            )}
            </div>
            </Col>
        </div>
    );
}

}
