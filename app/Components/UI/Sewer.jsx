import React from 'react';
import SmartLink from './SmartLink'
import Aside from './Aside'
import DocumentList  from './DocumentList'
import { Grid, Row, Col } from 'react-bootstrap';

export default class Sewer extends React.Component {
    render() {
        return (
            <div>
                <Col md={2}><Aside groupName={'Sewer'} /></Col>
                <Col md={10}  id="contentArea" >
                        <h1 style={{textAlign:'center'}}>Sewer Department</h1>

                        <p>The wastewater facility services approximately 300 units in the town of Milton and treated approximately 22,593,000 gallons of sewerage at an average daily flow of 62,000 gallons. We continue to operate around 62% of plant design capacity allowing future growth within the community.</p>
                        <p>The carbonaceous biochemical oxygen demand (CBOD) removal efficiency averaged 96.5% and the total suspended solids (TSS) removal efficiency averaged 91.5% for the year. The minimum acceptable removal efficiency for each of these test parameters is 85.0%. The annual whole effluent toxicity (WET) test passed with no indication of the effluent having any toxic effects on the Salmon Falls River. These effluent parameters show that the plant continues to perform exceptionally well and discharges a good quality effluent.</p>
                        <p>We continue to add a chemical called “alum” to the raw sewerage from April thru Sept. to reduce the amount of total phosphorus (TP) being discharged to the river. We have done this for 8 years with good results. Reducing TP is important because it is a vital nutrient for algae growth, which can cause oxygen deficiencies in the river. The plant averages 4.0-5.0 mg/l before alum addition and between 2.0 and 3.5 mg/l after alum addition. The average is 2.5 mg/l. This represents a 50% reduction to the river and keeps the plant in compliance with our discharge permit.</p>
                        <p>All plant equipment is operational and in good working order.</p>
                        <p><i>The Sewer Department is in the process of streamlining their billing process and updating records. In the coming months, those who utilize sewer services will be receiving information on these changes and asking for confirmation of their billing information. If you utilize sewer services and have not received information by mail, we ask that you please contact our secretary to update our records.</i></p>

                        <DocumentList
                            groupName='Sewer'
                            title='Milton Sewage Department Documentation'
                            />
                        <SmartLink link='http://des.nh.gov/index.htm'
                            linkText='NH Department of Environmental Services (DES)'/>
                </Col>
            </div>
        )
    }
}
