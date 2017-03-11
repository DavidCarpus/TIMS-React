import React from 'react';
import ReactDOM from 'react-dom';
import { Button, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
// import '../../libs/bootstrap/css/bootstrap.css'
// import Bootstrap from 'bootstrap/dist/css/bootstrap.css';
import { LinkContainer } from 'react-router-bootstrap';
import Header from './Header';
// import Page from './Page';
// import Events from './Events';
//
export default class Home extends React.Component {
    render(){
        return(
            <div className="Home">
                {this.props.children}
            </div>
        )
    }
}
/*
Town meeting info (Calendar)
About
BOS
Departments
Boards/Committees
Employment
Photos
Site map
Search

Contact us
Residents
Business
*/

// <ButtonGroup>
//     <Button bsStyle="info">Home</Button>
//     <Button bsStyle="info">About</Button>
//
// <LinkContainer to="/contact">
// <Button bsStyle="info">Contact</Button>
// </LinkContainer>
//
//     <DropdownButton id="dropdown-btn-menu" bsStyle="info" title="Services">
//         <MenuItem key="1">Residential</MenuItem>
//         <MenuItem key="2">Commercial</MenuItem>
//         <MenuItem key="3">Municipalities</MenuItem>
//         <MenuItem divider/>
//         <MenuItem disabled>Location</MenuItem>
//         <MenuItem key="4">Remote</MenuItem>
//         <MenuItem key="5">On-Site</MenuItem>
//     </DropdownButton>
// </ButtonGroup>
