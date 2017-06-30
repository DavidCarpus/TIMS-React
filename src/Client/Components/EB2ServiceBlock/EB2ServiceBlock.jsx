import React from 'react';
import EB2ServiceLink from './EB2ServiceLink'

export default class EB2ServiceBlock extends React.Component {
    componentWillMount() {
        var groupName = this.props.groupName
        // console.log('EB2ServiceBlock:componentWillMount' + groupName);
        this.props.fetchData(groupName);
    }

    render() {
        var groupName= this.props.groupName || ''
        var id = groupName + '_EB2ServiceBlock'
        // var out = JSON.stringify(this.props.services);

        if ( this.props.loading) {
          //   console.log('***DocumentList loading. ');
            return (<div>Loading</div>)
        }
        let secure = (window.location.href.indexOf('https:') >= 0)

        return (
            <ul id={id} style={{listStyleType: 'none'}}>
                {console.log(window.location.href)}
                {this.props.services.map( (service, index) =>
                    <EB2ServiceLink key={index} service={service} secure={secure}/>
                    )}
            </ul>
        );
    }
}
/*



*/
