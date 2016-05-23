/* Name:			render_ansys_full_coach_compare_data
 * Date: 			May 23, 2016
 * Last modified:	May 23, 2016
 * Description:		Make one graph with comparison of ansys output data
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
	//http://benjaminkomen.github.io/graphs/ansys_full_coach_compare.html?name=3d_arch_nv_12_full_coach_all_dofs&fname0=ad1&fname1=a1i&bogienr=1
	//count how many fname parameters in url
	var url = window.location.href;
	var matches = url.match(/fname/gi);
	var count = matches? matches.length : 0;
	
	//location of data files
	var data_base_folder = 'ansys-data/';
	var data_sub_folder = getParameterByName('name'); //e.g.: 3d_arch_nv_12_full_coach_all_dofs
	var data_file_names = [];
	var fname;
	var bogies = parseInt(getParameterByName("bogienr")); //e.g.: 1 
	var data_files = [];
	for (i=0;i<count;i++) {
		fname = 'fname' + i;
		data_file_names.push(getParameterByName(fname));	//e.g.: ad1
		data_files.push(data_base_folder + data_sub_folder + '/' + data_file_names[i] + '.txt');
		}
	$("h2#title").html('Folder: ' + data_sub_folder);
	
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
		
		//Load any number of extra files
		var data_file_get = [];
		for (i=0;i<count;i++) {
			data_file_get[i] = $.get(data_files[i][fileNo]);
		}
		
		//when all data files are loaded, continue
		$.when.all(data_file_get).done(function(schemas) {
			// Split the lines
			var lines = [];
			//for each data file, extract the lines and split by linebreak
			$.each(schemas, function(schemaNo, schema) {
				lines[schemaNo] = schema[0].split('\n');
			});
			
			//define array with input categories
			var input_categories = [];
			var timestep = '';
			var iterate_start = 0;
			//do the following stuff for every file to compare, k is the amount of files, e.g. if comparing name0 and name1 than k = 2
			for (k=0;k<count;k++) {
			// Iterate over the ansys lines and add categories or series
				$.each(lines[k], function(lineNo, line) {
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
								//if no specific bogie number is defined, all bogies should be plotted
								if(!bogies) {
									input_categories.push($.trim(item));
								//now only push the requested bogie number to the input_categories
								} else {
									if(itemNo+1 == bogies) {
										input_categories.push($.trim(item));
									}
								}
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
									if(!bogies) {
										options.series[itemNo].data.push(parseFloat(item));
									} else {
										if(itemNo+1 == bogies) {
											options.series[itemNo].data.push(parseFloat(item));
										}
									}
								}
							});
						}
					}
				});
				iterate_start = options.series.length;
			}
			console.log(options.series);
			var chart = new Highcharts.Chart(options);
			},
		"text");
	});
});