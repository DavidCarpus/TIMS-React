import React from 'react';

export default class TownNewsletters extends React.Component {
    render() {
        return (
            <div>
                <h2>{this.props.title}</h2>
                <ul>
                    {this.props.newsletters.
                        sort((a, b) => {
                            return new Date(b.date) - new Date(a.date);
                        }).
                        map((entry, index) =>
                        <div key={index}>
                            <li>
                                <a href={entry.link}>{entry.desc} Gazette</a>
                            </li>
                        </div>
                    )}

                    </ul>
                </div>
        )
    }
}
