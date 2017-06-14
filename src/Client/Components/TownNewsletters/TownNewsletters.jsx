import React from 'react';
import SmartLink from '../SmartLink/SmartLink'

export default class TownNewsletters extends React.Component {
    render() {
        return (
            <div>
                <h2>{this.props.title}</h2>
                <ul>
                    {this.props.newsletters
                        .sort((a, b) => {
                            return new Date(b.date) - new Date(a.date);
                        })
                        .map((entry, index) =>
                        <div key={index}>
                            <li>
                                <SmartLink link={entry.link}
                                    linkText={entry.description}/>
                            </li>
                        </div>
                    )}

                    </ul>
                </div>
        )
    }
}

// <a href={entry.link}>{entry.desc} Gazette</a>
