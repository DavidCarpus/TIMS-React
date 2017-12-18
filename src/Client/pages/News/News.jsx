import React from 'react';
import { Col, Row } from 'reactstrap';
// import SmartLink from '../../Components/SmartLink'
// import RawText  from '../../Components/RawText'
import  './News.css'
import NewsDetails  from '../../Components/NewsDetails'
// import  './IndexPage.css'

export default class NoticePage extends React.Component {
    componentWillMount() {
        this.props.id && this.props.fetchData(this.props.id);
    }
render() {
    // let titleHeader = this.props.title.map(line => {return "<span>"+ line + "<br /></span>" }).join('\n')
    // <img  src='/images/MiltonSeal.png'  alt="Town Logo"
    //     width="100" height="100"
    //     />

    // className='townSeal'

    return (
        <Row>
            <Col  md={{size:10, push:1}} id='contentArea'>
                <h1 style={{textAlign:'center'}}>
                    <img  src={this.props.Config.leftMenuImage}
                        width="100"
                        height="100"
                        alt="HomePage"
                        title="Home Page" />
                    <br />
                {this.props.title.map ( (line, index) =>
                    <span key={index}>{line}<br /></span>
                )}
                </h1>
                <NewsDetails  newsRec={this.props.news}/>
            </Col>
        </Row>
    );
}

}
// <RawText groupPageText={this.props.news.html} block='html' />
