const PublicDocumentsConstants = {
    FETCH_MEETING_DOCS : 'FETCH_MEETING_DOCS',
    FETCH_MEETING_DOCS_SUCCESS : 'FETCH_MEETING_DOCS_SUCCESS',
    FETCH_MEETING_DOCS_FAILURE : 'FETCH_MEETING_DOCS_FAILURE',
    RESET_MEETING_DOCS : 'RESET_MEETING_DOCS',
    FETCH_GROUP_DOCS : 'FETCH_GROUP_DOCS',
    FETCH_GROUP_DOCS_SUCCESS: 'FETCH_GROUP_DOCS_SUCCESS',
    FETCH_GROUP_DOCS_FAILURE: 'FETCH_GROUP_DOCS_FAILURE',
    RESET_GROUP_DOCS : 'RESET_GROUP_DOCS',
    FETCH_GROUP_NOTICES : 'FETCH_GROUP_NOTICES',
    FETCH_GROUP_NOTICES_SUCCESS: 'FETCH_GROUP_NOTICES_SUCCESS',
    FETCH_GROUP_NOTICES_FAILURE: 'FETCH_GROUP_NOTICES_FAILURE'
}

const OrganizationalUnitConstants = {
    FETCH_OU_DATA: 'FETCH_OU_DATA',
    FETCH_OU_DATA_SUCCESS: 'FETCH_OU_DATA_SUCCESS',
    FETCH_OU_DATA_FAILURE: 'FETCH_OU_DATA_FAILURE',
}

module.exports = {
    PublicDocumentsConstants,
    OrganizationalUnitConstants
}

/*
errors[

]

document {
    id
    desc
    keywords
    date submitted
    date expires
    url
}
keywordSearch{
    fetching
    suggestions
}

organization{
    id
    name
    parent
    type (department, comittee, subcomittee)
    url
}
*/
