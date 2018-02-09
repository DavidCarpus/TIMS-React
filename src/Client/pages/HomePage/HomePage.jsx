import React from 'react';
import { Col, Row } from 'reactstrap';
import MainCalendar from '../../Components/MainCalendar'
import ContactUs from '../../Components/ContactUs'
import NewsList from '../../Components/NewsListing'


import './HomePage.css';
import {PageNavbar,addMenu} from '../../Components/PageNavbar'


export default class HomePage extends React.Component {
    componentWillMount() {
        this.props.fetchData(this.props);
    }

    render() {
        let pageNavMenus=[ {text:'^^^', target:'primary-content-top', hoverText:'Top'}]

        if (this.props.notices.length > 0 ) {
            pageNavMenus = addMenu(pageNavMenus, {text:'News', target:'NewsList-bookmark', fontAwsomeIcon:'fa-bell'});
        }
        pageNavMenus = addMenu(pageNavMenus, {text:'Calendar', target:'MainCalendar-bookmark', fontAwsomeIcon:'fa-calendar'});
        pageNavMenus = addMenu(pageNavMenus, {text:'Contacts', target:'ContactUs-bookmark', fontAwsomeIcon:'fa-address-book'});

        return (
            <div id='HomePage'>
                <PageNavbar menus={pageNavMenus}/>
                <Row >
                  <Col  md={{size:10, push:1}}  xs={{size:12}}>
                          <NewsList
                              news={this.props.notices}
                              limit={5}
                              groupName='Home'/>
                          <MainCalendar />
                          <ContactUs/>
                  </Col>
            </Row>
        </div>
        );
    }
}
/*


<Col md={{size:3, pull:7}} xs={{size:12}}>
<Aside  group={this.props.group}  store={this.props.store} groupName={'Home'} />
</Col>
<Col   md='2'  sm={{size:7}}>
<div className="title">
<MiniCalendar />
</div>
</Col>


<Col md={{size:3}}><Aside  group={this.props.group}  store={this.props.store} groupName={'Home'} /></Col>
<Col md={{size: 7, offset: 3}} id="contentArea">
<div className="title">
<h1>Welcome to the {this.props.municipalLongName}</h1>
<address >424 White Mountain Highway</address>
</div>
</Col>
<Col md={{size:2, offset:10}}><MiniCalendar /></Col>

<Col md={{size: 'auto', push: 3}} id="contentArea">
    <div className="title">
        <h1>Welcome to the {this.props.municipalLongName}</h1>
    </div>

</Col>
<Col md={{size:3, pull: 1}}><Aside  group={this.props.group}  store={this.props.store} groupName={'Home'} /></Col>
<Col md={{size:2, push:7}}><MiniCalendar /></Col>

<NoticesList
group={this.props.group}
store={this.props.store}
groupName='Home'/>

<Col md={3} mdPull={7}><Aside  group={this.props.group}  store={this.props.store} groupName={'Home'} /></Col>
<Col md={2}  ><MiniCalendar /></Col>

*/
