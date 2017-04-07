import React from 'react';
 import SmartLink from '../Components/SmartLink'
 import NoticesListUI from '../Components/NoticesList'
 import data from '../Data/PublicRecords.json'

export default class NoticesList extends React.Component {
    render() {
        var groupName= this.props.groupName || ''
        var id = groupName + '_Noticess'
        var title = this.props.title || `Milton ${groupName} Documentation`
        // var notices=[]

        var notices = data.filter( (record)=> {
            return  record.type == 'Notice'
        } ).sort((a, b) => {
            const ad = new Date(a.date);
            const bd = new Date(b.date);
            return ad<bd ? -1: ad>bd ? 1: a.order - b.order
            // return ad<bd ? -1: ad>bd ? 1:  b.order - a.order
        })

        if(groupName == 'Home')
        {
            notices = notices.filter( (notice) =>
            {return notice.mainpage } )
        } else {
            notices = notices.filter( (notice) =>
            {return notice.groupName == groupName } )
        }

        return (
            <div>
                <NoticesListUI notices={notices} title={title} groupName={groupName} />
            </div>
        )
    }
}

/*
{JSON.stringify(notices)}
Notices:
{JSON.stringify(groupName)}
{JSON.stringify(notices)}
*/
