import React from 'react';
import { Link, NavLink as RRNavLink } from 'react-router-dom';
import { Sticky } from '../sticky.js';
// import { Col, Row } from 'reactstrap';
import Slideshow from '../Slideshow'


import {
    Navbar,
    Container,
    Collapse,
    NavLink,
    NavItem,
    DropdownMenu,
    Nav,
    NavDropdown,
    DropdownToggle,
    NavbarToggler,
    Row,
    Col,
} from 'reactstrap';
import './Menu.css'


const SubMenuLink = ({menuid, subMenuData, menuData, index, cols,onClick}) => {
    const external = subMenuData.pageLink.startsWith('http')
    // const id = subMenuData.id
    const desc = subMenuData.description
    const lnk = external ? subMenuData.pageLink : menuData[0] + subMenuData.pageLink

    const ExternalLnk = () =>
        <NavLink href={lnk} className='externalMenu' title='External Website'> {desc}</NavLink>
    const InternalLnk = () =>
        <NavLink tag={RRNavLink} to={lnk} onClick={onClick} className='internalMenu'>{desc} </NavLink>
    const colSize =Math.floor(12/cols)

    // <ChkLnk></ChkLnk>
    return (
        <Col  md={{size:colSize}}  xs={{size:12}} style={{padding:'0em'}} >
            {external &&  ( <ExternalLnk ></ExternalLnk>)}
            {!external &&  ( <InternalLnk ></InternalLnk>)}
        </Col>
    )
}

//================================================
let subMenuOpenTimer=null
const toggleDelay=600
class SubMenus extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.toggleOpen = this.toggleOpen.bind(this);
        this.toggleClose = this.toggleClose.bind(this);
        this.closeAll = this.closeAll.bind(this);
        this.state = {
            dropdownOpen: false
        };
    }

    toggle() {
        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    }
    toggleOpen() {
        subMenuOpenTimer = setTimeout(function() { this.setState({dropdownOpen: true}); }.bind(this), toggleDelay);
    }
    toggleClose() {
        if(subMenuOpenTimer) clearTimeout( subMenuOpenTimer);
        this.setState({ dropdownOpen: false });
    }
    closeAll() {
        this.toggleClose();
        this.props.topMenuToggle();
    }


    render(){
        let subMenus = this.props.menu[1].menus
        .sort((a,b) => {
            return (a.description < b.description) ? -1 : (a.description > b.description) ? 1 : 0;
        })

//https://codepen.io/dustlilac/pen/Qwpxbp
        const cols=Math.ceil(subMenus.length/5)
        const dropdownWidthEm=cols*12 + 'em';
        const leftShift=((cols-1)*-4) + 'em';

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
                            subMenuData={submenu}
                            key={index}
                            index={index}
                            onClick={this.closeAll}
                            ></SubMenuLink>
                    )}
                    </Row>
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
                <SubMenus menu={this.props.menu} index={this.props.index} topMenuToggle={this.props.topMenuToggle} />
            )
        } else {
            return (
                <NavLink tag={RRNavLink} to={this.props.menu[0]}>
                    <NavItem id={this.props.menu[1].id }  onClick={this.props.topMenuToggle} >{this.props.menu[1].description}</NavItem>
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
                                <img  src={this.props.configuration.leftMenuImage} className='townSeal'   alt="HomePage" title="Home Page" />
                            </Link>
                        </div>

                        <div id='welcome' className='hideSticky'>
                            Welcome to <br/>{this.props.configuration.municipalLongName}<br/>{this.props.configuration.stateLongName}

                        </div>

                        <div className='pictureBlock hideSticky'>
                            <Slideshow></Slideshow>
                        </div>

                        <div id='Menubar'>
                            <Navbar  light toggleable >
                                <div id='menuToggle'>
                                    <NavbarToggler left  onClick={this.toggle}>
                                        <div>Menu</div>
                                    </NavbarToggler>
                                </div>
                                <Collapse isOpen={this.state.isOpen} navbar>
                                    <Nav className="ml-auto" navbar>
                                        {sortedMenus.map( (menu, index) =>
                                            <MainMenu  key={index} menu={menu} index={menu.id} topMenuToggle={this.toggle} />
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
