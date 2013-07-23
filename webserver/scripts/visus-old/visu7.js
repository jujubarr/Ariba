var isBigDisplay;
var isMax;

function initialization(){
    hasReceivedHistoricalDataVisu8 = false;
    isMax = false;
    isBigDisplay = false;
    limit = 0;
}

function calculateStats (){ // String YYYYMMDD
    // TODAY STATS
    var today_amount = parseFloat(rebuild_aggregated_day_transactions[rebuild_aggregated_day_transactions.length - 1][1]);
    var today_volume = parseFloat(rebuild_aggregated_day_transactions[rebuild_aggregated_day_transactions.length - 1][2]);
    var today_cpt = parseFloat(rebuild_aggregated_day_transactions[rebuild_aggregated_day_transactions.length - 1][3]);

    // MONTH STATS
    var month_amount = parseFloat(rebuild_aggregated_month_transactions[rebuild_aggregated_month_transactions.length - 1][1]);
    var month_volume = parseFloat(rebuild_aggregated_month_transactions[rebuild_aggregated_month_transactions.length - 1][2]);
    var month_cpt = parseFloat(rebuild_aggregated_month_transactions[rebuild_aggregated_month_transactions.length - 1][3]);

    var month_pourcentage_amount = Math.floor( ( today_amount / month_amount ) * 100 );
    var month_pourcentage_volume = Math.floor( ( today_volume / month_volume ) * 100 );
    var month_pourcentage_cpt = Math.floor( ( today_cpt / month_cpt ) * 100 );

    // YEARS STATS
    var year_amount = parseFloat(rebuild_aggregated_year_transactions[rebuild_aggregated_year_transactions.length - 1][1]);
    var year_volume = parseFloat(rebuild_aggregated_year_transactions[rebuild_aggregated_year_transactions.length - 1][2]);
    var year_cpt = parseFloat(rebuild_aggregated_year_transactions[rebuild_aggregated_year_transactions.length - 1][3]);

    var year_pourcentage_amount = Math.floor( ( today_amount / year_amount ) * 100 );
    var year_pourcentage_volume = Math.floor( ( today_volume / year_volume ) * 100 );
    var year_pourcentage_cpt = Math.floor( ( today_cpt / year_cpt ) * 100 );

    document.getElementById("init_date").innerHTML = (init_date.getDate() + " "+
                                                        months_names[init_date.getMonth()] + " "+
                                                        init_date.getFullYear()).toString();
    document.getElementById("today_date").innerHTML = (today_date.getDate() + " "+
                                                        months_names[today_date.getMonth()] + " "+
                                                        today_date.getFullYear()).toString();
    document.getElementById("today_date2").innerHTML = (today_date.getDate() + " "+
                                                        months_names[today_date.getMonth()] + " "+
                                                        today_date.getFullYear()).toString();
    document.getElementById("today_amount").innerHTML = today_amount;
    document.getElementById("today_volume").innerHTML = today_volume;
    document.getElementById("today_cpt").innerHTML = today_cpt;

    document.getElementById("month_date").innerHTML = months_names[today_date.getMonth()];
    document.getElementById("month_amount").innerHTML = month_pourcentage_amount;
    document.getElementById("month_volume").innerHTML = month_pourcentage_volume;
    document.getElementById("month_cpt").innerHTML = month_pourcentage_cpt;

    document.getElementById("month_pourcentage_amount").innerHTML = month_pourcentage_amount;
    document.getElementById("month_pourcentage_volume").innerHTML = month_pourcentage_volume;
    document.getElementById("month_pourcentage_cpt").innerHTML = month_pourcentage_cpt;

    document.getElementById("year_date").innerHTML = today_date.getFullYear();
    document.getElementById("year_amount").innerHTML = year_pourcentage_amount;
    document.getElementById("year_volume").innerHTML = year_pourcentage_volume;
    document.getElementById("year_cpt").innerHTML = year_pourcentage_cpt;

    document.getElementById("year_pourcentage_amount").innerHTML = year_pourcentage_amount;
    document.getElementById("year_pourcentage_volume").innerHTML = year_pourcentage_volume;
    document.getElementById("year_pourcentage_cpt").innerHTML = year_pourcentage_cpt;
}

function dispatcher(str){
    doSend(str);

    initialization();

    calculateLimit(str);
}

function whenDataReceived7(){
    if (isMax)
        calculateMax();

    rebuildDayTable();
    rebuildMonthTable();
    rebuildYearTable();

    if (aggregated_day_transactions.length == 0){
        alert("No data for this range");
        return;
    }
    calculateStats();

    // Show the chart div
    $('#chart').show();

    if (isBigDisplay)
        drawLineChartsMonths();
    else
        drawLineChartsDays();

    // Show the display_type div
    $('#display_type').show();

    // Show the stats div
    $('#stats').show();
}

function drawLineChartsDays() {
    var data = new Array();
    data.push( ['Day' , 'Amount' , 'Volume' , 'Number']);

    //console.log("rebuild_aggregated_day_transactions: "+rebuild_aggregated_day_transactions);

    // days_amount, days_volume, days_transactions_cpt have same length
    for (var i = 0 ; i < rebuild_aggregated_day_transactions.length ; ++i)
        data.push(     [ rebuild_aggregated_day_transactions[i][0].substring(6,8) + " " +
                         months_names[ parseInt(  rebuild_aggregated_day_transactions[i][0].substring(4,6) ) - 1 ] + " " +
                         rebuild_aggregated_day_transactions[i][0].substring(0,4) ,
                            parseInt(rebuild_aggregated_day_transactions[i][1]) ,
                            parseInt(rebuild_aggregated_day_transactions[i][2]) ,
                            parseInt(rebuild_aggregated_day_transactions[i][3]) ]);

    var table = google.visualization.arrayToDataTable(data);

    var options = {
        title: 'Transactions details per day'
    };

    var chart = new google.visualization.LineChart(document.getElementById("chart"));
    chart.draw(table, options);
}

function drawLineChartsMonths() {

    var data = new Array();
    data.push( ['Month' , 'Amount' , 'Volume' , 'Number']);

    // days_amount, days_volume, days_transactions_cpt have same length
    for (var i = 0 ; i < rebuild_aggregated_month_transactions.length ; ++i)
        data.push(     [ months_names[ parseInt(  rebuild_aggregated_month_transactions[i][0].substring(4,6) ) - 1 ] + " " +
                         rebuild_aggregated_month_transactions[i][0].substring(0,4) ,
                            parseInt(rebuild_aggregated_month_transactions[i][1]) ,
                            parseInt(rebuild_aggregated_month_transactions[i][2]) ,
                            parseInt(rebuild_aggregated_month_transactions[i][3]) ]);

    var table = google.visualization.arrayToDataTable(data);

    var options = {
        title: 'Transactions details per month'
    };

    var chart = new google.visualization.LineChart(document.getElementById("chart"));
    chart.draw(table, options);
}

function drawLineChartsYears() {
    var data = new Array();
    data.push( ['Year' , 'Amount' , 'Volume' , 'Number']);

    // days_amount, days_volume, days_transactions_cpt have same length
    for (var i = 0 ; i < rebuild_aggregated_year_transactions.length ; ++i)
        data.push(     [ rebuild_aggregated_year_transactions[i][0] ,
                            parseInt(rebuild_aggregated_year_transactions[i][1]) ,
                            parseInt(rebuild_aggregated_year_transactions[i][2]) ,
                            parseInt(rebuild_aggregated_year_transactions[i][3]) ]);

    var table = google.visualization.arrayToDataTable(data);

    var options = {
        title: 'Transactions details per year'
    };

    var chart = new google.visualization.LineChart(document.getElementById("chart"));
    chart.draw(table, options);
}

function addNumberDaysInMonth(month_number){
    if (isLeapYear(today_year))
        end_months[1] = 29;
    if ((today_month - month_number) == -1){
        today_month = 12;
        limit += end_months[today_month - 1];
        today_year = today_year - 1;
        if (isLeapYear(today_year))
            end_months[1] = 29;
    }
    else
        limit += end_months[today_month - month_number];
}

function addNumberDaysInYear(year){
    // today_month >= means that we are in March at least!!! 2 = march, 1 = february, 0 = january
    if(today_month >=2 && isLeapYear(year))
        limit += 366;
    else
        limit += 365;
}


function calculateLimit(str){
	limit = 0;

	if(str == '7D'){
		limit = 7;
        document.getElementById("button1").style.visibility="hidden";
        document.getElementById("button2").style.visibility="hidden";
        document.getElementById("button3").style.visibility="hidden";
    }
    else if (str == '14D'){
		limit = 14;
        document.getElementById("button1").style.visibility="hidden";
        document.getElementById("button2").style.visibility="hidden";
        document.getElementById("button3").style.visibility="hidden";
    }
    else if (str == '1M'){
		addNumberDaysInMonth(1);
        limit = limit + 1;
        document.getElementById("button1").style.visibility="hidden";
        document.getElementById("button2").style.visibility="hidden";
        document.getElementById("button3").style.visibility="hidden";
    }
    else if (str == '3M'){
		for (var i = 1 ; i <= 3 ; ++i)
			addNumberDaysInMonth(i);
        limit = limit + 1;
        document.getElementById("button1").style.visibility="visible";
        document.getElementById("button2").style.visibility="visible";
        document.getElementById("button3").style.visibility="hidden";
    }

    else if (str == '6M'){
		for (var i = 1 ; i <= 6 ; ++i)
			addNumberDaysInMonth(i);
        limit = limit + 1;
        document.getElementById("button1").style.visibility="visible";
        document.getElementById("button2").style.visibility="visible";
        document.getElementById("button3").style.visibility="hidden";
    }

    else if (str == '1Y'){
        addNumberDaysInYear(today_year);
        limit = limit + 1;
        document.getElementById("button1").style.visibility="visible";
        document.getElementById("button2").style.visibility="visible";
        document.getElementById("button3").style.visibility="hidden";
	}

    else if (str == '2Y'){
        for (var i = 0 ; i < 2 ; ++i){
            addNumberDaysInYear(today_year - i);
        }
        limit = limit + 1;
        document.getElementById("button1").style.visibility="hidden";
        document.getElementById("button2").style.visibility="visible";
        document.getElementById("button3").style.visibility="hidden";
        isBigDisplay = true;
	}
    else if (str == '5Y'){
		for (var i = 0 ; i < 5 ; ++i){
            addNumberDaysInYear(today_year - i);
        }
        limit = limit + 1;
        document.getElementById("button1").style.visibility="hidden";
        document.getElementById("button2").style.visibility="visible";
        document.getElementById("button3").style.visibility="visible";
        isBigDisplay = true;
	}
    else if (str == 'MAX'){
        // CALCULATE WILL BE MADE WHEN DATA RECEIVED
        isMax = true;
        document.getElementById("button1").style.visibility="hidden";
        document.getElementById("button2").style.visibility="visible";
        document.getElementById("button3").style.visibility="visible";
        isBigDisplay = true;
        return;
	}

	days_IDs_table = [limit-1];

    var tmp_date = today_date;

	for (var i = 0 ; i < limit ; ++i){
		days_IDs_table[limit-1-i] = fromDateToStr(tmp_date);
		tmp_date = new Date(tmp_date.getTime() - 86400000);
	}

    // WE ARE 1 DAY TOO FAR
    init_date = new Date(tmp_date.getTime() + 86400000);

    var start_month = init_date.getMonth();
    var start_year = init_date.getFullYear();

    // RE-INITIALIZE TODAY_MONTH and TODAY_YEAR
    // they were changed in addNumberDaysInYear and addNumberDaysInMonth
	today_month = today_date.getMonth();
	today_year = today_date.getFullYear();

    months_IDs_table = [];
	years_IDs_table = [];

    // ADD FIRST ELEMENT
    // FORMAT WITH 0
    if(start_month < 9)
        months_IDs_table.push(start_year.toString()+"0"+(start_month+1).toString());
    else
        months_IDs_table.push(start_year.toString()+(start_month+1).toString());

    years_IDs_table.push(start_year.toString());

    // ADD THE REST OF THE ELEMENTS
    while (today_month != start_month | today_year != start_year){
        start_month++;
        // MONTH ARE FROM 0 TO 11
        if (start_month == 12){
            start_month = 0;
            start_year++;
            years_IDs_table.push(start_year.toString());
        }
        // FORMAT WITH 0
        if(start_month < 9)
            months_IDs_table.push(start_year.toString()+"0"+(start_month+1).toString());
        else
            months_IDs_table.push(start_year.toString()+(start_month+1).toString());
    }
}