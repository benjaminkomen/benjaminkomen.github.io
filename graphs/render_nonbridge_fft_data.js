/* Name:			render_nonbridge_fft_data
 * Date: 			
 * Last modified:	March 28, 2016
 * Description:		Make 2 graphs with nonbridge experiment data and fft of it
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
	//location of data files
	var data_sub_folder = getParameterByName('name');
	var data_base_folder = 'http://homepage.tudelft.nl/u04r0/thesis/experiment-data/';
	$("h2#title").html('Folder: ' + data_sub_folder + ' plot + fast fourier transform');
	var data_files = [];
	var graph_name = [data_sub_folder, data_sub_folder + '_fft'];
	var xAxis_label = ['Time [s]', 'Frequency [Hz]'];
	var yAxis_label = ['Acceleration [m/s2]', 'Single sided amplitude spectrum |P1(f)| [m/s2]']
	data_files.push(data_base_folder + data_sub_folder + '/' + 'full.txt');
	data_files.push(data_base_folder + data_sub_folder + '/fft/' + 'full.txt');
	
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
					text: xAxis_label[fileNo]
				},
				//categories: [],
				startOnTick: true,
				endOnTick: true,
				showLastLabel: true
			},
			yAxis: {
				title: {
					text: yAxis_label[fileNo]
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
			if(fileNo == 0) {
				$.each(lines, function(lineNo, line) {
					//exclude empty lines
					if (line != "") {
						var items = line.split(';');
						time_entry = parseFloat(items[0].replace(',','.'));
						data_entry = parseFloat(items[1].replace(',','.'));
						options.series[0].data.push([time_entry, data_entry]);
					}
				});
			} else {
				$.each(lines, function(lineNo, line) {
					//exclude first and empty lines
					if (line != "" && lineNo != 0) {
						var items = line.split(',');
						freq_entry = parseFloat(items[0]);
						ampl_entry = parseFloat(items[1]);
						options.series[0].data.push([freq_entry, ampl_entry]);
					}
				});
			}
			console.log(options.series);
			var chart = new Highcharts.Chart(options);
			},
		"text");
	});
});