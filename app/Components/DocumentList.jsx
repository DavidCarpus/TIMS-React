import React from 'react';
 import SmartLink from './SmartLink'

export default class DocumentList extends React.Component {
    // componentWillMount() {
    //     var groupName = this.props.groupName;
    //     if (! this.props.loading && this.props.documentsGroupName != groupName) {
    //         console.log('this.props.fetchDocs(' + groupName + ');');
    //         // this.props.fetchDocs(groupName);
    //     }
    //     // this.props.fetchDocs(this.props.group.link);
    // }

    render() {
        var groupName = this.props.groupName;
        //  || this.props.group.link || this.props.group.desc || 'missing groupName'
        var id = groupName + '_Documents'

      if ( this.props.loading) {
        //   console.log('***DocumentList loading. ');
          return (<div>Loading</div>)
      }
        return (
            <div id={id}>
                {this.props.documents.length > 0 ? <h2>{this.props.title} </h2> : ''}
                {this.props.documents.
                    map( (document, index) =>
                        <div key={index} >
                            <SmartLink link={document.link} linkText={document.desc || document.link} />
                        </div>
                    )}

            </div>
        )
    }
}
