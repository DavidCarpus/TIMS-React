import React from 'react';
 import CodeEnforcementUI from '../UI/CodeEnforcement'
 import {helpfulInformation} from '../Data/CodeEnforcement.json'

export default class CodeEnforcement extends React.Component {
    render() {
        return (
            <div>
                <CodeEnforcementUI helpfulInformation={helpfulInformation} />
            </div>
        )
    }
}
