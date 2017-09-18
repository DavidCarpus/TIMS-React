import React from 'react';
 import  './PageNavbar.css'
 import {
    //  Navbar,
     // NavbarBrand,
    //  Container,
    //  Button,
    //  Collapse,
     NavLink,
     NavItem,
     Nav,
 } from 'reactstrap';

 //http://jsbin.com/iqiyuw/1/edit?html,js,output
 export default function PageNavbar({menus, loading}){
     if ( loading) {         return (<div>Loading</div>)     }
     if (menus.length === 0) {        return(null);    }

     return (
         <div id='PageNavbar'>
             <Nav vertical >
             {menus.map( (menu, index) =>
                         <NavItem key={index}>
                           <NavLink href={menu.target ? "#"+menu.target: '#'}>
                                <div className='hoverable'>
                                    {menu.fontAwsomeIcon &&
                                        <i className={"normal fa " + menu.fontAwsomeIcon}></i>
                                    }
                                    {!menu.fontAwsomeIcon &&
                                        <span className='normal'>{menu.text}</span>
                                    }
                                    <span className='hover'>{menu.hoverText || menu.text}</span>
                                </div>
                           </NavLink>
                         </NavItem>
                 )}
        </Nav>
             </div>
     )
 }
 /*
        <Nav vertical>
          <NavItem>
            <NavLink href="#">Link</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">Link</NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#">Another Link</NavLink>
          </NavItem>
          <NavItem>
            <NavLink disabled href="#">Disabled Link</NavLink>
          </NavItem>
        </Nav>*/
