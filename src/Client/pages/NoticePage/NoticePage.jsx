import React from 'react';
import {  Col } from 'react-bootstrap';
// import SmartLink from '../../Components/SmartLink'
import RawText  from '../../Components/RawText'
import  './NoticePage.css'

export default class NoticePage extends React.Component {
    componentWillMount() {
        this.props.fetchData(this.props.noticeID);
    }

render() {
    // let titleHeader = this.props.title.map(line => {return "<span>"+ line + "<br /></span>" }).join('\n')

    return (
        <div>
            <Col md={10}  mdPush={1}  id="contentArea"  >
                <h1 style={{textAlign:'center'}}>
                    <img  src='/images/MiltonSeal.png'  alt="Town Logo"
                        width="100" height="100"
                        />
                    <br />
                {this.props.title.map ( (line, index) =>
                    <span key={index}>{line}<br /></span>
                )}
                </h1>
                <RawText groupPageText={this.props.notice} block='description' />
            </Col>
        </div>
    );
}

}
