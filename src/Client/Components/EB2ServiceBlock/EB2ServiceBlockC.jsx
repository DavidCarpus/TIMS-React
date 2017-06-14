// import React from 'react';
 import EB2ServiceBlockUI from './EB2ServiceBlock'
 import { connect } from 'react-redux'
import {fetchEB2ServicesData} from '../../actions/EB2Services'

 const mapStateToProps = (state, ownProps) => {
     return {
         group: ownProps.group,
         groupName: ownProps.groupName,
         services: state.EB2Services.EB2Data,
         servicesGroupName: state.EB2Services.groupName,
         loading: state.EB2Services.loading,
         title: ownProps.title || 'Documentation',
     };
 }
 const mapDispatchToProps = (dispatch) => {
   return {
       fetchData: (groupName) => {
           dispatch(fetchEB2ServicesData(groupName))
      }
   }
 }

 export default connect(mapStateToProps, mapDispatchToProps)(EB2ServiceBlockUI);
