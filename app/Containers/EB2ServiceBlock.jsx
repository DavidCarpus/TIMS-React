import React from 'react';
 import EB2ServiceBlockUI from '../Components/EB2ServiceBlock'
 import { connect } from 'react-redux'
import {fetchEB2ServicesData} from '../actions/EB2Services'

// import {services} from '../Data/EB2Services.json'

 const mapStateToProps = (state, ownProps) => {
    //  console.log('mapStateToProps:group' + JSON.stringify(ownProps.group) );
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
//
// export default class EB2ServiceBlock extends React.Component {
//     render() {
//         var groupName= this.props.groupName || ''
//         var id = groupName + '_EB2ServiceBlock'
//         var title = this.props.title || ''
//         var servicesData = services
//
//          if (groupName.length > 0 ) {
//                  servicesData = services.filter( (service)=>
//                      {return service.dept == groupName } )
//          }
//
//         return (
//             <div>
//                 <EB2ServiceBlockUI services={servicesData} title={title} />
//             </div>
//         )
//     }
// }
