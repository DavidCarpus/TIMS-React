import React from 'react';
import Aside from './Aside'
import layoutStyles from './MainLayout.css'

var asideData=[
    {'desc': '2017 Town Observed Holidays'},
    {'desc': 'NH Solar Garden Proposal for Lockhart Field'},
    {'desc': 'Starting Thursday, July 28, 2016 there will be a Selectman at the Town Hall Thursday mornings from 8am to 8:30am available to address questions and concerns.'},
    {'desc': 'Notice Letter From Metrocast '},
    {'desc': 'Employment Opportunities & Committee Vacancies'}
]

export default class About extends React.Component {

render() {
    return (
        <div id="mainScreen" style={{textAlign:'center'}}>
            <div id="contentArea"  className={layoutStyles.contentArea}>

            <h1 style={{textAlign:'center'}}>About the Town of Milton <br/>New Hampshire</h1>
            <p>Milton was incorporated in 1802 and is located in the Northeast section of
                <a href='http://nhdeeds.com/strafford/StHome.html'> Strafford County.</a>
                The principal villages, Milton and Milton Mills, combine to encompass twenty-seven thousand
                acres and has a year-round population of approximately four thousand citizens.  Milton is located
                forty miles from Concord, the state capitol and is twenty miles northwest of the county seat in
                Dover. The principal bodies of water are Milton Three Ponds, a chain of lakes providing a boat
                 launch and public access to the Town Beach.
                </p>

            <p>The North Conway branch of Boston & Maine Railroad runs through our town and Route 16
                 (the Spaulding Turnpike) provides fast access to both ski country and the seacoast.
                </p>

            <p>More information about Milton can be found on <a href='http://en.wikipedia.org/wiki/Milton,_New_Hampshire'>Wikipedia.</a>
                </p>

            </div>

            <Aside data={asideData}/>
        </div>
    );
}

}

// <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. </p>
// <br/>
