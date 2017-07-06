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
        let subMenus = this.props.menu[1].menus
        .sort((a,b) => {
            return (a.description < b.description) ? -1 : (a.description > b.description) ? 1 : 0;
        })
        // .filter(element => {return ( element.fullLink !== this.props.menu[0])} )
        // console.log('subMenus:' ,  JSON.stringify(subMenus))
        // console.log('menu[1]:' , JSON.stringify( this.props.menu[1]))
        // console.log('*** Menu:' , JSON.stringify( menu))

        let description = this.props.menu[1].description
        let id = this.props.menu[1].id
        // return (<span>{description}{id}</span>)
        return (
                <NavDropdown eventKey={id} title={description} id={id}>
                    {subMenus.map( (submenu, index) =>
                        ( !submenu.pageLink.startsWith('http'))
                        ?
                        <IndexLinkContainer to={ this.props.menu[0] + submenu.pageLink}
                            key={this.props.menu.id + '.'+ submenu.id}
                             id={this.props.menu.id + '.'+ submenu.id}
                            >
                            <MenuItem
                                className={s.navItem}>{submenu.description}
                            </MenuItem>
                        </IndexLinkContainer>
                        :
                        <MenuItem className={s.externalMenu}
                            key={this.props.menu.id + '.'+ submenu.id}
                            id={this.props.menu.id + '.'+ submenu.id}
                            href={submenu.pageLink}  target="_blank">
                            {submenu.description}
                      </MenuItem>
                    )}
                </NavDropdown>
            )
/*
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
            */
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
        // console.log(JSON.stringify(this.props.menu))
        // const logo = {height: '90px'};
        if (this.props.menu[1].menus.length > 0) {
            // return (<span>Dropdown</span>)
            return ( <DropdownMenu menu={this.props.menu} index={this.props.index} /> )
        } else {
            return (
                <IndexLinkContainer to={this.props.menu[0]}>
                    <NavItem id={this.props.menu[1].id }  eventKey={this.props.menu[1].id} >{this.props.menu[1].description}</NavItem>
                </IndexLinkContainer>
            )
        }
    }
}
/*
<span>Test</span>
*/

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
                                {Object.entries(this.props.menus.menus)
                                    .sort((a,b) => {
                                        let itemA = a[1].description.toUpperCase();
                                        let itemB = b[1].description.toUpperCase();
                                        // return (a.toUpperCase() < b.toUpperCase()) ? -1 : (a.toUpperCase() > b.toUpperCase()) ? 1 : 0;
                                        return (itemA < itemB) ? -1 : (itemA > itemB) ? 1 : 0;
                                    })
                                    .map( (menu, index) =>
                                    <MainMenu  key={index} menu={menu} index={menu.id} />
                                )}
                            </Nav>
                        </Navbar.Collapse>

                    </Navbar>
                </Col>
            </div>
        )
    }
  }

/*
*/
