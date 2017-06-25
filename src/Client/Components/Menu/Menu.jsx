import React from 'react';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import Nav from 'react-bootstrap/lib/Nav';
// import { Navbar, NavItem, MenuItem, MenuItemLink, Nav, NavDropdown } from 'react-bootstrap';

import { IndexLinkContainer } from 'react-router-bootstrap';
// import { Link } from 'react-router';
import s from './Menu.css'
import {  Col } from 'react-bootstrap';
/*
key={this.props.menu.id + '.'+ submenu.id}
eventKey={this.props.menu.id + '.'+ submenu.id}

*/
class DropdownMenu extends React.Component {
    render(){
        // var parentIndex=this.props.index
        return (
                <NavDropdown eventKey={this.props.menu.id} title={this.props.menu.desc} id={this.props.menu.id}>
                    {this.props.menu.menus.map( (submenu, index) =>
                        ( !submenu.link.startsWith('http'))
                        ?
                        <IndexLinkContainer to={this.props.menu.link + submenu.link}
                            key={this.props.menu.id + '.'+ submenu.id}
                             id={this.props.menu.id + '.'+ submenu.id}
                            >
                            <MenuItem
                                className={s.navItem}>{submenu.desc}
                            </MenuItem>
                        </IndexLinkContainer>
                        :
                        <MenuItem className={s.externalMenu}
                            key={this.props.menu.id + '.'+ submenu.id}
                            id={this.props.menu.id + '.'+ submenu.id}
                            href={submenu.link}  target="_blank">
                            {submenu.desc}
                      </MenuItem>
                    )}
                </NavDropdown>
            )
    }
}
/*
<Link to={submenu.link}  target="_blank">{submenu.desc}</Link>

<div className={s.externalMenu}
>
<a  href={submenu.link} target='_blank'>{submenu.desc}</a>
</div>

*/

class MainMenu extends React.Component {
    render(){
        // const logo = {height: '90px'};
        if (this.props.menu.menus) {
            return ( <DropdownMenu menu={this.props.menu} index={this.props.index} /> )
        } else {
            return (
                <IndexLinkContainer to={this.props.menu.link}>
                    <NavItem id={this.props.menu.id }  eventKey={this.props.menu.id} >{this.props.menu.desc}</NavItem>
                </IndexLinkContainer>
            )
        }
    }
}

// id='custom-bootstrap-menu'

// className="bs-navbar-collapse"

export default class Menu extends React.Component {
    render(){
        return (
            <div key={this.props.index} >
                <Col md={12}>
                    <Navbar
                        collapseOnSelect
                        >

                        <Navbar.Header >
                            <IndexLinkContainer to='/' >
                                <img  src='/images/MiltonSeal.png' className="navbar-left"  width="70" height="70" alt="React" />
                            </IndexLinkContainer>
                            <Navbar.Toggle />
                        </Navbar.Header>

                        <Navbar.Collapse
                            >
                            <Nav>
                                {this.props.menus.menus
                                    .map( (menu, index) =>
                                    <MainMenu  key={menu.id} menu={menu} index={menu.id} />
                                )}
                            </Nav>
                        </Navbar.Collapse>

                    </Navbar>
                </Col>
            </div>
        )
    }
  }
