import React from 'react';
import Aside from './Aside'

export default class Calendar extends React.Component {

render() {
    const calendarURL='https://calendar.google.com/calendar/embed?src=townmiltonnh%40gmail.com&showTabs=0&height=600&showCalendars=0&bgcolor=%23FFFFFF&showPrint=0&ctz=America/New_York'
    // https://calendar.google.com/calendar/embed?showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=townmiltonnh%40gmail.com&amp;color=%23125A12&amp;ctz=America%2FNew_York'
    return (
        <div id="mainScreen" style={{textAlign:'center'}}>
                <h1 style={{textAlign:'center'}}>Town of Milton New Hampshire's Calendar</h1>
            <iframe src={calendarURL} width='100%' height='400'/>
    </div>
    );
}

}
// src="https://calendar.google.com/calendar/embed?src=townmiltonnh%40gmail.com&ctz=America/New_York"
// <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. </p>
// <br/>
// AIzaSyA73F7tUykTMfAaSiZZSoglNPK2qhXWpZw
//
// <iframe src="https://calendar.google.com/calendar/embed?showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=townmiltonnh%40gmail.com&amp;color=%23125A12&amp;ctz=America%2FNew_York" style="border-width:0" width="800" height="600" frameborder="0" scrolling="no"></iframe>
