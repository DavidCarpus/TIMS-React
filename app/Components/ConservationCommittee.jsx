import React from 'react';
import DocumentList  from './DocumentList'
import Aside from './Aside'
import SmartLink from './SmartLink'
import layoutStyles from './MainLayout.css'
import AgendasAndMinutes from './AgendasAndMinutes'
import GroupMembers from './GroupMembers'

export default class ConservationCommittee extends React.Component {

    render() {
        return (
            <div id="ConservationCommittee">
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Conservation Committee</h1>
                        <p>Are you interested in serving on the Branch River Scenic Byway Corridor Advisory Committee?  For more information click here</p>
                        <p>The Conservation Commission’s goal is to fulfill the mandates of RSA 36-A, and the conservation planning goals in the Milton Master Plan. Notable activity in 2010 was:</p>

                        <p>Passage of Shoreland Overlay Protection District ordinance: In 2008, Milton received an $8500 Community Technical Assistance grant to improve water quality. Jack Mettee, a planning consultant, was hired in fall 2008. Throughout 2009, he and the CC worked to consolidate and streamline the existing water protection ordinances, and to ensure consistency between Milton’s ordinances and the new State Comprehensive Shoreland Protection Act. Public forums featured local water resource professionals who addressed the importance of natural buffers along streams, rivers and ponds. UNH freshwater biologist Dr. Jim Haney discussed the continuing decline of water quality in the Milton 3 Ponds. Input from the Planning Board was incorporated into the ordinance, and the Planning Board voted to include and support the proposed overlay district on the 2010 town warrant. The ordinance was passed by town vote.</p>

                        <p>Natural Resource Planning Maps completed. Two new maps are now available in the land use planning room at the Emma Ramsey Center showing: 1) comprehensive water resources, and 2) multiple conservation features including prime farmland soils, NHFG Wildlife Action Plan data, NH Coastal Plan Core Focus Areas, snowmobile trails, conservation lands, and tax parcels. These maps were donated by Moose Mountains Regional Greenways.</p>

                        <p>Monitoring town held conservation easements. The town is required to annually monitor Milton conservation lands and the conservation easements it holds. The Milton Conservation Commission contracted UNH graduate forestry students to produce baseline monitoring documentation and to mark the boundaries of all conservation properties. The town owned Ball property and the Frizzell conservation easement baselines and boundary markings are complete. Additionally:</p>

                        <li>Erin Quigley completed the baseline and boundary markings for map 14, lot 2 consisting of 20.42 town owned acres known as the Jones Brook Park. The town voted in 2002 to place the Jones Brook Park under conservation easement as per Warrant Article 16.</li>
                        <li>Ms. Quigley also completed the baseline documentation and boundary marking of the town owned 4.2 acre Payne property, which is contiguous with the Jones Brook property. This property is referenced as map 14, lot 6. This property was voted to be placed under conservation easement as per Article 23 of 2003 Milton Town Warrant.</li>
                        <li>Ms. Quigley completed the baseline documentation and boundary marking of town owned 24.8 acre land locked property within the wellhead protective radius of Milton’s public drinking water supply. This property is referenced as Map 37 lot 110, and is known historically as the Old Ski Area.</li>
                        <li>Ms. Quigley completed the baseline documentation of the Milton conservation easement properties known as Wallace Way consisting of 5 acres and Dames Brook consisting of 10.5 acres.</li>
                        <li>Milton properties that are in the process of baseline documentation are map 27, lot 1, 92 landlocked acres with high conservation value, and Lyman Brook conservation easement consisting of 19.5 acres.</li>

                        <p>Land Protection Projects:</p>

                        <p>The Milton Conservation Commission was instrumental in assisting Philip and Sylvia Thayer Zaeder with their donation of a 37 acre conservation easement on their historic homestead on Hare Rd. The Zaeders paid most of the costs, while the town paid for the required survey from the Conservation Fund. Strafford Rivers Conservancy is the primary easement holder, the town hold the executor interest. These actions were supported by the Selectmen.</p>

                        <p>Milton’s Conservation Fund: This fund receives 50% of the land use change tax, and is primarily used to assist landowners defray the cost of conservation easements. These conservation projects fulfill the conservation objectives of the Master Plan by protecting Milton’s water resources, forestlands, wildlife habitat, and farmland. Side benefits are the preservation of Milton’s scenic beauty and rural character.</p>

                        <p>Additional Links:</p>

                        <p>Strafford Regional Planning Commission</p>

                    <GroupMembers
                        groupName='ConservationCommittee'
                        title='Budget Committee Members'
                        />

                    <DocumentList
                        groupName='ConservationCommittee'
                        title='Milton Cemetery Trustees Documentation'
                        />
                    <AgendasAndMinutes
                        groupName='ConservationCommittee'
                        />

                </div>
            <Aside groupName='ConservationCommittee' />
            </div>
        );
    }

}
