import React from 'react';

var services = [
    {'desc':'Dog Licensing',
        'lnk':'Dogs/Main?towncode=916&source=DL',
        'img':'Purple/DL_btn.gif'},
    {'desc':'Vehicle Registration',
        'lnk':'EReg/Main?towncode=916&source=MV',
        'img':'Orange/ER_btn.gif'},
    {'desc':'Vital Records',
        'lnk':'Vitals/Main?towncode=916&Source=VR',
        'img':'Custom/VitalRecord_Pink.png'
    },
    {'desc':'Beach Passes',
        'lnk':'Main?towncode=4916&source=PS&sourceid=848',
        'img':'Aqua/BP_btn.gif'
    },
    {'desc':'Boat Passes',
        'lnk':'Main?towncode=4916&source=PS&sourceid=849',
        'img':'Custom/BoatPasses.png'
    },
    {'desc':'Transfer Station',
        'lnk':'Main?towncode=4916&source=PS&sourceid=889',
        'img':'Green/TS_btn.gif'
    }
]
// ', 'img':''
class Service extends React.Component {
    imageLink(service){
        return 'http://www.eb2gov.com/Images/Themes/' + service.img
    }
    serviceLink(service){
        return 'https://www.eb2gov.com/scripts/eb2gov.dll/' + service.lnk
// https://www.eb2gov.com/scripts/eb2gov.dll/Dogs/Main?towncode=916&source=DL
// https://www.eb2gov.com/scripts/eb2gov.dll/EReg/Main?towncode=916&source=MV
// https://www.eb2gov.com/scripts/eb2gov.dll/Vitals/Main?towncode=916&Source=VR
// https://www.eb2gov.com/eb2gov.dll/POS/Main?towncode=4916&source=PS&sourceid=848
// https://www.eb2gov.com/eb2gov.dll/POS/Main?towncode=4916&source=PS&sourceid=849
// https://www.eb2gov.com/eb2gov.dll/POS/Main?towncode=916&source=PS&sourceid=889
//
// https://www.eb2gov.com/eb2gov.dll/Main?towncode=916&Source=VR
// towncode=916&Source=VR

    }
    render() {
        var service=this.props.service

        return (
            <div style={{float:'left'}} >
                <li><a href={this.serviceLink(service)} title={service.desc}> <img src={this.imageLink(service)} /></a></li>
            </div>
        );
    }
}
export default class OnlinePaymentsBlock extends React.Component {

render() {
    return (
        <div id='eb2govBlock'>
            <h2>Follow the links for Dog Licensing, Online Registration, Vital Records and to pay Taxes online.</h2>
            <ul style={{listStyleType: 'none'}}>
                {services.
                    map( (service, index) =>
                        <Service key={index} service={service}/>
                    )}
            </ul>
        </div>
    );
}

}
/*
https://www.eb2gov.com/EB2GovImages/Themes/Purple/DL_btn.gif

           <img src={this.imageLink(teamMember)} />

*/
