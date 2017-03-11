import React from 'react';
import ReactDOM from 'react-dom';
import { Button, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
// import '../../libs/bootstrap/css/bootstrap.css'
// import Bootstrap from 'bootstrap/dist/css/bootstrap.css';
import { LinkContainer } from 'react-router-bootstrap';

export default class Contact extends React.Component {
    render(){

        return(
            <div>
                <ButtonGroup>
                    <Button bsStyle="info">Home</Button>
                    <Button bsStyle="info">About</Button>

                  <LinkContainer to="/contact">
                      <Button bsStyle="info">Contact</Button>
                  </LinkContainer>

                    <DropdownButton id="dropdown-btn-menu" bsStyle="info" title="Services">
                        <MenuItem key="1">Residential</MenuItem>
                        <MenuItem key="2">Commercial</MenuItem>
                        <MenuItem key="3">Municipalities</MenuItem>
                        <MenuItem divider/>
                        <MenuItem disabled>Location</MenuItem>
                        <MenuItem key="4">Remote</MenuItem>
                        <MenuItem key="5">On-Site</MenuItem>
                    </DropdownButton>
                </ButtonGroup>

                Contact Data

            </div>
        )
    }
}

                //
                // <ButtonGroup>
                //     <DropdownButton id="dropdown-btn-menu" bsStyle="info" title="Dropdown">
                //         <MenuItem key="1">Dropdown link</MenuItem>
                //         <MenuItem key="2">Dropdown link</MenuItem>
                //     </DropdownButton>
                //     <Button bsStyle="info">Middle</Button>
                //     <Button bsStyle="info">Right</Button>
                // </ButtonGroup>
