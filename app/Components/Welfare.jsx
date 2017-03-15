import React from 'react';
import Aside from './Aside'
import SmartLink from './SmartLink'
import DocumentList  from './DocumentList'
import FAQList  from './FAQList'


import layoutStyles from './MainLayout.css'

export default class Welfare extends React.Component {

    render() {
        return (
            <div id="Welfare">
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Milton Welfare & Community Services Information</h1>
                        <quote>The Town has a basic legal duty to administer welfare as described in New Hampshire RSA 165:1-I, which states “Whenever a person in any town is poor and unable to support himself, he shall be relieved and maintained by the overseers of public welfare of such town…”</quote>
                        <br/><br/>
                        <p>*New applicants, or applicants who are reapplying for assistance must first call to schedule an appointment.</p>

                        <h2>How to Apply</h2>
                        <p>Please read the following before applying for assistance. The Milton Welfare Office is now located at Milton Town Hall. The Welfare Office provides temporary emergency assistance to Town residents for the basic necessities of life, when no other resources are available. Assistance is rendered in voucher form only.</p>
                        <p>If you need temporary emergency assistance and have exhausted all other resources, you may then apply to the Milton Town Welfare Office.  To apply for emergency assistance, you must call for an appointment and if you wish you can download, print, and complete the Application Form found at the bottom of this page, or you can obtain an Application Form at our office.  The Application must be fully completed and be signed by all adult household occupants.  All required verifications must accompany your completed & signed application (see checklist for Welfare Assistance below) or a decision will not be rendered. </p>
                        <p>Do not email or fax completed applications.</p>
                        <p><b>Rental Assistance will not be provided without a Notice to Quit or a Demand for Rent.  Electric Assistance will not be provided without a disconnect notice.</b> </p>

                        <DocumentList groupName='Welfare' />

                        <FAQList groupName='Welfare' />
                        
                    </div>
                    <Aside
                        groupName='Welfare'
                        />
            </div>
        );
    }

}
