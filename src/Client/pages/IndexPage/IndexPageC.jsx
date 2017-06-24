// import React from 'react';
import IndexPage from './IndexPage'
 import { connect } from 'react-redux'
 import { fetchSystemIndex } from '../../actions/SystemIndex'

const mapStateToProps = (state, ownProps) => {
    let groupedLinks = {};
    if (state.SystemIndex.links.length > 0) {
        groupedLinks = state.SystemIndex.links.reduce((groups, element) => {
            // console.log('element:', element);
            let key = element.desc.charAt(0);
            (groups[key] = groups[key] || []).push(element);
            return groups;
        }, {});
    }
    groupedLinks = Object.keys(groupedLinks).map(function(val) { return {key: [val], links:groupedLinks[val]} });

    return {
        links: groupedLinks,
        store: ownProps.store,
        title: 'Index of Pages and Helpful Links'
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: () => {
        dispatch(fetchSystemIndex())
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage);
