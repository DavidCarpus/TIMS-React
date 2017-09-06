import React from 'react';
import { NavLink as RRNavLink } from 'react-router-dom';
import { Sticky } from '../sticky.js';


import {
    Navbar,
    // NavbarBrand,
    Container,
    Button,
    Collapse,
    NavLink,
    NavItem,
    DropdownMenu,
    Nav,
    DropdownItem,
    NavDropdown,
    DropdownToggle,
    NavbarToggler
} from 'reactstrap';

import './Menu.css'

//================================================
class SubMenus extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.toggleOpen = this.toggleOpen.bind(this);
        this.toggleClose = this.toggleClose.bind(this);
        this.state = {
            dropdownOpen: false
        };
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }
    toggleOpen() {
      this.setState({
        dropdownOpen: true
      });
    }
    toggleClose() {
      this.setState({
        dropdownOpen: false
      });
    }

    render(){
        let subMenus = this.props.menu[1].menus
        .sort((a,b) => {
            return (a.description < b.description) ? -1 : (a.description > b.description) ? 1 : 0;
        })
        // .filter(element => !element.pageLink.startsWith('http') )
        // subMenus.map(sm => console.log(sm))

        return (
            <NavDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}
                onMouseEnter={this.toggleOpen}
                onMouseLeave={this.toggleClose}
                >
                <DropdownToggle nav caret>
                    {this.props.menu[1].description}
                </DropdownToggle>

                <DropdownMenu className='dropdownColor' >
                    {subMenus.map( (submenu, index) =>
                        submenu.pageLink.startsWith('http') ?
                        <NavItem key={submenu.id } id={submenu.id } className='externalMenu' >
                            <NavLink href={ submenu.pageLink} >
                                {submenu.description}
                            </NavLink>
                        </NavItem>
                        :
                        <DropdownItem key={this.props.menu.id + '.'+ submenu.id}>
                            <NavItem key={submenu.id } id={submenu.id } className='internalMenu' >
                                <NavLink tag={RRNavLink} to={this.props.menu[0] + submenu.pageLink}>
                                    {submenu.description}
                                </NavLink>
                            </NavItem>
                        </DropdownItem>
                    )}
                </DropdownMenu>
            </NavDropdown>

            )
    }
}
//================================================
class MainMenu extends React.Component {
    render(){
        if (this.props.menu[1].menus && this.props.menu[1].menus.length > 0) {
            return (
                <NavItem>
                <SubMenus menu={this.props.menu} index={this.props.index} />
                </NavItem>
            )
        } else {
            return (
                <NavLink tag={RRNavLink} to={this.props.menu[0]}>
                    <NavItem id={this.props.menu[1].id }  >{this.props.menu[1].description}</NavItem>
                </NavLink>
            )
        }
    }
}
//================================================
export default class Menu extends React.Component {
    constructor(props) {
      super(props);

      this.toggle = this.toggle.bind(this);
      this.state = {
        isOpen: false
      };
    }

    toggle() {
      this.setState({
        isOpen: !this.state.isOpen
      });
    }


    render(){
        let menus = this.props.menus.menus
        let menusToSort = []
        for (var key in menus) {
            menusToSort.push([key, menus[key]])
        }
        let sortedMenus = menusToSort.sort((a,b) => {
            let itemA = a[1].description.toUpperCase();
            let itemB = b[1].description.toUpperCase();
            return (itemA < itemB) ? -1 : (itemA > itemB) ? 1 : 0;
        })

        // <div key={this.props.index} id='MainMenu'>
        return (
            <Sticky className="sticky-one" enter='10'>
                <Container id='MainMenu'>
                    <Navbar  light toggleable id='Menubar'>
                        <span id='menuToggle'>
                            <NavbarToggler right  onClick={this.toggle}>
                                <Button color="info">Menu</Button>
                            </NavbarToggler>
                        </span>
                        <NavLink tag={RRNavLink} to='/'>
                            <img  src='/images/MiltonSeal.png' className="navbar-left"  alt="HomePage" title="Home Page" />
                        </NavLink>
                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav className="ml-auto" navbar>
                                {sortedMenus.map( (menu, index) =>
                                    <MainMenu  key={index} menu={menu} index={menu.id} />
                                )}
                            </Nav>
                        </Collapse>
                    </Navbar>
                </Container>
            </Sticky>
        )
    }
}
/*
<Container id='MainMenu'>
</Container>

*/
