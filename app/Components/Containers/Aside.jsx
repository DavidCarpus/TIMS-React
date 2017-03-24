import React from 'react';
 import data from '../Data/Asides.json'
 import SmartLink from '../UI/SmartLink'
 import AsideUI from '../UI/Aside'

export default class Aside extends React.Component {
    render() {
        var groupName= this.props.groupName || ''
        var id = groupName + '_Asides'
        var title = this.props.title || `Milton ${groupName} Documentation`
        var asides = data.filter( (aside)=>
                    {return aside.department == groupName } )

        return (
            <AsideUI asides={asides} title={title} groupName={groupName} />
        )
    }
}
