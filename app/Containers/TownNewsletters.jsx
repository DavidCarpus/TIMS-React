import React from 'react';
 import SmartLink from '../Components/SmartLink'
 import TownNewslettersUI from '../Components/TownNewsletters'
 import {gazette} from '../Data/ParksRecreation.json'

export default class TownNewsletters extends React.Component {
    render() {
        var id = 'TownNewsletters'
        var title = this.props.title || 'Milton Town Gazette'

        return (
            <div>
                <TownNewslettersUI newsletters={gazette} title={title} id={id} />
            </div>
        )
    }
}
