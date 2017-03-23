import React from 'react';
import Dropdown from 'react-dropdown'

var planningMaps=[
    {'mapDesc': 'Ground Water', 'link':'http://www.miltonnh-us.com/gis_maps/GroundWater.pdf'},
    {'mapDesc': 'Gravel Extraction Map', 'link':'http://www.miltonnh-us.com/gis_maps/GravelExtraction.pdf'}
]

export default class PlanningMapsForm extends React.Component {
    _onSelect(val){
        window.open(val.value);
    }
    render() {
        var maps =  planningMaps.map( (map, index) => {
                return {'value': map.link, 'label': map.mapDesc};
            }
        )
        return (
            <div style={{width:'300px', display:'inline-block'}}>
                Planning Maps
                <Dropdown
                    options={maps}
                    onChange={this._onSelect}
                    placeholder='Planning Map to view (In new window)' />
            </div>
        );
    }
}
