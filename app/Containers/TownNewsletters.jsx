import React from 'react';
 import SmartLink from '../UI/SmartLink'
 import TownNewslettersUI from '../UI/TownNewsletters'
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
