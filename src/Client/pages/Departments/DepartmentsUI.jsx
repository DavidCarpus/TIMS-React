import React from 'react';
import Assessing from './Assessing'
import CodeEnforcement from './CodeEnforcement'
import ParksRecreation from './ParksRecreation'
import Planning from './Planning'
import PublicWorks from './PublicWorks'
import TownClerk from './TownClerk'
import Welfare from './Welfare'
import CoppleCrownVillage from './CoppleCrownVillage'
import EmergencyManagement from './EmergencyManagement'
import FireDepartment from './FireDepartment'
import ForestFireWarden from './ForestFireWarden'

import TransferStationRules from '../../Components/TransferStationRules'
import Sewer from './Sewer'

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
        case 'CoppleCrownVillage':
            return (
                <CoppleCrownVillage group={this.props.groupData} {...this.props}></CoppleCrownVillage>
            );
        case 'TransferRules':
            return (
                <TransferStationRules group={this.props.groupData} {...this.props}></TransferStationRules>
            );
        case 'EmergencyManagement':
            return (
                <EmergencyManagement group={this.props.groupData} {...this.props}></EmergencyManagement>
            );
        case 'FireDepartment':
            return (
                <FireDepartment group={this.props.groupData} {...this.props}></FireDepartment>
            );

        case 'ForestFireWarden':
            return (
                <ForestFireWarden group={this.props.groupData} {...this.props}></ForestFireWarden>
            );

        default:
            return (
                <div>Unknown department UI: {this.props.groupName}</div>
            );
    }
  }
}
