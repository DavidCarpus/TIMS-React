import React from 'react';
import DocumentList  from './DocumentList'
import Aside from './Aside'
import SmartLink from './SmartLink'
import layoutStyles from './MainLayout.css'

import NoticesList from './NoticesList'
import GroupMembers from './GroupMembers'
import AgendasAndMinutes from './AgendasAndMinutes'

import notices from './Data/Notices.json'
import organizations from './Data/OrganizationalUnits.json'
import organizationPageText from './Data/OrganizationPageText.json'

class RawText extends React.Component {
    render() {
        var text1 = ''
        if (this.props.groupPageText && this.props.groupPageText.pagetext) {
            if (this.props.block in this.props.groupPageText.pagetext[0]) {
                    text1 =this.props.groupPageText.pagetext[0][this.props.block];
                    text1 =  {__html: text1}
            }
        }

        if (text1) {
            return (
                <p  dangerouslySetInnerHTML={text1} ></p>
            )
        }else {
            return (
                <p></p>
                )
        }
    }
}

export default class Committees extends React.Component {

    render() {
        var group = organizations.filter( (organization)=>
                    {return organization.link == this.props.params.commitee } )[0]
        var groupPageText = organizationPageText.filter( (organization)=>
                    {return organization.name == this.props.params.commitee } )
        if (groupPageText != null) {
            groupPageText = groupPageText[0]
        }


        var groupName = group.link || group.desc || 'missing desc'
        var groupLabel = group.desc || 'missing desc'

        return (
            <div id={groupName}>
                <div id="contentArea"  className={layoutStyles.contentArea}>
                    <h1 style={{textAlign:'center'}}>{groupLabel}</h1>

                    <RawText groupPageText={groupPageText} block='desc' />

                    <RawText groupPageText={groupPageText} block='text1' />

                    <NoticesList notices={notices.filter((notice)=> {return notice.dept == groupName})}/>

                    <GroupMembers
                        groupName={groupName}
                        title={groupLabel + ' Members'}
                        />

                    <AgendasAndMinutes
                        groupName={groupName}
                        />


                    <DocumentList
                        groupName={groupName}
                        title={groupLabel + ' Documentation'}
                        />
                </div>
            <Aside groupName={groupName} />
            </div>
        );
    }

}
/*
{text1 ? <p  dangerouslySetInnerHTML={text1} ></p> : ''}

*/
