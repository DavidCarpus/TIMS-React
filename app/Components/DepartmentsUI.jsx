import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Menu from './Menu'
import Footer from './Footer'
import Assessing from '../pages/Assessing'
import CodeEnforcement from '../pages/CodeEnforcement'
import ParksRecreation from '../pages/ParksRecreation'
import Planning from '../pages/Planning'
import PublicWorks from '../pages/PublicWorks'
import TownClerk from '../pages/TownClerk'
import Welfare from '../pages/Welfare'
import TransferStationRules from '../pages/TransferStationRules'
import Sewer from '../pages/Sewer'

export default class DepartmentsUI extends React.Component {
    componentWillMount() {
        this.props.fetchOUData(this.props.currentGroupName || this.props.params.department,);
    }

  render() {
      if ( this.props.loading) {
          return (<div>Loading</div>)
      }

    switch (this.props.groupData.link) {
        case 'Assessing':
            return (
                <Assessing group={this.props.groupData}></Assessing>
            );
        case 'CodeEnforcement':
            return (
                <CodeEnforcement group={this.props.groupData}></CodeEnforcement>
            );
        case 'ParksRecreation':
            return (
                <ParksRecreation group={this.props.groupData}></ParksRecreation>
            );
        case 'Planning':
            return (
                <Planning group={this.props.groupData}></Planning>
            );
        case 'PublicWorks':
            return (
                <PublicWorks group={this.props.groupData}></PublicWorks>
            );
        case 'TownClerk':
            return (
                <TownClerk group={this.props.groupData}></TownClerk>
            );
        case 'Sewer':
            return (
                <Sewer group={this.props.groupData}></Sewer>
            );
        case 'Welfare':
            return (
                <Welfare group={this.props.groupData}></Welfare>
            );
        case 'TransferRules':
            return (
                <TransferStationRules group={this.props.groupData}></TransferStationRules>
            );
    }
    return (
        <div>Unknown department: {this.props.currentGroupName}</div>
    )

  }
}


//   if ( !this.props.loading && this.props.groupData &&  this.props.currentGroupName !=  this.props.groupData.link ) {
//       console.log('*******************');
//       console.log(JSON.stringify(this.props.currentGroupName));
//       console.log(JSON.stringify(this.props));
//       console.log('*******************');
//     //   console.log('***DepartmentsUI fetchOUData: ' + this.props.groupData.link + ':' + this.props.currentGroupName);
//         // this.props.fetchOUData(this.props.currentGroupName);
//   }
//   console.log('DepartmentsUI loading?' + this.props.groupData +':' +this.props.groupData.length +':' + this.props.loading);
