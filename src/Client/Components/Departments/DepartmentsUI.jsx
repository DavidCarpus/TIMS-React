import React from 'react';
import Assessing from '../../pages/Assessing'
import CodeEnforcement from '../../pages/CodeEnforcement'
import ParksRecreation from '../../pages/ParksRecreation'
import Planning from '../../pages/Planning'
import PublicWorks from '../../pages/PublicWorks'
import TownClerk from '../../pages/TownClerk'
import Welfare from '../../pages/Welfare'
import TransferStationRules from '../TransferStationRules'
import Sewer from '../../pages/Sewer'

export default class DepartmentsUI extends React.Component {
    componentWillMount() {
        // console.log('DepartmentsUI:componentWillMount: ' ,this.props);
        this.props.fetchData(this.props.groupName);
    }

  render() {
      if ( this.props.loading || ! this.props.groupData) {
          return (<div>DepartmentsUI Loading {this.props.groupName}</div>)
      }

    switch (this.props.groupName) {
        case 'Assessing':
            return (
                <Assessing group={this.props.groupData}  {...this.props}></Assessing>
            );
        case 'CodeEnforcement':
            return (
                <CodeEnforcement group={this.props.groupData} {...this.props}></CodeEnforcement>
            );
        case 'ParksRecreation':
            return (
                <ParksRecreation group={this.props.groupData} {...this.props}></ParksRecreation>
            );
        case 'Planning':
            return (
                <Planning group={this.props.groupData} {...this.props}></Planning>
            );
        case 'PublicWorks':
            return (
                <PublicWorks group={this.props.groupData} {...this.props}></PublicWorks>
            );
        case 'TownClerk':
            return (
                <TownClerk group={this.props.groupData} {...this.props}></TownClerk>
            );
        case 'Sewer':
            return (
                <Sewer group={this.props.groupData} {...this.props}></Sewer>
            );
        case 'Welfare':
            return (
                <Welfare group={this.props.groupData} {...this.props}></Welfare>
            );
        case 'TransferRules':
            return (
                <TransferStationRules group={this.props.groupData} {...this.props}></TransferStationRules>
            );
        default:
            return (
                <div>Unknown department UI: {this.props.groupName}</div>
            );
    }
  }
}
