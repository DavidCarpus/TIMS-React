import React from 'react';
import ReactDOM from 'react-dom';
import { Navbar, NavItem, MenuItem, MenuItemLink, Nav, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import styles from './Menu.css'
import { Grid, Row, Col } from 'react-bootstrap';

import organizations from './Data/OrganizationalUnits.json'
var departments = organizations.filter( (organization)=>
            {return organization.mainMenu == 'Departments' } )
var committees = organizations.filter( (organization)=>
            {return organization.mainMenu == 'Committees' } )

// <DropdownButton title={buttonTitle} onSelect={() => null}>

export default class Menu extends React.Component {
    logoLink = () => {
        return 'images/MiltonSeal.png'
    }

    render(){
        const logo = {height: '90px'};
        return (
            <Col md={12}>
            <Navbar
                collapseOnSelect
                id='custom-bootstrap-menu'
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
                  <Navbar.Toggle />
                </Navbar.Header>

                <Navbar.Collapse
                    className="bs-navbar-collapse">
                    <Nav>
                        <LinkContainer to="/about">
                            <NavItem eventKey={1} >About</NavItem>
                        </LinkContainer>
                        <LinkContainer to="/calendar">
                            <NavItem eventKey={2} >Town Calendar</NavItem>
                        </LinkContainer>
                        <NavDropdown eventKey={'3'} title="Departments" id={33}>
                            {departments.map((department, index) =>
                                ( !department.link.startsWith('http'))
                                ?
                                <LinkContainer to={'Departments/' + department.link}
                                    key={index}>
                                    <MenuItem
                                        eventKey={'3.'+index}
                                         className={styles.navItem}>{department.desc}</MenuItem>
                                </LinkContainer>
                                :
                                <Navbar.Text key={index}>
                                       <Navbar.Link href={department.link}  target="_blank"> {department.desc}</Navbar.Link>
                                   </Navbar.Text>
                                )}
                        </NavDropdown>
                        <NavDropdown eventKey={'4'} title="Committees" id={44}>
                            {committees.map((committee, index) =>
                              ( !committee.link.startsWith('http'))
                              ?
                              <LinkContainer to={'BoardsAndCommittees/' + committee.link}
                                  key={index}
                                  >
                                  <MenuItem
                                      eventKey={'4.'+index}
                                      className={styles.navItem}>{committee.desc}</MenuItem>
                              </LinkContainer>
                              :
                              <Navbar.Text
                                  key={index}
                                  >
                                  <Navbar.Link href={committee.link}
                                      target="_blank">{committee.desc}</Navbar.Link>
                              </Navbar.Text>
                                )
                            }
                        </NavDropdown>
                    </Nav>
                  </Navbar.Collapse>
            </Navbar>
            </Col>
          )
      }
  }

class MenuLink extends React.Component {
    render() {
        var link = this.props.link.replace(' ','')
        var desc = this.props.desc
        var routedPath = this.props.routePath + link
        return (
            ( !link.startsWith('http'))
            ?

            <LinkContainer to={routedPath}>
                <MenuItem
                    eventKey={this.props.eventKey}
                     className={styles.navItem}>{this.props.eventKey} - {desc}</MenuItem>
            </LinkContainer>

            :

             <Navbar.Text>
                    <Navbar.Link href={link}
                    target="_blank">{desc}</Navbar.Link>
                </Navbar.Text>
        )
    }
}
// eventKey={this.props.eventKey}

class DepartmentMenuLink extends React.Component {
    render() {
        // var routePath= '/Departments/'
        var desc=this.props.department.desc
        var link=this.props.department.link || desc
        var index=this.props.index
        return (
            <LinkContainer to={'Departments/' + link}>
                <MenuItem
                    key={index}
                    eventKey={index}
                     className={styles.navItem}>{index} - {desc}</MenuItem>
            </LinkContainer>
        )
    }
}
/*
var routePath= '/Departments/'
var desc=this.props.department.desc
var link=this.props.department.link || desc
return (
    <MenuLink
            link={link}
            routePath={routePath}
            eventKey={this.props.eventKey}
            desc={desc}/>
)
*/
class CommitteeMenuLink extends React.Component {
    render() {
        var routePath= '/BoardsAndCommittees/'
        var desc=this.props.committee.desc
        var link=this.props.committee.link || desc
        return (
            <MenuLink
                    link={link}
                    routePath={routePath}
                    eventKey={this.props.eventKey}
                    desc={desc}/>
        )
    }
}
// render() {
// return (
//         <MenuLink
//             lnk={('link' in this.props.committee)
//                 ? '/BoardsAndCommittees/' + this.props.committee.link
//                 :'/BoardsAndCommittees/' + this.props.committee.desc}
//             eventKey={this.props.eventKey}
//             desc={this.props.committee.desc}/>
// )
// }

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


onClick={  () => console.log('MenuItem clicked') }

*/
