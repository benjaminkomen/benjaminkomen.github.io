/* Name:			render_ansys_full_coach_data
 * Date: 			May 23, 2016
 * Last modified:	May 23, 2016
 * Description:		Make eight graphs of ansys output data a1i, a2i, ad1, ad2, af1, af2, am, ar
 */
$(document).ready(function() {
	//define function to read url parameters
	function getParameterByName(name, url) {
		if (!url) url = window.location.href;
		url = url.toLowerCase(); // This is just to avoid case sensitiveness
		if (name !== "" && name !== null && name != undefined) {
			name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
			var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) return null;
			if (!results[2]) return '';
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		} else {
			var arr = location.href.split("/");
			return arr[arr.length - 1];
		}
	}
	
	//location of data files
	var data_base_folder = 'ansys-data/';
	var data_sub_folder = getParameterByName('name');
	$("h2#title").html('Folder: ' + data_sub_folder);
	var data_files = [];
	var file_names = ['af1', 'ad1', 'a1i', 'am', 'ar', 'af2', 'ad2', 'a2i'];
	$.each(file_names, function(fileNo, file_name) {
		data_files.push(data_base_folder + data_sub_folder + '/' + file_name + '.txt');
	});
	
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
		console.log(data_file);
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
});