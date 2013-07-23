var range_choice ;

function initVisu8(){
    limit = 0;
    range_choice = 1;
    doSend("MAX");
}

function whenDataReceived8(){
    hasReceivedHistoricalDataVisu8 = true;
    
    calculateMax();

    rebuildDayTable();
    rebuildMonthTable();
    rebuildYearTable();

    drawVisualization8();
}

function rangeChoice(choice){
    range_choice = choice;
    drawVisualization8();
}

function drawVisualization8() {
    var dashboard = new google.visualization.Dashboard(document.getElementById("dashboard"));

    var data = new google.visualization.DataTable();
    
    data.addColumn('date', 'Day');
    data.addColumn('number', 'Amount');
    data.addColumn('number', 'Volume');
    data.addColumn('number', 'Number');

    var maximum;

    if(range_choice == 1){
        for (var i = 0 ; i < rebuild_aggregated_day_transactions.length ; ++i)
            data.addRow(     [ new Date(parseInt(rebuild_aggregated_day_transactions[i][0].substring(0,4)),
									parseInt(rebuild_aggregated_day_transactions[i][0].substring(4,6)) - 1,
									parseInt(rebuild_aggregated_day_transactions[i][0].substring(6,8))) ,
                                    parseInt(rebuild_aggregated_day_transactions[i][1]) ,
                                    parseInt(rebuild_aggregated_day_transactions[i][2]) ,
                                    parseInt(rebuild_aggregated_day_transactions[i][3]) ]);
    }
    else if(range_choice == 2){
        for (var i = 0 ; i < rebuild_aggregated_month_transactions.length ; ++i)
            data.addRow(     [ new Date(parseInt(rebuild_aggregated_month_transactions[i][0].substring(0,4)),
									parseInt(rebuild_aggregated_month_transactions[i][0].substring(4,6)) - 1,
									1) ,
                                        parseInt(rebuild_aggregated_month_transactions[i][1]) ,
                                        parseInt(rebuild_aggregated_month_transactions[i][2]) ,
                                        parseInt(rebuild_aggregated_month_transactions[i][3]) ]);
    }
    else if(range_choice == 3){
        for (var i = 0 ; i < rebuild_aggregated_year_transactions.length ; ++i)
            data.addRow(     [ new Date(parseInt(rebuild_aggregated_year_transactions[i][0].substring(0,4)),
									0,
									1) ,
                                        parseInt(rebuild_aggregated_year_transactions[i][1]) ,
                                        parseInt(rebuild_aggregated_year_transactions[i][2]) ,
                                        parseInt(rebuild_aggregated_year_transactions[i][3]) ]);
    }

    var control = new google.visualization.ControlWrapper({
     'controlType': 'ChartRangeFilter',
     'containerId': 'dash_control',
     'options': {
       // Filter by the date axis.
       'filterColumnIndex': 0,
       'ui': {
         'chartType': 'LineChart',
         'chartOptions': {
           'chartArea': {'width': '90%'},
           'hAxis': {'baselineColor': 'none'}
         },
         // Display a single series that shows the closing value of the stock.
         // Thus, this view has two columns: the date (axis) and the stock value (line series).
         'chartView': {
           'columns': [0, 3]
         },
         // 1 day in milliseconds = 24 * 60 * 60 * 1000 = 86,400,000
         'minRangeSize': 86400000
       }
     },
     // Initial range: init_date to today_date
     'state': {'range': {'start': init_date,
                           'end': today_date}}
    });
    
    var chart = new google.visualization.ChartWrapper({
        'chartType': 'LineChart',
        'containerId': 'dash_chart',
        'options': {
            // Use the same chart area width as the control for axis alignment.
            'chartArea': {'height': '70%', 'width': '90%'},
            'hAxis': {'slantedText': true},
            //'vAxis': {'viewWindow': {'min': 0, 'max': maximum}},
            'legend': {'position': 'in'}
        },
        // Convert the first column from 'date' to 'string'.
        'view': {
            'columns': [
                {
                    'calc': function(dataTable, rowIndex) {
                        return dataTable.getFormattedValue(rowIndex, 0);
                    },
                    'type': 'string'
                }, 1, 2, 3]
        }
    });
    dashboard.bind(control, chart);
    dashboard.draw(data);
}