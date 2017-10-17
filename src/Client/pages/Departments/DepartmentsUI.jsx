import React from 'react';
import Assessing from './Assessing'
import ParksRecreation from './ParksRecreation'
import Planning from './Planning'
import PublicWorks from './PublicWorks'
import TownClerk from './TownClerk'
import Welfare from './Welfare'
import DefaultDepartment from './DefaultDepartment'


import TransferStationRules from '../../Components/TransferStationRules'

import  './Departments.css'

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
            <Assessing group={this.props.groupData} {...this.props}></Assessing>
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
        // case 'Sewer':
        //     return (
        //         <Sewer group={this.props.groupData} {...this.props}></Sewer>
        //     );
        case 'Welfare':
            return (
                <Welfare group={this.props.groupData} {...this.props}></Welfare>
            );
        case 'TransferRules':
            return (
                <TransferStationRules group={this.props.groupData} {...this.props}></TransferStationRules>
            );

        case 'CodeEnforcement':
        case 'CoppleCrownVillage':
        case 'EmergencyManagement':
        case 'FireDepartment':
        case 'ForestFireWarden':
        case 'Sewer':
            return (
                <DefaultDepartment group={this.props.groupData} title={this.props.groupData.groupDescription} {...this.props}></DefaultDepartment>
            );

        default:
        // <DefaultDepartment group={this.props.groupData} title={this.props.groupData.groupDescription} {...this.props}></DefaultDepartment>
            return (
                <div>Unknown department UI: {this.props.groupName}</div>
            );
    }
  }
}
