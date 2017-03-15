import React from 'react';
import DocumentList  from './DocumentList'
import Aside from './Aside'
import SmartLink from './SmartLink'
import layoutStyles from './MainLayout.css'

import GroupMembers from './GroupMembers'
import AgendasAndMinutes from './AgendasAndMinutes'

export default class LibraryTrustees extends React.Component {

    render() {
        return (
            <div id="LibraryTrustees">
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>Library Trustees Committee</h1>
                    <h2>Milton Free Public Library Mission Statement</h2>
                    <quote>The mission of the Milton Free Public Library is to promote the use of the library and to provide the community access to the books, ideas, resources, and information for the education, employment, and self-government in a society that values and protects freedom of speech, which celebrates and respects our similarities and our differences, and holds all people to be equal and free.</quote>

                    <GroupMembers
                        groupName='LibraryTrustees'
                        title='Budget Committee Members'
                        />
                    <AgendasAndMinutes
                        groupName='LibraryTrustees'
                        />


                    <DocumentList
                        groupName='LibraryTrustees'
                        title='Budget Committee Documentation'
                        />
                </div>
            <Aside groupName='LibraryTrustees' />
            </div>
        );
    }

}
