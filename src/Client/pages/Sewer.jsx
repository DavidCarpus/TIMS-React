import React from 'react';
import {  Col } from 'react-bootstrap';

import SmartLink from '../Components/SmartLink'
import Aside from '../Components/Aside'
import DocumentList  from '../Components/DocumentList'
import RawText from '../Components/RawText'

// export default class Sewer extends React.Component {
export default function Sewer({group, store, loading, id, title='Sewer Department'}){
    return (
        <div>
            <Col md={9}  mdPush={2} id="contentArea"  >
                    <h1 style={{textAlign:'center'}}>{title}</h1>

                    <RawText groupPageText={group.pagetext} block='description' />

                    <DocumentList group={group} store={store} title='Milton Sewage Department Documentation' />
                    <SmartLink link='http://des.nh.gov/index.htm'
                        linkText='NH Department of Environmental Services (DES)'/>
            </Col>
            <Col md={2} mdPull={9}><Aside group={group} groupName={group.link} store={store} /></Col>

        </div>
    )

}
