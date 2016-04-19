/* Name:			render_matlab_ansys_fft_data
 * Date: 			April 1, 2016
 * Last modified:	April 1, 2016
 * Description:		Make 2 graphs with ansys/matlab data and fft of it below
 */
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
	
	//define function to check if file exists
	function checkExists(url_input) {
		$.ajax({
		url:url_input,
		type:'HEAD',
		error: function()
		{
			//file not exists
			return 0;
		},
		success: function()
		{
			//file exists
			return 1;
		}
		});
	}
	
	//location of data files
	var data_sub_folder = getParameterByName('folder');
	var data_file_name = getParameterByName('file');
	var data_base_folders = ['matlab-data/', 'ansys-data/'];
	$("h2#title").html('Folder: ' + data_sub_folder + ' file: ' + data_file_name + ' time history and fast fourier transform');
	var data_files1 = [];
	var data_files2 = [];
	var graph_name = [data_sub_folder, data_sub_folder + '_fft'];
	var xAxis_label = ['Time [s]', 'Frequency [Hz]'];
	var yAxis_label = ['', '|P1(f)|']
	//first check if file exists, then push it to array to be obtained later
	$.each(data_base_folders, function(fileNo, data_base_folder) {
		var url_data = data_base_folder + data_sub_folder + '/' + data_file_name + '.txt';
		var url_fft = data_base_folder + data_sub_folder + '/fft/' + data_file_name + '.txt';
		if (checkExists(url_data == 1) { data_files1.push(url_data); }
		if (checkExists(url_data == 1) { data_files2.push(url_fft); }
	});
	
	//loop through matlabs/ansys data files and preprocess data to plot graph
	$.each(data_files1, function(fileNo, data_file) {
		var container = 'container0';
		
		//create options variable
		var options = {
			chart: {
				renderTo: container,
				type:'line',
				zoomType: 'x'
			},
			title: {
				text: ''
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
					text: 'Time [s]'
				},
				categories: [],
				startOnTick: true,
				endOnTick: true,
				showLastLabel: true
			},
			yAxis: {
				title: {
					text: ''
				}
			},
			series : []
		};
	
		//Load the data file and add correct data items to array
		$.get(data_file, function(data) {
			// Split the lines
			var lines = data.split('\n');
			
			//define array with input categories
			var input_categories = [];
			var timestep = '';
			
			// Iterate over the lines and add categories or series
			$.each(lines, function(lineNo, line) {
				// first line contains time
				if (lineNo == 0) {
					var items = line.split(':');
					//extract timestep from input
					timestep = +(Math.round(parseFloat($.trim(items[1])) + "e+4")  + "e-4");
				}
				// second line contains yAxislabel
				else if (lineNo == 1) {
					var items = line.split(':');
					//extract yAxislabel from input and add to graph
					options.yAxis.title.text = $.trim(items[1]);
				}
				// third line contains graph title
				else if (lineNo == 2) {
					var items = line.split(':');
					//extract graph title from input and add to graph
					options.title.text = $.trim(items[1]);
				}
				// fourth line containes categories, put in input_categories array
				else if (lineNo == 3) {
					var items = line.split(',');
					$.each(items, function(itemNo, item) {
						//check if item exists and not an empty space after the last comma
						if($.trim(item)) {
							input_categories.push($.trim(item));
						}
					});
					//create an object for every input_category in the series array
					for (i=0;i<input_categories.length;i++) {
						options.series.push({
							name: input_categories[i],
							data: []
						})
						//put timestep as pointInterval for every input_category
						options.series[i].pointInterval = timestep;
					}
				}
				// the rest of the lines contain data, put them in series
				else {
					//exclude last empty line
					if (line != "") {
						var items = line.split(',');
						$.each(items, function(itemNo, item) {
							//check if item exists and is a number
							if(!isNaN(item) && $.trim(item)) {options.series[itemNo].data.push(parseFloat(item)); }
						});
					}
				}
			});
			console.log(options.series);
			var chart = new Highcharts.Chart(options);
			},
		"text");
	});
	
	//loop through fft data files and preprocess data to plot graph
	$.each(data_files2, function(fileNo, data_file) {
		var container = 'container1';
		
		//create options variable
		var options = {
			chart: {
				renderTo: container,
				type:'line',
				zoomType: 'x'
			},
			title: {
				text: graph_name[1]
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
					text: xAxis_label[1]
				},
				//categories: [],
				startOnTick: true,
				endOnTick: true,
				showLastLabel: true
			},
			yAxis: {
				title: {
					text: yAxis_label[1]
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
			
			// Iterate over the lines and add to series
			$.each(lines, function(lineNo, line) {
				//exclude first and empty lines
				if (line != "" && lineNo != 0) {
					var items = line.split(',');
					freq_entry = parseFloat(items[0]);
					ampl_entry = parseFloat(items[1]);
					options.series[0].data.push([freq_entry, ampl_entry]);
				}
			});
			console.log(options.series);
			var chart = new Highcharts.Chart(options);
			},
		"text");
	});
});