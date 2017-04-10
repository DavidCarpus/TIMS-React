import React from 'react';
 import SmartLink from './SmartLink'

export default class DocumentList extends React.Component {
    render() {
        var groupName= this.props.group.link
        var id = groupName + '_Documents'

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
