import React from 'react';
import ReactDOM from 'react-dom';
import { Navbar, NavItem, MenuItem, MenuItemLink, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import styles from './Header.css'
import data from './Data/Menu.json'

var departments = data.departments
var committees = data.committees

class MenuLink extends React.Component {
    render() {
        var lnk = this.props.lnk.replace(' ','')
        return (
            ( !lnk.startsWith('http')) ?
            <LinkContainer to={lnk}>
                <MenuItem className={styles.navItem}>{this.props.desc}</MenuItem>
            </LinkContainer>
            : <Navbar.Text>
                    <Navbar.Link href={lnk} target="_blank">{this.props.desc}</Navbar.Link>
                </Navbar.Text>
        )
    }
}

class DepartmentMenuLink extends React.Component {
    render() {
        var lnk = this.props.department.link || ''
        if ( !lnk.startsWith('http')) {
            lnk=('link' in this.props.department)
                 ?'/Departments/' + this.props.department.link
                 :'/Departments/' + this.props.department.desc
            lnk = lnk.replace(' ','')
        }
        // lnk = lnk.replace(/(^\w+:|^)\/\//,'')
        return (
            <MenuLink
                lnk={lnk}
                desc={this.props.department.desc}/>
        )
    }
}

class CommitteeMenuLink extends React.Component {
    render() {
        return (
                <MenuLink
                    lnk={('link' in this.props.committee)
                        ? '/BoardsAndCommittees/' + this.props.committee.link
                        :'/BoardsAndCommittees/' + this.props.committee.desc}
                    desc={this.props.committee.desc}/>
        )
    }
}
export default class Menu extends React.Component {
    logoLink = () => {
        return 'images/MiltonSeal.png'
    }
    render(){
        const logo = {height: '80px'};
        return (
            <Navbar id='navbar' collapseOnSelect={true} bsStyle="custom-bootstrap-menu"
                >
            <Navbar.Header>
                <Navbar.Brand>
                  <a href="#" style={logo}>
                      <img
                          className={styles.logo}
                          src={this.logoLink()}
                          />
                  </a>
                </Navbar.Brand>
            </Navbar.Header>
            <Navbar.Collapse>


            <Nav  className={styles.myNavbar} >
                <LinkContainer to="/about">
                    <NavItem eventKey={1} >About</NavItem>
                </LinkContainer>
                <LinkContainer to="/calendar">
                    <NavItem eventKey={2} >Town Calendar</NavItem>
                </LinkContainer>

                <NavDropdown eventKey={3} title="Departments" id="basic-nav-dropdown">
                    {departments.map((department, index) =>
                         <DepartmentMenuLink  department={department} key={index}/>
                        )}
                </NavDropdown>
                <NavDropdown eventKey={4} title="Committees" id="basic-nav-dropdown">
                    {committees.map((committee, index) =>
                         <CommitteeMenuLink  committee={committee} key={index}/>
                        )}
                </NavDropdown>

                </Nav>
            </Navbar.Collapse>
            </Navbar>
        );
    }
}
/*
Town meeting info (Calendar)
About
BOS
Employment
Photos
Site map
Search

Contact us
Residents
Business
*/
