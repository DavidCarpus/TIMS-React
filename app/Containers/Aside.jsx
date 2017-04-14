import React from 'react';
import AsideUI from '../Components/Aside'
 import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
    var asides = ownProps.group.asides || []
    return {
        asides: asides
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchDocs: () => { console.log('Test') }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AsideUI);
