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

 export default function PageNavbar({menus, loading}){
     if ( loading) {         return (<div>Loading</div>)     }
     if (menus.length === 0) {        return(null);    }

     return (
         <div id='PageNavbar'>
             <Nav vertical >
             {menus.map( (menu, index) =>
                         <NavItem key={index}>
                           <NavLink href={menu.target ? "#"+menu.target: '#'}>
                                <div>
                                    <span>{menu.text}</span>
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
