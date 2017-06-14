import React from 'react';
import Dropdown from 'react-dropdown'
import '../Styles/TaxMapForm.css'

export default class TaxMapForm extends React.Component {
    _onSelect(val){
        var mapNum = val.value.replace('Tax Map', '').trim()
        console.log(mapNum);
        mapNum = (mapNum <= 10) ? '0'+mapNum: mapNum
        mapNum = (mapNum == 'OVERALL') ? '-'+mapNum: mapNum
        var url = 'http://www.miltonnh-us.com/taxmaps/MILTON'+mapNum + '.pdf'
        window.open(url);
    }
render() {
    var maps = [];
    for (var i = 1; i <= 49; i++) {
        maps.push(`Tax Map ${i}`);
    }
    maps.push('Tax Map OVERALL');

    return (
        <div style={{width:'300px', display:'inline-block'}}>
            Tax Maps
            <Dropdown
                options={maps}
                onChange={this._onSelect}
                placeholder='Tax Map to view (In new window)' />
        </div>
    );
}
}
