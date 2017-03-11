var notices=[
   {'date': '2017-03-16', 'desc': 'Spaghetti Dinner'},
   {'date': '2016-10-21', 'desc': ' Softball Field Renovation Committee Draft'},
   {'date': '2016-10-06', 'desc': ' Softball Field Renovation Committee Agenda'},
   {'date': '2016-10-27', 'desc': ' Softball Field Renovation Committee Agenda'},
   {'date': '2016-10-27', 'desc': ' Softball Field Renovation Committee Draft'},
   {'date': '2016-10-21', 'desc': ' Softball Field Renovation Committee Agenda'},
   {'date': '2016-10-06', 'desc': ' Softball Field Renovation Committee Minutes'},
   {'date': '2016-09-28', 'desc': ' Softball Field Renovation Committee Agenda'},
   {'date': '2016-09-28', 'desc': ' Softball Field Renovation Committee Minutes'}
]

var out = notices.
    sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
        // return a.date - b.date;
    }).
    map((notice, index) =>
    notice.date
    )

console.log(JSON.stringify(out));
