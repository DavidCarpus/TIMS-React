import React from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm, formValueSelector } from 'redux-form'
import Dropzone from 'react-dropzone';
// const FileUpload = require('react-fileupload');

//https://ollie.relph.me/blog/redux-form-and-dropzone-react-example/

let SubmitChangeForm = props => {
  const {
      handleSubmit,
    //   handleSignInSubmit,
    // updateType,
      dbSubmit,
      validData,
      err,
  } = props

  // console.log('SubmitChangeForm:prop:', props);
  let topMenus = []
  for (var key in props.menus) {
    //   console.log(key);
      if (! (key.indexOf('about') >0 || key.indexOf('calendar') >0 || key.indexOf('PublicRecords')>0 )) {
          topMenus.push([key, props.menus[key]])
      }
  }
  // console.log('topMenus:', topMenus);


  const menus = topMenus.reduce( (a,b) => {
      if (b[1].menus ) {
          return a.concat(b[1].menus)
      }
      return a
  }
  , [])
  .filter(menu => !menu.pageLink.startsWith('http'))
  .map(menu => ({description:menu.description, pageLink:menu.pageLink.replace('/','')}))
  .sort((a,b) => {
      let itemA = a.description.toUpperCase();
      let itemB = b.description.toUpperCase();
      return (itemA < itemB) ? -1 : (itemA > itemB) ? 1 : 0;
  })

  menus.unshift({description:'Home', pageLink:'Home'})
  // menus.unshift({description:'', pageLink:''})

const updateTypes = [
    // {description:'', values:[]},
    {description:'Add', values:['','Minutes', 'Agendas', 'Documents']},
    {description:'Update', values:['','Users', 'PageText']},
    {description:'Archive', values:['','Minutes', 'Agendas', 'Documents']},
]
  // console.log('menus:', menus);

  const validToSubmit = true;

  // const uploadOptions={
  //     baseUrl:'http://127.0.0.1',
  //     param:{
  //         fid:0
  //     }
  // };
  const FILE_FIELD_NAME = 'file';

const renderDropzoneInput = (field) => {
  const files = field.input.value;
  return (
    <div>
      <Dropzone
        name={field.name}
        onDrop={
            ( filesToUpload, e ) => {
                console.log(filesToUpload);
                return field.input.onChange(filesToUpload)
            }
        }
      >
        <div>Try dropping some files here, or click to select files to upload.</div>
      </Dropzone>
      {field.meta.touched &&
        field.meta.error &&
        <span className="error">{field.meta.error}</span>}
      {files && Array.isArray(files) && (
        <ul>
          { files.map((file, i) => <li key={i}>{file.name}</li>) }
        </ul>
      )}
    </div>
  );
}
  // <option value="#00ff00">Green</option>
  // <option value="#0000ff">Blue</option>
    return (
        <div id='SubmitChangeForm'>
            <form onSubmit={values => handleSubmit(values)}>
                <div>Submit Change Form</div>
                    <div>
                        <label htmlFor='group' className={validData['group']? '': 'required'}>Group: </label>
                            <Field name="group" component="select">
                                {menus.map( (menu, index) =>
                                    <option value={menu.pageLink} key={menu.pageLink}>{menu.description}</option>
                                )}
                            </Field>
                        { err && !err.success && err.errors && err.errors.group}
                        <br/>
                        <label htmlFor='updateType' className={validData['updateType']? '': 'required'}>Update Type: </label>
                            <Field name="updateType" component="select">
                                {updateTypes.map( type =>
                                    <option value={type.description} key={type.description}>{type.description}</option>
                                )}
                            </Field>
                            &nbsp;&nbsp;
                            { props.updateType &&
                                    <Field name="elementType" component="select">
                                        {updateTypes.filter(type => type.description === props.updateType )[0].values.map( type =>
                                            <option value={type} key={type}>{type}</option>
                                        )}
                                    </Field>
                                    // props.elementType &&
                            }
                            {
                                <Field
                                  name={FILE_FIELD_NAME}
                                  component={renderDropzoneInput}
                                />
                            }
                            { err && !err.success && err.errors && err.errors.updateType}
                            <div>
                                <button className='button' type="submit" disabled={!validToSubmit || dbSubmit}>Submit</button>
                            </div>
                </div>
            </form>
        </div>
    )
}
/*
<input type='file' {...props.field}
    onChange={
        ( e ) => {
            e.preventDefault();
            const { fields } = props;
            // convert files to an array
            const files = [ ...e.target.files ];
            fields.attachment.handleChange(files);
        }
    }
    />
    */
// <FileUpload options={uploadOptions}>
//     <button ref="chooseBtn">choose</button>
//     <button ref="uploadBtn">upload</button>
// </FileUpload>
//==================================================
const selector = formValueSelector('SubmitChangeForm') // <-- same as form name
SubmitChangeForm = connect(
  state => {
      const group = selector(state, 'group')
      const updateType = selector(state, 'updateType')
    //   console.log('formValueSelector:updateType:', updateType);
      const validData = {group: (group && group.length > 3 ),
          updateType: (updateType && updateType.length > 3)
      }
      const elementType = selector(state, 'elementType')


    return {
      group,
      updateType,
      elementType,
      validData
    }
  }
)(SubmitChangeForm)

export default reduxForm({ form: 'SubmitChangeForm' })(SubmitChangeForm)
