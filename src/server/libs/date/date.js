var addDays = require('date-fns/add_days')
var startOfMonth = require('date-fns/start_of_month');
var endOfMonth = require('date-fns/end_of_month');
var startOfWeek = require('date-fns/start_of_week');
var endOfWeek = require('date-fns/end_of_week');
var isWithinRange = require('date-fns/is_within_range')

//========================================
const dateAbbreviations = [{abbr:'SU', num:0},
    {abbr:'MO', num:1},        {abbr:'TU', num:2},         {abbr:'WE', num:3},
    {abbr:'TH', num:4},        {abbr:'FR', num:5},          {abbr:'SA', num:6},
]
const dateNum = (dateAbbr) => dateAbbreviations.filter(rec=>rec.abbr === dateAbbr)[0].num
const dateAbbr = (dateNum) => dateAbbreviations.filter(rec=>rec.num === dateNum)[0].abbr
const dateFromICSDateStr = (datestr) => datestr? new Date(datestr.substring(0,4)+ '-' + datestr.substring(4,6) + '-' + datestr.substring(6,8) +
 'T' + datestr.substring(9,11) + ':' + datestr.substring(11,13)  + ':' + datestr.substring(13,15) + "Z")
 :null
//========================================
const getDayOfMonth = (baseDate, day , week) => {
    let firstOfMonth = new Date(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), 1)
    let firstSunOfMonth = addDays(firstOfMonth, 7-firstOfMonth.getDay())
    const chk = (week - 1)*7 + firstSunOfMonth.getDate() + day - (day>= firstOfMonth.getDay()?7:0)

    return new Date(baseDate.getFullYear(), baseDate.getMonth(),chk,
        baseDate.getHours(), baseDate.getMinutes())
}
//========================================
function getHomeCalendarDateRange() {
    const pivot = new Date()
    return [startOfWeek(startOfMonth(pivot)), endOfWeek(endOfMonth(pivot))]
}
//========================================

module.exports.getDayOfMonth = getDayOfMonth;
module.exports.dateFromICSDateStr = dateFromICSDateStr;
module.exports.getHomeCalendarDateRange = getHomeCalendarDateRange;
