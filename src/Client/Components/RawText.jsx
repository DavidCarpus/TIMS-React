import React from 'react';

export default class RawText extends React.Component {
    render() {
        var text1 = ''
        if (this.props.groupPageText ) {
            if (this.props.block in this.props.groupPageText) {
                    text1 =this.props.groupPageText[this.props.block];
                    text1 =  {__html: text1}
            }
        }

        if (text1) {
            return (
                <p  dangerouslySetInnerHTML={text1} ></p>
            )
        }else {
            return (
                <p></p>
                )
        }
    }
}
