import React from 'react';
// import Aside from '../Components/Aside'
// import { Col } from 'react-bootstrap';
import  './ContactUs.css'

let departments = [
    {name:'Assessing Dept', contactName: 'Kathy Wallingford', phone:'603-652-4501 ext. 6'},
    {name:'Bookkeeper', contactName: 'Financedept@miltonnh-us.com', phone:'603-652-4501 ext. 2'},
    {name:'Parks & Recreation Department', contactName: 'Karen Brown', phone:' 603-652-4501 ext. 8'},
    {name:'Seaonal Beach Gate House', contactName: '', phone:' 603-652-7308'},
    {name:'Planning/Code Department', contactName: 'Brian Boyers ', phone:'603-652-4501 ext. 7'},
    {name:'Land Use Clerk', contactName: 'Dana Crossley ', phone:'603-652-4501 ext. 5'},
    {name:'Town Administrator', contactName: 'Heather Thibodeau ', phone:'603-652-4501 ext. 1'},
]

export default class ContactUs extends React.Component {
    render() {
        return (
                <section id='ContactUs'>
                    <a id="ContactUs-bookmark">ContactUs Start</a>
                <b>Government Offices</b><br/>
                Asessing, Building, Conservation, Economic Devlopment Committee, Health, Planning, Selectmen, Zoning

                <address>
                424 White Mountain Highway<br/>
                P.O. Box 310 Milton NH, 03851
                </address>

                <div  id='mainContact'>
                Monday-Friday 8:00am - 4:00 pm<br/>
                General Phone: 603-652-4501<br/>
                Fax: 603-652-4120<br/>
                </div>

                <div id='departmentList'>
                {departments.map( (department,index) =>
                    <div className='row' key={department.id || index}>
                        <span className='department'>{department.name}&nbsp;</span>
                        <span  className='phone'>{department.phone}&nbsp;</span>
                        <span  className='contactName'>{department.contactName}&nbsp;</span>
                    </div>
                )}
                </div>
            </section>
        );
    }
}
