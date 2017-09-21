import React from 'react';
 import  './PageNavbar.css'
 import {
     NavLink,
     NavItem,
     Nav,
 } from 'reactstrap';

 // if (this.props.notices.length > 0 && pageNavMenus.filter(menu => matchText('Notices',menu)).length  === 0 ) {
 //     pageNavMenus.push({text:'Notices', target:'Notices-bookmark', fontAwsomeIcon:'fa-bell'},);
 // }
export function addMenu(currentMenus, newMenu) {
     const matchText = (text, menu) => menu.text === text;
     if (currentMenus.filter(menu => matchText(newMenu.text,menu)).length  === 0 ) {
         return currentMenus.concat(newMenu);
     }
     return currentMenus;
 }

 //http://jsbin.com/iqiyuw/1/edit?html,js,output
 export function PageNavbar({menus, loading}){
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
