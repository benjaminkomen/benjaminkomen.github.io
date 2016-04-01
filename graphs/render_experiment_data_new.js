$(document).ready(function() {
	//define function to read url parameters
	function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    url = url.toLowerCase(); // This is just to avoid case sensitiveness  
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
	//location of data files
	//check if a specific plot is requested
	if (getParameterByName('name')) {
		var data_sub_folder = getParameterByName('name');
		var data_base_folder = 'http://homepage.tudelft.nl/u04r0/thesis/experiment-data/';
		$("h2#title").html('Folder: ' + data_sub_folder);
		var data_files = [];
		var graph_name = [data_sub_folder];
		data_files.push(data_base_folder + data_sub_folder + '/' + 'full.txt');
		data_files.push(data_base_folder + data_sub_folder + '/fft/' + 'full.txt');
		var start_time = [0];
		var end_time = [1000];
	//if not, show the 8 graphs of the experiment
	} else { 
		var data_base_folder = 'http://homepage.tudelft.nl/u04r0/thesis/experiment-data/full/';
		$("h2#title").html('Kuilenburgse spoorbrug measurements March 24, 2016');
		var data_files = [];
		var graph_name = [];
		for (i=1;i<9;i++) {
			data_files.push(data_base_folder + 'trip_' + i + '.txt');
			graph_name.push('trip_' + i);
		}
		//start and end time
		var start_time = [17.19,28.18,25.07,28.48,39.14,10.99,31.89,6.30];
		var end_time   = [23.44,34.43,31.34,33.95,43.84,16.47,38.30,12.63];
	}
	
	//loop through data files and preprocess data to plot graph
	$.each(data_files, function(fileNo, data_file) {
		var options = 'options' + fileNo;
		var container = 'container' + fileNo;
		var chart = 'chart' + fileNo;
		
		//create options variable
		var options = {
			chart: {
				renderTo: container,
				type:'line',
				zoomType: 'x'
			},
			title: {
				text: graph_name[fileNo]
			},
			subtitle: {
					text: document.ontouchstart === undefined ?
							'Click and drag in the plot area to zoom in' : 'Pinch the chart to zoom in'
			},
			tooltip: {
				positioner: function () {
					return { x: 80, y: 50 };
				},
				valueDecimals: 5,
				shadow: false,
				borderWidth: 0,
				backgroundColor: 'rgba(255,255,255,0.8)'
			},
			xAxis: {
				title: {
					enabled: true,
					text: 'Time [s] or Frequency [Hz]'
				},
				//categories: [],
				startOnTick: true,
				endOnTick: true,
				showLastLabel: true
			},
			yAxis: {
				title: {
					text: 'Acceleration [m/s2]'
				}
			},
			series: []
		};
	
		//Load the data file and add correct data items to array
		$.get(data_file, function(data) {
			// Split the lines
			var lines = data.split('\n');
			
			//create object structure for data series
			options.series.push({
				name: graph_name[fileNo],
				data: []
			});
			//color bridge part different
			options.series[0].zoneAxis = "x";
			options.series[0].zones = [{
                value: start_time[fileNo],
                color: '#f7a35c'
            }, {
                value: end_time[fileNo],
                color: '#7cb5ec'
            }, {
                value: 1000,
                color: '#f7a35c'
            }];
			
			// Iterate over the lines and add to series
			$.each(lines, function(lineNo, line) {
				//exclude empty lines
				if (line != "") {
					var items = line.split(';');
					time_entry = parseFloat(items[0].replace(',','.'));
					data_entry = parseFloat(items[1].replace(',','.'));
					options.series[0].data.push([time_entry, data_entry]);
				}
			});
			console.log(options.series);
			var chart = new Highcharts.Chart(options);
			},
		"text");
	});
});