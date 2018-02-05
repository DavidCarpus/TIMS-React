// import React from 'react';
import StaticPage from './StaticPage'
 import { connect } from 'react-redux'
 import { fetchStaticPage } from '../../actions/StaticPages'

const mapStateToProps = (state, ownProps) => {
    // console.log('state.StaticPage',state.StaticPage);
    return {
        pageName: ownProps.location.pathname,
        pageData: state.StaticPage.StaticPage.html,
        title: state.StaticPage.StaticPage.recorddesc,
        // pageData: "<B>Test Raw HTML</B>"
    };
}
const mapDispatchToProps = (dispatch) => {
  return {
      fetchData: (pageURL) => {
          console.log('fetchStaticPage:pageURL',pageURL);
        dispatch(fetchStaticPage(pageURL))
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StaticPage);
