import React from 'react';
import  './TransferStationRules.css'

class WasteType extends React.Component {
    render() {
        var wasteType = this.props.wasteType
        var note = wasteType.note
        if (note) { note =   '(' + note + ')'        }

        return (
            <div>
                <h3>{wasteType.wasteType} {note}</h3>
                    <ul>
                {wasteType.rules
                    .map( (rule, index) =>
                        <li key={index} >{rule}</li>
                    )}
                </ul>
            </div>
        )
    }
}

export default class TransferStationRules extends React.Component {
    render() {
        // var dump = JSON.stringify(this.props.feeSchedule);
        return (
            <div id='TransferStationRules'>
                <div id="contentArea"
                    style={{width:'100%'}}
                    >

                <h2>Transfer Station Rules:</h2>
                <ul>
                    <li>All vehicles entering the Station must have a current permit sticker attached to the lower left (driver’s) side of the windshield.</li>
                    <li>To obtain a stick you must show proof of current residency (i.e. vehicle registration or tax bill) and pay the assessed fee.</li>
                    <li>If borrowing a vehicle the resident must be present with proof of residency.</li>
                    <li>Only clear or transparent trash bags will be accepted.</li>
                    <li>The decision of the attendant overrules signs or guidelines.</li>
                    <li>The speed limit at the Station is 15 mph, please be conscious of other’s safety if not your own.</li>
                    <li>RECYCLING IS MANDATORY. Bags may be opened or rejected for content.</li>
                </ul>


                {this.props.wasteTypes
                    .map( (wasteType, index) =>
                    <WasteType key={index} wasteType={wasteType} />
                )}
                <hr/>

                    <div className="leaves">
                    Leaves/Pine Needles/Grass Clippings can be dumped at Barron Brothers Located at 372 RT 11 Farmington.<br/>
                    (No trash, stumps, plastic or brush)<br/>
                    Hours: Monday- Friday 7am - 5pm. (Closed Saturday's for composts disposals for Milton Residents)<br/>
                    Please Call Ahead to confirm they are open: 755-9071<br/>
                    Milton Residents MUST have a valid Milton Transfer Station sticker and Stop at the office before dumping.<br/>
                    </div>


                    <div className="feeschedule">
                        <h2>Fee Schedule</h2>
                        <div className="feeNote"><p>NOTE: Fees are subject to change without notice.</p></div>
                        {this.props.feeSchedule
                            .map( (wasteType, index) =>
                            <div key={index} className="feeItem">
                                <div className="feeItemDesc">{wasteType.description}</div>
                                <div className="feeItemPrice">{wasteType.price}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}
