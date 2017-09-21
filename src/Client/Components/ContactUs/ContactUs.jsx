import React from 'react';
// import Aside from '../Components/Aside'
// import { Col } from 'react-bootstrap';
import  './ContactUs.css'

const MUNICIPALITY=process.env.REACT_APP_MUNICIPALITY || 'NewDurhamNH'
var departmentData = require('../../../private/' + MUNICIPALITY + '/departmentContacts.json');
var departments = departmentData[0].departmentContacts;
var addressLines = departmentData[1].addressLines;

export default class ContactUs extends React.Component {
    render() {
        // console.log('departmentData:',departmentData);
        return (
                <section id='ContactUs'>
                    <a id="ContactUs-bookmark">ContactUs Start</a>
                <b>Government Offices</b><br/>

                <address>
                    {addressLines.map( (addressLine,index) =>
                        <div key={index}>{addressLine}</div>
                    )}
                </address>


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
/*
Asessing, Building, Conservation, Economic Devlopment Committee, Health, Planning, Selectmen, Zoning

<div  id='mainContact'>
Monday-Friday 8:00am - 4:00 pm<br/>
General Phone: 603-652-4501<br/>
Fax: 603-652-4120<br/>
</div>

*/
