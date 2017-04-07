import React from 'react';
 import SmartLink from '../Components/SmartLink'
 import TownNewslettersUI from '../Components/TownNewsletters'
 import organizations from '../Data/OrganizationalUnits.json'

export default class TownNewsletters extends React.Component {
    render() {
        var id = 'TownNewsletters'
        var title = this.props.title || 'Milton Town Gazette'
        var parksRecreationData = organizations.filter( (organization)=>
            {return organization.link == 'ParksRecreation' } )[0]
       var gazette =parksRecreationData.gazette


        return (
            <div>
                <TownNewslettersUI newsletters={gazette} title={title} id={id} />
            </div>
        )
    }
}
