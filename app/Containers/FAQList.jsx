import React from 'react';
import { connect } from 'react-redux'
import FAQListUI from '../Components/FAQList'
 import FAQData from '../Data/FAQ.json'

const mapStateToProps = (state, ownProps) => {
    var questions = FAQData.filter( (doc)=>
                {return doc.department == ownProps.groupName } )
  return {
      questions: questions,
      title: ownProps.title || 'FAQ',
      groupName: ownProps.groupName
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
     fetchDocs: () => { console.log('Test') }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FAQListUI);
