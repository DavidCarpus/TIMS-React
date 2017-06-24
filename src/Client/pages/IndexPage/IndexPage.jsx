import React from 'react';
import {  Col } from 'react-bootstrap';
import SmartLink from '../../Components/SmartLink'

function LinkBlock(elementBlock, index){
    // console.log('elementBlock:', elementBlock);
    return (
        <div key={index} className="LinkBlock">
            <div >{elementBlock.elementBlock.key}</div>
            {elementBlock.elementBlock.links.map((link, colNum) =>
                <span key={colNum}>
                    <SmartLink link={link.link} linkText={link.desc} /><br /></span>
                )}
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

render() {
    return (
        <div>
            <Col md={12}  id="contentArea"  >
            <h1 style={{textAlign:'center'}}>{this.props.title}</h1>
            <div style={{columnCount: 2}}>
            {this.props.links.map((keyElement, index) =>
                <LinkBlock key={index} elementBlock={keyElement} index={index}></LinkBlock>
            )}
            </div>
            </Col>
        </div>
    );
}

}
