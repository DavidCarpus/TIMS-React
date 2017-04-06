import React from 'react';
 import data from '../Data/Notices.json'
 import SmartLink from '../UI/SmartLink'
 import NoticesListUI from '../UI/NoticesList'

export default class NoticesList extends React.Component {
    render() {
        var groupName= this.props.groupName || ''
        var id = groupName + '_Noticess'
        var title = this.props.title || `Milton ${groupName} Documentation`
        var notices=[]
        if(groupName == 'Home')
        {
            notices = data.filter( (notice) =>
            {return notice.mainpage } )
        } else {
            notices = data.filter( (notice) =>
            {return notice.dept == groupName } )
        }

        return (
            <div>
                <NoticesListUI notices={notices} title={title} groupName={groupName} />
            </div>
        )
    }
}

/*
Notices:
{JSON.stringify(groupName)}
{JSON.stringify(notices)}
*/
