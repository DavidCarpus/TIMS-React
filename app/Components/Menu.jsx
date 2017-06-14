import React from 'react';
import ReactDOM from 'react-dom';
import { Navbar, NavItem, MenuItem, MenuItemLink, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router';
import styles from '../Styles/Menu.css'
import { Grid, Row, Col } from 'react-bootstrap';
/*
key={this.props.menu.id + '.'+ submenu.id}
eventKey={this.props.menu.id + '.'+ submenu.id}

*/
class DropdownMenu extends React.Component {
    render(){
        var parentIndex=this.props.index
        return (
                <NavDropdown eventKey={this.props.menu.id} title={this.props.menu.desc} id={this.props.menu.id}>
                    {this.props.menu.menus.map( (submenu, index) =>
                        ( !submenu.link.startsWith('http'))
                        ?
                        <LinkContainer to={this.props.menu.link + submenu.link}
                            key={this.props.menu.id + '.'+ submenu.id}
                             id={this.props.menu.id + '.'+ submenu.id}
                            >
                            <MenuItem
                                className={styles.navItem}>{submenu.desc}
                            </MenuItem>
                        </LinkContainer>
                        :
                        <MenuItem className={styles.externalMenu}
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

<div className={styles.externalMenu}
>
<a  href={submenu.link} target='_blank'>{submenu.desc}</a>
</div>

*/

class MainMenu extends React.Component {
    render(){
        const logo = {height: '90px'};
        if (this.props.menu.menus) {
            return ( <DropdownMenu menu={this.props.menu} index={this.props.index} /> )
        } else {
            return (
                <LinkContainer to={this.props.menu.link}>
                    <NavItem eventKey={this.props.menu.id} >{this.props.menu.desc}</NavItem>
                </LinkContainer>
            )
        }
    }
}


export default class Menu extends React.Component {
    render(){
        const logo = {height: '90px'};

        return (
            <div key={this.props.index} >
                <Col md={12}>
                    <Navbar
                        collapseOnSelect
                        id='custom-bootstrap-menu'
                        >
                        <Navbar.Header>
                            <Navbar.Brand>
                                <a href="#" style={logo} alt='HomePage'>
                                    <img
                                        className={styles.logo}
                                        src='images/MiltonSeal.png'
                                        />
                                </a>
                            </Navbar.Brand>
                            <Navbar.Toggle />
                        </Navbar.Header>

                        <Navbar.Collapse
                            className="bs-navbar-collapse">
                            <Nav>
                                {this.props.menus.menus.
                                    map( (menu, index) =>
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
