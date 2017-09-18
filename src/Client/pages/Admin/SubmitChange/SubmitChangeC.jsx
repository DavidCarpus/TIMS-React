import SubmitChange from './SubmitChange'
 import { connect } from 'react-redux'
 import { submitChangeRequest } from '../../../actions/SubmitChange'
import addDays from 'date-fns/add_days'
import { fetchDocumentsForMonth } from '../../../actions/PublicDocuments'

let initialValues = {}

//========================================================
const groupListFromMenus = (MainMenus) => {
    if(!(MainMenus && MainMenus.menus)) return []

    let topMenus = []
    for (var key in MainMenus.menus) {
        if (! (key.indexOf('about') >0 || key.indexOf('calendar') >0 || key.indexOf('PublicRecords')>0 )) {
            topMenus.push([key, MainMenus.menus[key]])
        }
    }
    let groups = topMenus.reduce( (a,b) => {
        if (b[1].menus ) {
            return a.concat(b[1].menus)
        }
        return a
    }
    , [])
    // .filter(menu => !menu.pageLink.startsWith('http'))
    .map(menu => ({description:menu.description, id:menu.pageLink.startsWith('http')?menu.description: menu.pageLink.replace('/','')}))
    .sort((a,b) => {
        let itemA = a.description.toUpperCase();
        let itemB = b.description.toUpperCase();
        return (itemA < itemB) ? -1 : (itemA > itemB) ? 1 : 0;
    })

    groups.unshift({description:'Home', id:'Home'})
    groups.unshift({description:'', id:'0'})

    return groups
}
//========================================================
 const mapStateToProps = (state, ownProps) => {
    const documentDate = addDays(new Date(), -1);

    initialValues.documentDate= (documentDate.getUTCMonth()+1) + '/' + documentDate.getDate()+ '/' + documentDate.getUTCFullYear()

     if (process.env.NODE_ENV === 'development') {
         initialValues = {
             documentDate: (documentDate.getUTCMonth()+1) + '/' + documentDate.getDate()+ '/' + documentDate.getUTCFullYear(),
             group: 'Selectmen',
             updateType: 'Add',
             elementType: 'Minutes',
             expires: 0,
            //  expires: 10,
             year: 2017,
             month: 9
         }
     }

    //  console.log('Object.keys(state.PublicRecords.publicRecords):', Object.keys(state.PublicRecords.publicRecords)
    //  .map( (acc, nextItem) ));
    let archivedItem={}
    if (state.ChangeRequests.data.message === "Item Archived!") {
        archivedItem.expiredate = state.ChangeRequests.data.user.expiredate
        archivedItem.id = state.ChangeRequests.data.user.archiveItem
    }

     const submitSucceeded= state.form && state.form.SubmitChangeForm && state.form.SubmitChangeForm.submitSucceeded;
     const loggedin = (state.Authentication.data && state.Authentication.data.token && state.Authentication.data.token.length > 10);
     const changeProcessed= state.ChangeRequests && state.ChangeRequests.data.success;
     let archiveData = state.PublicRecords && Object.keys(state.PublicRecords.publicRecords).reduce( (acc, nextKey) => {
             return acc.concat(state.PublicRecords.publicRecords[nextKey])
         }
         , []).filter(pubRec => {
             if (state.form.SubmitChangeForm.values && state.form.SubmitChangeForm.values.month && state.form.SubmitChangeForm.values.year) {
                 const dte=new Date(pubRec.date)
                 const chk = {
                     year: state.form.SubmitChangeForm.values.year || state.form.SubmitChangeForm.initial.year,
                     month: state.form.SubmitChangeForm.values.month || state.form.SubmitChangeForm.initial.month,
                  }
                 return ( (dte.getUTCMonth()+1) === parseInt(chk.month,10) &&
                    (dte.getUTCFullYear()) === parseInt(chk.year,10)
                )
            }
            return false;
        })
        .map(recMatchDate => {
            const id= recMatchDate.id
            const expiredate = (archivedItem.id === id) ? archivedItem.expiredate : recMatchDate.expiredate

            const recDesc = (recMatchDate.description !== null && typeof recMatchDate.description !== 'undefined') ?
                recMatchDate.description: recMatchDate.link.replace(/.*\//,'')
            return {id:id, description: (expiredate ? "*":"") + recDesc + " - ("+recMatchDate.id+")" }
        })
        if (archiveData.length>0) {
            archiveData.unshift({description:'', id:'0'})
        }

     return {
         initialValues: initialValues,
         err: state.ChangeRequests.error,
         validData: ownProps.validData,
         loggedin: loggedin,
         submitSucceeded: submitSucceeded || changeProcessed,
         changeProcessed: changeProcessed,
         groups:groupListFromMenus(state.MainMenus),
         archiveData:archiveData,
     };
 }
 //========================================================
 const mapDispatchToProps = (dispatch) => {
  return {
      onChangesSubmit: (values) => {
          var submitData = {...values}
          delete submitData.email;
          delete submitData.password;
          console.log('onChangesSubmit:', submitData);
          dispatch(submitChangeRequest(submitData));
          initialValues  = Object.assign(initialValues, submitData);
          delete initialValues.file;
    },
    fetchDocuments: (values) => {
        var submitData = {groupName:values.group, documentType:values.elementType, ...values}
        // console.log('fetchDocumentsForMonth:', submitData);
        dispatch(fetchDocumentsForMonth(submitData));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubmitChange);
