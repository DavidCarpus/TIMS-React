import React from 'react';
 import CodeEnforcementUI from '../Components/CodeEnforcement'

export default class CodeEnforcement extends React.Component {
    render() {
        var group = this.props.group;
        // var groupPageText = group.pagetext;

        return (
            <div>
                <CodeEnforcementUI group={group} store={this.props.store} helpfulInformation={group.helpfulinformation} />
            </div>
        )
    }
}
