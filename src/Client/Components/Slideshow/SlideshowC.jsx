// import React from 'react';
import Slideshow from './Slideshow'
 import { connect } from 'react-redux'
// import { fetchSlideshowData } from '../../actions/CalendarData'
import slideshow from './testdata.json'
// let slideshow=[]

const mapStateToProps = (state, ownProps) => {

    // setInterval(this.timer.bind(this), 5000);

    // let recordState = state.SlideshowData;

    // let slideshowData = recordState.SlideshowData || [];

    // console.log('slideshow:', slideshow[0]);
    return {
        slideshowData: slideshow[0],
        // slideshowData: [],
        group: ownProps.group,
    };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchData: () => {
        //  dispatch(fetchSlideshowData())
     }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Slideshow);
