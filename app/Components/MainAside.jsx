import React from 'react';

export default class Aside extends React.Component {
    render() {
        var recentEvents = this.props.data
        return (
            <aside className="primary-aside">
            <ul>
                {recentEvents.map((recentEvent, index) =>
                    <li key={index}>{recentEvent.desc}</li>
                    )}

            </ul>

        </aside>
        );
    }
}
