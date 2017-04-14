import React from 'react';
import TownNewslettersUI from '../Components/TownNewsletters'
 import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => {
    var newsletters = ownProps.group.newsletter || []
    return {
        newsletters: newsletters,
        title: ownProps.title || 'Town Newsletter',
        id: ''
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchDocs: () => { console.log('Test') }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TownNewslettersUI);
