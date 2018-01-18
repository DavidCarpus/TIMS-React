var {getDayOfMonth} = require('./date');

//========================================
const testGetDayOfMonth = () => {
    const startDate = new Date('2018-01-27T00:00:00.000Z')
    console.log('startDate:',startDate);
    [{dow:3, weekNum:2}, {dow:3, weekNum:3}, {dow:5, weekNum:2},
        {dow:5, weekNum:3}    , {dow:6, weekNum:2}    , {dow:0, weekNum:1}
    ].map(fetch=> {
        console.log(fetch, getDayOfMonth(startDate, fetch.dow, fetch.weekNum ));
    })
}

if (require.main === module) {
    testGetDayOfMonth()
}
