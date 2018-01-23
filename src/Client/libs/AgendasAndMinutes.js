module.exports = {
    documentsByYear : documentsByYear,
}

function documentsByYear(documents) {
    if (!documents || typeof documents === 'undefined')  return {}

    const byYear = Object.keys(documents)
    .sort((a,b) => new Date(b) - new Date(a))
    .map( (val) => [val, documents[val] ] )
    .reduce( (acc, curr, i) => {
        let year = ((new Date(curr[0])).getFullYear());
        // acc[year] = acc[year]? acc[year].concat(curr): curr;
        acc[year] = acc[year]? acc[year]: [];
        acc[year].push(curr)

        return acc;
    }, {})

    const results = Object.keys(byYear)
        .map( _date  => {
            return {date:_date, values:  byYear[_date]}
        })

    return results
}
