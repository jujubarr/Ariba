/*
 * Function to convert from Date to String
 */
function fromDateToStr (date){
    var str = "";

    var year = date.getFullYear();
    str += year.toString();

    var month = date.getMonth()+1; // Month starts at 0
    if (month < 10)
        str += "0"+month.toString();
                else
        str += month.toString();

    var day = date.getDate();
    if (day < 10)
        str += "0"+day.toString();
                else
        str += day.toString();

    return str;
}

/*
 * Function to say if the year is 
 */
function isLeapYear(year){
    return (year % 4 == 0 && year % 100 != 0 ||  year % 400 == 0);
}

/*
 * Function to convert from String to Date
 */
function fromStrToDate (str){
    var day = str.substring(6,8);
    var month = str.substring(4,6);
    var year = str.substring(0,4);

    // Month starts at 0
    return new Date(year,month-1,day);
}

/*
 * Function that fills   days_IDs_table
 *                     months_IDs_table
 *                      years_IDs_table
 * and calculte init_date with the aggregated_day_transactions[0][0] element
 * when choice is 'MAX'
 */
function calculateMax(){
    days_IDs_table = [];
    months_IDs_table = [];
    years_IDs_table = [];

    init_date = new Date(parseInt(aggregated_day_transactions[0][0].substring(0,4)),
                        parseInt(aggregated_day_transactions[0][0].substring(4,6)) - 1,
                        parseInt(aggregated_day_transactions[0][0].substring(6,8)) );

    limit = parseInt((today_date - init_date)/(86400000))+1;

    // Filling days_IDs_table
    var tmp_date = today_date;

    for (var i = 0 ; i < limit ; ++i){
        days_IDs_table[limit-1-i] = fromDateToStr(tmp_date);
        tmp_date = new Date(tmp_date.getTime() - 86400000);
    }

    var start_month = init_date.getMonth();
    var start_year = init_date.getFullYear();

    // Filling months_IDs_table
    // Filling years_IDs_table

    // Put the first element of months_IDs_table
    if(start_month < 9)
        months_IDs_table.push(start_year.toString()+"0"+(start_month+1).toString());
    else
        months_IDs_table.push(start_year.toString()+(start_month+1).toString());

    // Put the first element of years_IDs_table
    years_IDs_table.push(start_year.toString());

    // Put the rest
    while (today_month != start_month | today_year != start_year){
        start_month++;
        if (start_month == 12){
            start_month = 0;
            start_year++;
            years_IDs_table.push(start_year.toString());
            }
        if(start_month < 9)
            months_IDs_table.push(start_year.toString()+"0"+(start_month+1).toString());
        else
            months_IDs_table.push(start_year.toString()+(start_month+1).toString());
    }
}

/*
 * Function that rebuild from aggregated_day_transactions to rebuild_aggregated_day_transactions
 * Filling with zeros when no data for this day was received
 */
function rebuildDayTable(){
    rebuild_aggregated_day_transactions = new Array(days_IDs_table.length);

    // FILLING
    for (var i = 0 ; i < rebuild_aggregated_day_transactions.length ; ++i){
        rebuild_aggregated_day_transactions[i] = new Array(3);
        rebuild_aggregated_day_transactions[i][0] = days_IDs_table[i];
        rebuild_aggregated_day_transactions[i][1] = 0;
        rebuild_aggregated_day_transactions[i][2] = 0;
        rebuild_aggregated_day_transactions[i][3] = 0;
    }

	if (days_IDs_table.length >= aggregated_day_transactions.length){
		var j = 0;
		for (var i = 0 ; i < days_IDs_table.length ; ++i){
			if(j < aggregated_day_transactions.length){
				if (days_IDs_table[i] == aggregated_day_transactions[j][0]){
					rebuild_aggregated_day_transactions[i][0] = aggregated_day_transactions[j][0];
					rebuild_aggregated_day_transactions[i][1] = aggregated_day_transactions[j][1];
					rebuild_aggregated_day_transactions[i][2] = aggregated_day_transactions[j][2];
					rebuild_aggregated_day_transactions[i][3] = aggregated_day_transactions[j][3];
					j++;
				}
			}
		}
	}
    else{
        console.log("Error in aggregated_day_transactions table.");
    }
}

/*
 * Function that rebuild from aggregated_month_transactions to rebuild_aggregated_month_transactions
 * Filling with zeros when no data for this month was received
 */
function rebuildMonthTable(){
    rebuild_aggregated_month_transactions = new Array(months_IDs_table.length);

    // FILLING
    for (var i = 0 ; i < rebuild_aggregated_month_transactions.length ; ++i){
        rebuild_aggregated_month_transactions[i] = new Array(3);
        rebuild_aggregated_month_transactions[i][0] = months_IDs_table[i];
        rebuild_aggregated_month_transactions[i][1] = 0;
        rebuild_aggregated_month_transactions[i][2] = 0;
        rebuild_aggregated_month_transactions[i][3] = 0;
    }
    
	if (months_IDs_table.length >= aggregated_month_transactions.length){
		var j = 0;
		for (var i = 0 ; i < months_IDs_table.length ; ++i){
			if(j < aggregated_month_transactions.length){
				if (months_IDs_table[i] == aggregated_month_transactions[j][0]){
					rebuild_aggregated_month_transactions[i][0] = aggregated_month_transactions[j][0];
					rebuild_aggregated_month_transactions[i][1] = aggregated_month_transactions[j][1];
					rebuild_aggregated_month_transactions[i][2] = aggregated_month_transactions[j][2];
					rebuild_aggregated_month_transactions[i][3] = aggregated_month_transactions[j][3];
					j++;
				}
			}
		}
	}
    else{
        console.log("Error in aggregated_month_transactions table.");
    }
}

/*
 * Function that rebuild from aggregated_year_transactions to rebuild_aggregated_year_transactions
 * Filling with zeros when no data for this year was received
 */
function rebuildYearTable(){
    rebuild_aggregated_year_transactions = new Array(years_IDs_table.length);

    // FILLING
    for (var i = 0 ; i < rebuild_aggregated_year_transactions.length ; ++i){
        rebuild_aggregated_year_transactions[i] = new Array(3);
        rebuild_aggregated_year_transactions[i][0] = years_IDs_table[i];
        rebuild_aggregated_year_transactions[i][1] = 0;
        rebuild_aggregated_year_transactions[i][2] = 0;
        rebuild_aggregated_year_transactions[i][3] = 0;
    }

	if (years_IDs_table.length >= aggregated_year_transactions.length){
		var j = 0;
		for (var i = 0 ; i < years_IDs_table.length ; ++i){
			if(j < aggregated_year_transactions.length){
				if (years_IDs_table[i] == aggregated_year_transactions[j][0]){
					rebuild_aggregated_year_transactions[i][0] = aggregated_year_transactions[j][0];
					rebuild_aggregated_year_transactions[i][1] = aggregated_year_transactions[j][1];
					rebuild_aggregated_year_transactions[i][2] = aggregated_year_transactions[j][2];
					rebuild_aggregated_year_transactions[i][3] = aggregated_year_transactions[j][3];
					j++;
				}
			}
		}
	}
    else{
        console.log("Error in aggregated_year_transactions table.");
    }
}