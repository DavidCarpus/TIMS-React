import React from 'react';
import DocumentList  from './DocumentList'
import Aside from './Aside'
import SmartLink from './SmartLink'
import layoutStyles from './MainLayout.css'

import GroupMembers from './GroupMembers'
import AgendasAndMinutes from './AgendasAndMinutes'

class SWOT extends React.Component {
    render() {
        return (
            <div id="SWOT">
                <p>This process explores the various strengths, weaknesses, opportunities and threats (an acronym for this activity is SWOT) regarding the community.</p>
                <li>Strengths: characteristics of Milton that give it an advantage over others in the region. For example, good transportation access, skilled labor, attractive natural resources and open space areas, e.g., Milton’s Three Ponds.</li>
                <li>Weaknesses: (or Limitations): characteristics that place the community at a disadvantage relative to others. For example, limited utility capacity or limited sites with sewer and water;</li>
                <li>Opportunities: external activities that may make Milton more attractive. For example, improvements to and widening of the Spaulding Turnpike, development potential around Exists 17 and 18 off the Turnpike.</li>
                <li>Threats: external elements in the environment that could raise issues for the community. For example, other nearby communities developing a business park, changes to state regulations.</li>
            </div>
        )
    }
}

class Focus extends React.Component {
    render() {
        return (
            <div id="Focus">
                <p>Our primary focus is to:</p>
                <li>Assist existing businesses with potential expansion plans; </li>
                <li>Assist existing businesses in working with the Town;</li>
                <li>Provide insight and assistance to businesses in working with local boards and departments during the development review, approval and permitting processes;</li>
                <li>Provide relocation and site selection information and assistance;</li>
                <li>Encourage a positive regulatory environment towards business; and</li>
                <li>Encourage the creation and maintenance of a strong economic development infrastructure.</li>
            </div>
        )
    }
}

export default class EconomicDevelopment extends React.Component {

    render() {
        return (
            <div id="EconomicDevelopment">
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Economic Development</h1>
<p>Milton ...  We are open for business    </p>
<p>Welcome to the Economic Development section of the Milton NH website, developed by the
    Milton Economic Development Committee (MEDC) with the support of the Milton Board of Selectmen
    and the Town Administrator. We define economic development in a broad sense … “a series of
    planned activities designed to increase the number of jobs and investment in the community.”
    The Town of Milton is beginning the process of economic development. The Town’s basic goal is
    to provide tools and assistance that encourage existing businesses to expand and to attract new
    commercial and industrial projects that are compatible with Milton and its beautiful natural environment.  </p>
<Focus/>

<p>Milton Gears up for its Strategic Economic Development Plan</p>

<p>Through a small grant from the Public Service Company of New Hampshire (PSNH), the Town of Milton will start work on its Strategic Economic Development Plan with consultant assistance. Strategic Planning is a management tool that helps an organization or community focus its energy to undertake specific actions that guide the organization in achieving specific short and long-term goals. The Strategic Economic Development Plan determines where the Town fits with the current “environment”, establishes goals and a vision and proposes actions to achieve the vision. The effort involves three components:</p>

<p>Situational Analysis, Milton’s Strengths and Limitations Today: This activity includes a review of the existing environment for increased economic activity. As part of the Situation Analysis, the community carefully considers various driving forces such as income growth, changing demographics, education, type of existing industries, natural resource limitations and opportunities, etc. A summary review of the past economic development work completed in 2007 by the Cost of Community Service Study Committee (CCSSC).</p>

<SWOT/>
<br/>
<p>Goal Setting --- Milton’s Economic Future: The goal setting and visioning process is critical to any strategic plan.  Whether the plan is for an organization, the community or a smaller group, it is critical to determine the direction in which the community wishes to proceed. Goals should be designed and worded as much as possible to be specific, measurable and realistic. Part of the goal setting process usually involves the preparation of a Vision Statement— a description of what the community desires and what Strategic Plan hopes to accomplish—“A community with a thriving economy.”  It may also include a set of guiding principles or primary goals and priorities to implement the Vision.
    </p>
<p>Action Plan --- Getting the Job Completed: Action planning involves establishing a set of actions or tactics to implement the plan and achieve the Plan goals. Each goal or objective is associated with an action or set of actions, which is one of the methods needed to reach a goal. Action planning also includes specifying responsibilities and timelines with each objective, or who needs to do what and by when</p>

<p>What is the benefit? In the end, the Strategic Economic Development Plan provides the community with a realistic guide or “road map” of how it can advance its economic development program.</p>

<p>In the late winter or early spring, the Town will conduct an open visioning session designed to involve the community in this process. We will keep the community informed via the Town website.</p>
<p>Finally, the Town wishes to thank Eversource for its grant assistance.</p>

                    <GroupMembers
                        groupName='EconomicDevelopment'
                        title='Economic Development Committee Members'
                        />
                    <AgendasAndMinutes
                        groupName='EconomicDevelopment'
                        />


                    <DocumentList
                        groupName='EconomicDevelopment'
                        title='Economic Development Committee Documentation'
                        />
                </div>
            <Aside groupName='EconomicDevelopment' />
            </div>
        );
    }

}
