import React from 'react';
import { Link, NavLink as RRNavLink } from 'react-router-dom';
import { Sticky } from '../sticky.js';
// import { Col, Row } from 'reactstrap';
import Slideshow from '../Slideshow'


import {
    Navbar,
    // NavbarBrand,
    Container,
    // Button,
    Collapse,
    NavLink,
    NavItem,
    DropdownMenu,
    Nav,
    DropdownItem,
    NavDropdown,
    DropdownToggle,
    NavbarToggler,
    Row,
    Col,
} from 'reactstrap';
import './Menu.css'


// const debug = true && (process.env.NODE_ENV === 'development')

const SubMenuLink = ({menuid, subMenuData, menuData, index, cols}) => {
    const external = subMenuData.pageLink.startsWith('http')
    const id = subMenuData.id
    const desc = subMenuData.description
    const lnk = external ? subMenuData.pageLink : menuData[0] + subMenuData.pageLink

    const ExternalLnk = () =>
        <NavItem key={id } id={id } className='externalMenu' >
            <NavLink href={lnk} > {desc}</NavLink>
        </NavItem>
    const InternalLnk = () =>
        <DropdownItem key={ menuid+ '.'+ id}>
            <NavItem key={id } id={id } className='internalMenu' >
                <NavLink tag={RRNavLink} to={lnk}>{desc}</NavLink>
            </NavItem>
        </DropdownItem>
    const colSize =(12/cols)
    // <ChkLnk></ChkLnk>
    return (
        <Col  md={{size:colSize}}  xs={{size:12}} style={{padding:'0em'}} >
            {external &&  ( <ExternalLnk ></ExternalLnk>)}
            {!external &&  ( <InternalLnk ></InternalLnk>)}
        </Col>
    )
}
// {external ?
//     <ExternalLnk id={id} lnk={lnk} desc={desc}></ExternalLnk>
//     :<InternalLnk id={id} lnk={lnk} desc={desc}></InternalLnk>
// }

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
        // if(debug)  return
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
//https://codepen.io/dustlilac/pen/Qwpxbp
// console.log(this.props.menu);
    const cols=Math.ceil(subMenus.length/5)
    const dropdownWidthEm=cols*15 + 'em';
    const leftShift=((cols-1)*-7) + 'em';
        return (
            <NavDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}
                onMouseEnter={this.toggleOpen}
                onMouseLeave={this.toggleClose}
                >
                <DropdownToggle nav caret>
                    {this.props.menu[1].description}
                </DropdownToggle>
                <DropdownMenu className='dropdownColor' style={{width: dropdownWidthEm, left:leftShift}}>
                    <Row>
                    {subMenus.map( (submenu, index) =>
                        <SubMenuLink menuid={this.props.menu.id}
                            menuData = {this.props.menu}
                            cols={cols}
                            subMenuData={submenu} index={index}></SubMenuLink>
                        // (index > 0 && (index%5 === 0)) ? <Col md={{size:10, push:1}}  xs={{size:12}} > : ""

                        // (index > 0 && (index%5 === 0)) ? </Col > : ""

                    )}
                    </Row>
                </DropdownMenu>
            </NavDropdown>

            )
    }
}
// submenu.pageLink.startsWith('http') ?
// return (<NavItem key={submenu.id } id={submenu.id } className='externalMenu' >
// <NavLink href={ submenu.pageLink} >
//     {(index%5) + '-' + submenu.description}
// </NavLink>
// </NavItem>)
// :
// return (<DropdownItem key={this.props.menu.id + '.'+ submenu.id}>
// <NavItem key={submenu.id } id={submenu.id } className='internalMenu' >
//     <NavLink tag={RRNavLink} to={this.props.menu[0] + submenu.pageLink}>
//         {(index%5)  + '-' + submenu.description}
//     </NavLink>
// </NavItem>
// </DropdownItem>)
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

        return (
            <Sticky className="sticky-one" enter='10'>
                <Container id='MainMenu' className='fadeBottomTop'>
                        <div className='townSeal'>
                            <Link to='/' >
                                <img  src='/images/Welcome-to-Milton.jpg' className='townSeal'   alt="HomePage" title="Home Page" />
                            </Link>
                        </div>

                        <div id='welcome' className='hideSticky'>
                            Welcome to <br/>Milton New Hampshire
                        </div>

                        <div className='pictureBlock hideSticky'>
                            <Slideshow></Slideshow>
                        </div>

                        <div id='Menubar'>
                            <Navbar  light toggleable >
                                <div id='menuToggle'>
                                    <NavbarToggler right  onClick={this.toggle}>
                                        <div>Menu</div>
                                    </NavbarToggler>
                                </div>
                                <Collapse isOpen={this.state.isOpen} navbar>
                                    <Nav className="ml-auto" navbar>
                                        {sortedMenus.map( (menu, index) =>
                                            <MainMenu  key={index} menu={menu} index={menu.id} />
                                        )}
                                    </Nav>
                                </Collapse>
                            </Navbar>
                        </div>

                </Container>
            </Sticky>
        )
    }
}
