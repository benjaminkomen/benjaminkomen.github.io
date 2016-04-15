/* Name:			render_ansys_compare_data
 * Date: 			April 15, 2016
 * Last modified:	April 15, 2016
 * Description:		Make 4 graphs with comparison between multiple ansys datasets
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
	
	//count how many parameters in url
	var url = window.location.href;
	var matches = url.match(/[a-z\d]+=[a-z\d]+/gi);
	var count = matches? matches.length : 0;
	
	//define input parameters
	var ansys_base_folder = 'ansys-data/';
	var ansys_sub_folder = [];
	var name;
	var data_files = {};
	var data_file = [];
	for (i=0;i<count;i++) {
		name = 'name' + i;
		ansys_sub_folder.push(getParameterByName(name));	//add to array
		data_files[i] = [];
		data_file.push('data_file' + i);
		for (j=0;j<4;j++) {
			data_files[i].push(ansys_base_folder + ansys_sub_folder[i] + '/' + j + '.txt');
		}
	}
	console.log(data_files);
	var ansys_title = ansys_sub_folder.toString();
	$("h2#title").html('Compare Ansys runs: ' + ansys_title);
	
	
	//loop through ansys data files and preprocess data to plot graph
	$.each(data_files[0], function(fileNo, data_file0) {
		var container = 'container' + fileNo;
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
		//var data_file_get = [];
		//for (i=1;i<count;i++) {
		//	data_file_get = data_files[i][fileNo];
		//}
		var d0 = $.get(data_files[0][fileNo]);		//get ansys data file
		var d1 = $.get(data_files[1][fileNo]);		//get ansys data file
		var d2 = $.get(data_files[2][fileNo]);		//get ansys data file

		$.when(d0, d1, d2).done(function(data0, data1, data2) {
			// Split the lines
			var lines0 = data0[0].split('\n');
			var lines1 = data1[0].split('\n');
			var lines2 = data2[0].split('\n');
			//define array with input categories
			var input_categories = [];
			var timestep = '';
			
			// Iterate over the ansys lines and add categories or series
			$.each(lines1, function(lineNo, line) {
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
							if(!isNaN(item) && $.trim(item)) {
								options.series[itemNo].data.push(parseFloat(item));
							}
						});
					}
				}
			});
			var iterate_start = options.series.length;
			// Iterate over the matlab lines
			$.each(lines2, function(lineNo, line) {
				// first line contains time
				if (lineNo == 0) {
					var items = line.split(':');
					//extract timestep from input
					timestep = +(Math.round(parseFloat($.trim(items[1])) + "e+4")  + "e-4");
				}
				// second line contains yAxislabel, but we assume it is already defined
				else if (lineNo == 1) {
					//
				}
				// third line contains graph title, but we assume it is already defined
				else if (lineNo == 2) {
					//
				}
				// fourth line contains input_categories
				else if (lineNo == 3) {
					var items = line.split(',');
					$.each(items, function(itemNo, item) {
						//check if item exists and not an empty space after the last comma
						if($.trim(item)) {
							input_categories.push($.trim(item));
						}
					});
					//create an object for every input_category in the series array
					for (i=iterate_start;i<input_categories.length;i++) {
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
							if(!isNaN(item) && $.trim(item)) {
								var cat_nr = iterate_start + itemNo;
								//console.log('itemNo is: ' + itemNo + ', but I put data in: ' + cat_nr);
								//console.log('catnr is: ' + cat_nr + ' and I submit item: ' + item);
								options.series[cat_nr].data.push(parseFloat(item));
							}
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