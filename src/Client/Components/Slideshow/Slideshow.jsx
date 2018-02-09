import React from 'react';
import  './Slideshow.css'
// import SmartLink from '../SmartLink'
/*
{"order":1,
    "img":"TownHall.jpg",
 "description": "Town Hall"},
*/

const disableTick = true && (process.env.NODE_ENV === 'development')


const translateImgToURI = (img) => {
    if (img.toUpperCase().endsWith('.PNG') || img.toUpperCase().endsWith('.JPG')) {
        return 'images/'+img;
    } else {
        // https://confluence.biola.edu/display/itservices/How+to+Embed+Images+from+Google+Drive+in+a+Web+Page
        return 'https://drive.google.com/uc?export=view&id=' + img;
    }
}

const SlideshowImage = ({url, desc='Image Description', id, flip=false}) => {
    return (
        <div className="SlideshowImage" >
            <img alt={desc}  src={translateImgToURI(url) } className={'description'  + (flip ? " flip": "")}  />

        </div>
    )
}
// <div className="description">
//     {desc}
// </div>

// {translateImgToURI(url)}
// https://drive.google.com/open?id=0B-QIVhquo5DoeDlDdWRaV1pMck0



export default class Slideshow extends React.Component {
    constructor(props) {
      super(props);
    //   console.log('props.slideshowData :', props.slideshowData );
      if (props.slideshowData && props.slideshowData.images && props.slideshowData.images.length > 0) {
          this.state = {
              timer:null,
              currentSlide: 1
          };
      } else {
          this.state = {
              timer:null,
              currentSlide: -1
          };
      }
      this.tick = this.tick.bind(this);
    }
    componentDidMount() {
        let timer = setInterval(this.tick, 7000);
        this.setState({timer});
    }
    componentWillUnmount() {
        clearInterval(this.state.timer);
    }
    tick() {
        if(disableTick)  return;
        if (this.state.timer && this.props.slideshowData.images && this.props.slideshowData.images.length > 0) {
            var nextSlide = this.state.currentSlide || 0;
            nextSlide++
            // console.log('nextSlide:', nextSlide);
            if (nextSlide > this.props.slideshowData.images.length ) {
                nextSlide = 1
            }
            // console.log('currentSlide:', this.state.currentSlide, nextSlide, this.props.slideshowData.images.length);
            // console.log('this.props.slideshowData:', this.props.slideshowData);
            this.setState({
                currentSlide: nextSlide
            });
        }
    }

    render() {
        if ( this.props.loading) {         return (<div>Loading</div>)     }
        if (this.props.slideshowData.length === 0) {        return(null);    }
        if ( this.state.currentSlide <=0 ) {  return(null); }
        let slideshowData = this.props.slideshowData.images || []
        if ( slideshowData.length <=0 ) {  return(null); }

        // console.log(this.state.currentSlide);
        let imageData = this.props.slideshowData.images[this.state.currentSlide-1]

    // {JSON.stringify(entry)}
        return (
            <div id='Slideshow'>
                    <SlideshowImage desc={imageData.description} key={imageData.order}
                        url={imageData.img} id={this.state.currentSlide} flip={imageData.flip}
                        >
                    </SlideshowImage>
            </div>
        );
    }
}
/*
 <imageC key={imageData.id}/>
 JSON.stringify(imageData)
 */
