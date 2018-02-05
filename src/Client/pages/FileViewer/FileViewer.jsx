import React from 'react';
import { Col, Row } from 'reactstrap';
// import SmartLink from '../../Components/SmartLink'
// import RawText  from '../../Components/RawText'
import  './FileViewer.css'
import PDFView  from '../../Components/PDFView/'
// import  './IndexPage.css'

const PageNav = ({currentPage, totalPages, prev, next}) =>
    <div id="pageNavigation">
        <span  className='prev nav' onClick={()=> prev()}>
            {currentPage > 1 &&  <a >{"<"}</a> }
        </span>
        <span className="pageLocation">{"Page: " + currentPage + " of "+totalPages}</span>
        <span className='next  nav' onClick={()=> next()}>
            {currentPage < totalPages && <a >{">"}</a>}
        </span>
    </div>



export default class FileViewerPage extends React.Component {
    componentWillMount() {
        this.props.id && this.props.fetchData(this.props.id);
    }

render() {
    const prevPage = () => {
        this.props.setCurrentPage(this.props.currentPage-1)
        console.log('prevPage');
    }
    const nextPage = () => {
        console.log('nextPage');
        this.props.setCurrentPage(this.props.currentPage+1)
    }
    return (
        <Row>
            <Col  md={{size:10, push:1}} id='contentArea'>
                <h1 >
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
                <PageNav currentPage={this.props.currentPage} totalPages={this.props.totalPages}
                    prev={()=> prevPage()} next={()=> nextPage()}
                    ></PageNav>

                <PDFView  fileData={this.props.fileData}
                     currentPage = {this.props.currentPage}
                     pageRoutines={{setTotalPages:this.props.setTotalPages}}
                    />
                <PageNav currentPage={this.props.currentPage} totalPages={this.props.totalPages}
                    prev={()=> prevPage()} next={()=> nextPage()}
                    ></PageNav>
            </Col>
        </Row>
    );
}
// <div id="pageNavigation">
//     <span  className='prev nav' onClick={()=> prevPage()}>
//         {this.props.currentPage > 1 &&  <a >{"<"}</a> }
//     </span>
//     <span className="pageLocation">{"Page: " + this.props.currentPage + " of "+this.props.totalPages}</span>
//     <span className='next  nav' onClick={()=> nextPage()}>
//         {this.props.currentPage < this.props.totalPages && <a >{">"}</a>}
//     </span>
// </div>

}
// <RawText groupPageText={this.props.news.html} block='html' />
