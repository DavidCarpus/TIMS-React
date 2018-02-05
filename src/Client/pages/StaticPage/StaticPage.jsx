import React from 'react';
import { Col, Row } from 'reactstrap';
// import SmartLink from '../../Components/SmartLink'
import  './StaticPage.css'

export default class StaticPage extends React.Component {
    componentWillMount() {
        this.props.fetchData(this.props.pageName);
    }

render() {
    const rawText =  {__html: this.props.pageData || ""}
    // TODO: Split the raw html up and extract the hrefs and convert to <LINK>s
    // console.log('this.props.pageData',this.props.pageData);

    return (
        <div id='StaticPage'>
            <Row >
            <Col  md={{size:10, push:1}}  xs={{size:12}}  id="contentArea" >
            <h1  style={{textAlign:'center'}}>{this.props.title}</h1>
                <p  dangerouslySetInnerHTML={rawText} ></p>
            </Col>
        </Row>
        </div>
    );
}
}
