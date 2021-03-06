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
	
		// Array of deferred objects, this function is used later at $.when.all(data_file_get)...
	if (jQuery.when.all===undefined) {
		jQuery.when.all = function(deferreds) {
			var deferred = new jQuery.Deferred();
			$.when.apply(jQuery, deferreds).then(
				function() {
					deferred.resolve(Array.prototype.slice.call(arguments));
				},
				function() {
					deferred.fail(Array.prototype.slice.call(arguments));
				});

			return deferred;
		}
	}
	
	//http://benjaminkomen.github.io/graphs/ansys_full_coach_compare.html?name=3d_arch_nv_12_full_coach_all_dofs&fname0=ad1&fname1=a1i&coachnr=1
	//count how many fname parameters in url
	var url = window.location.href;
	var matches = url.match(/fname/gi);
	var count = matches? matches.length : 0;
	
	//location of data files
	var data_base_folder = 'ansys-data/';
	var data_sub_folder = getParameterByName('name'); //e.g.: 3d_arch_nv_12_full_coach_all_dofs
	var data_file_names = [];
	var fname;
	var coach = parseInt(getParameterByName("coachnr")); //e.g.: 1 
	var data_files = [];
	for (i=0;i<count;i++) {
		fname = 'fname' + i;
		data_file_names.push(getParameterByName(fname));	//e.g.: ad1
		data_files.push(data_base_folder + data_sub_folder + '/' + data_file_names[i] + '.txt'); //array with full links of text files
		}
	data_file_names_string = data_file_names.toString();
	$("h2#title").html('Compare Ansys runs in: ' + data_sub_folder);
	
	//start to process data_files
	var data_file = data_files[0];
	var container = 'container0';
	//create options variable
	var options = {
		chart: {
			renderTo: container,
			type:'line',
			zoomType: 'x'
		},
		title: {
			text: 'Degrees of Freedom ' + data_file_names_string
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
				text: 'acceleration [m/s2]'
			}
		},
		series : []
	};
	
	//Load any number of extra files
	var data_file_get = [];
	for (i=0;i<count;i++) {
		data_file_get[i] = $.get(data_files[i]);
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
		//do the following stuff for every file to compare, k is the amount of files, e.g. if comparing fname0 and fname1 than k = 2
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
					//options.yAxis.title.text = $.trim(items[1]);
				}
				// third line contains graph title
				else if (lineNo == 2) {
					var items = line.split(':');
					//extract graph title from input and add to graph
					//options.title.text = $.trim(items[1]);
				}
				// fourth line containes categories, put in input_categories array
				else if (lineNo == 3) {
					var items = line.split(',');
					$.each(items, function(itemNo, item) {
						//check if item exists and not an empty space after the last comma
						if($.trim(item)) {
							//if no specific bogie number is defined, all coach should be plotted
							if(!coach) {
								input_categories.push($.trim(item));
							//now only push the requested bogie number to the input_categories
							} else {
								if(itemNo+1 == coach) { //coach start counting at 1, item numbers at 0
									input_categories.push($.trim(item));
								}
							}
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
								if(!coach) {
									var cat_nr = iterate_start + itemNo;
									options.series[cat_nr].data.push(parseFloat(item));
								} else {
									if(itemNo+1 == coach) {
										options.series[k].data.push(parseFloat(item)); //put in k-th series
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