////////////////////////////////////
//		Initialization
////////////////////////////////////
var grid_data = [];
var algo_data = [];
var modified_grid_data;
var initial_num_robot = 2;


////////////////////////////////////
//		Global Function
////////////////////////////////////
function Createtable(data,location) {
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	var col = [];
	var new_col = [];
	for(var i=0; i<data.length; i++) {
		for(var key in data[i]) {
			if(col.indexOf(key) === -1) {
				col.push(key);
			}
		}
	}
	delete col['grid_id'];
	delete col['supervisor_id']

	new_col.push("Depth","Length","Width","Input Port Location","Output Port Location");

	var table = document.createElement("table");	//dynamic table

	var tr = table.insertRow(-1);		//insert new row

	for(var i=0 ; i < new_col.length; i++) {
		var th = document.createElement("th");
		th.innerHTML = new_col[i];
		tr.appendChild(th);
	}

	for(var i=0 ; i < data.length; i++) {
		if(supervisor_id == data[i].supervisor_id){
			tr = table.insertRow(-1);
			for(var j = 0 ; j < new_col.length; j++) {
				var cell = tr.insertCell(-1);
				cell.innerHTML = data[i][col[j]];				
			}		
		}

	}
	console.log(table)

	var container = document.getElementById(location);
		console.log(container)
	container.appendChild(table);
}

////////////////////////////////////
//		Initial Variable From DB
////////////////////////////////////

function get_initial_data() {
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	// get grid data
	$.ajax({
    type: 'GET',
    url: "http://localhost:3031/test/getallgriddata/" ,
    async :  false,

    success: function(data){
			console.log(data)
			grid_data = data;
			modified_grid_data = data;

			for(var i=0; i<modified_grid_data.length; i++) {
				delete modified_grid_data[i]['grid_id'];
			}

			Createtable(modified_grid_data,"current_grid_setting")

			for(var i=0; i<data.length; i++) {
				if(data[i].supervisor_id == supervisor_id) {
					grid_data = data[i];
				}
			}
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
      alert("error get");
    } 
  });

 	$.ajax({
    type: 'GET',
    url: "http://localhost:3031/test/getallalgodata/",
    async :  false,

    success: function(data){
			for(var i=0; i<data.length; i++) {
				if(data[i].supervisor_id == supervisor_id) {
					algo_data.push(data[i]);
				}
			} 
			console.log(algo_data)
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
      alert("error get");
    } 
  });
}


////////////////////////////////////
//		Function
////////////////////////////////////
function remove_duplicate(array) {
	let uniqueChars = [];
	array.forEach((c) => {
	    if (!uniqueChars.includes(c)) {
	        uniqueChars.push(c);
	    }
	});

	uniqueChars.sort(function(a, b){return a - b});

	return uniqueChars;
}

function change_grid_size(event) {
	event.preventDefault();

	var specific_grid_info;
	var agv_pos = [];
	var input = true;
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	var selected_grid_length = event.target['grid_length_input'].value;
	var selected_grid_width = event.target['grid_width_input'].value;
	var selected_grid_depth = event.target['grid_depth_input'].value;

	if(selected_grid_length > 10 || selected_grid_length < 1) {
		alert("the value of grid length must be between 1 to 10");
		input = false;
		location.reload();
	}	
	else if(selected_grid_width > 10 || selected_grid_width < 1) {
		alert("the value of grid width must be between 1 to 10");
		input = false;
		location.reload();
	}
	else if(selected_grid_depth > 5 || selected_grid_depth < 1) {
		alert("the value of grid depth must be between 1 to 5");
		input = false;
		location.reload();		
	}
	else if(selected_grid_length < selected_grid_depth && selected_grid_width < selected_grid_depth) {
		alert("Either the number of grid width or grid length need to be larger or equal than the number of grid depth");
		input = false;
		location.reload();			
	}

	var input_port_location = 1;
	var output_port_location = selected_grid_length*selected_grid_width;

	if(input) {
		$.ajax({
	    type: 'POST',
	    url: 'http://localhost:3031/test/updategriddata',
	    data: {
	      grid_depth : selected_grid_depth, 
	      grid_length : selected_grid_length,
	      grid_width : selected_grid_width,
	      input_port_location : input_port_location,
	      output_port_location : output_port_location,
	      supervisor_id : supervisor_id,
	    },
	    success: function(data){
	      alert("The grid size is changed successfully")
	    },
	    error: function(jqXHR, textStatus, errorThrown) {
	    	console.log(jqXHR);
	      console.log(textStatus, errorThrown);
	      //alert("error post");
	    } 
	 	});	

		for(var i=0; i<initial_num_robot; i++) {
			if(i == 0) {
				agv_pos.push((grid_data.grid_length*2)-1);
			}
			else if(i==1) {
				agv_pos.push(grid_data.grid_length*(grid_data.grid_width-1)-1);
			}
		}

		for(var i=0; i<initial_num_robot; i++) {
			$.ajax({
		    type: 'POST',
		    url: "http://localhost:3031/test/updateagvdata" ,   
		    data: {
					agv_id : i+1,
					current_pos : agv_pos[i],
		    },
		    success: function(data){
		      console.log("success post");
		    },
		    error: function(jqXHR, textStatus, errorThrown) {
		      console.log(textStatus, errorThrown);
		      alert("error post");
		    } 
		  });	
		}
	}

	location.reload();
	build_pallets();
}

function change_port() {
	var all_node = create_grid("all_node");
	
	var input_option = [];
	var output_option = [];

	var num_of_rows_of_pallets = grid_data.grid_length;
	var num_of_columns_of_pallets = grid_data.grid_width;
	
	for(var i=0; i<all_node.length; i++) {
		if(all_node[i].x == 0 || all_node[i].x == num_of_columns_of_pallets-1) {
			input_option.push(all_node[i].id)
		}
		else if(all_node[i].y == 0 || all_node[i].y == num_of_rows_of_pallets-1) {
			input_option.push(all_node[i].id)
		}
	}

	input_option = remove_duplicate(input_option);

	for(var i=0; i<input_option.length; i++){
		var option = document.createElement('option');
		option.innerHTML = input_option[i];

		document.getElementById("input_port_select").appendChild(option); 		
	}

	for(var i=0; i<all_node.length; i++) {
		if(all_node[i].x == 0 || all_node[i].x == num_of_columns_of_pallets-1) {
			output_option.push(all_node[i].id)
		}
		else if(all_node[i].y == 0 || all_node[i].y == num_of_rows_of_pallets-1) {
			output_option.push(all_node[i].id)
		}
	}

	output_option = remove_duplicate(output_option);

	for(var i=0; i<output_option.length; i++){
		var option = document.createElement('option');
		option.setAttribute("value",output_option[i])
		option.innerHTML = output_option[i];

		document.getElementById("output_port_select").appendChild(option); 		
	}
}

function change_port_location(event) {
	event.preventDefault();

	var specific_grid_info;
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	var selected_input = event.target['input_port_select'].value
	var selected_output = event.target['output_port_select'].value

	if(selected_input == selected_output) {
		alert("the input port location and output port location cannot be the same location");
		location.reload();
	}
	else {
		$.ajax({
	    type: 'POST',
	    url: 'http://localhost:3031/test/updategriddata',
	    data: {
	      grid_depth : grid_data.grid_depth, 
	      grid_length : grid_data.grid_length,
	      grid_width : grid_data.grid_width,
	      input_port_location : selected_input,
	      output_port_location : selected_output,
	      supervisor_id : supervisor_id,
	    },
	    success: function(data){
	      alert("The port location is changed successfully")
	    },
	    error: function(jqXHR, textStatus, errorThrown) {
	    	console.log(jqXHR);
	      console.log(textStatus, errorThrown);
	      //alert("error post");
	    } 
	 	});
	}
	location.reload();
}

function change_path_algorithm(event) {
	event.preventDefault();

	var choose_algo = [];
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	if(document.getElementById("a_star_opt").checked) {
		choose_algo.push({
			algorithm_name : 'dijkstra',
			implementation : 'n',
		});

		choose_algo.push({
			algorithm_name : 'astar',
			implementation : 'y',
		});
	}
	else if(document.getElementById("dijkstra_opt").checked) {
		choose_algo.push({
			algorithm_name : 'dijkstra',
			implementation : 'y',
		});

		choose_algo.push({
			algorithm_name : 'astar',
			implementation : 'n',
		});
	}

	if(choose_algo.length > 0) {

		for(var i=0; i<choose_algo.length; i++) {
			algo_id = (supervisor_id)*(i+1);
			$.ajax({
		    type: 'POST',
		    url: 'http://localhost:3031/test/updatealgodata/' + algo_id,
		    data: {
		      algorithm_name : choose_algo[i].algorithm_name, 
		      algorithm_type : 'path',
		      implementation : choose_algo[i].implementation,
		      supervisor_id : supervisor_id,
		    },
		    success: function(data){
		    	
		    },
		    error: function(jqXHR, textStatus, errorThrown) {
		    	console.log(jqXHR);
		      console.log(textStatus, errorThrown);
		    } 
		 	});				
		}
	alert("The algorithm is changed successfully")	
	}
}

function change_reshuffling_method(event) {
	event.preventDefault();

	var choose_reshuffle_method = [];
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	if(document.getElementById("intermediate_opt").checked) {
		choose_reshuffle_method.push({
			algorithm_name : 'intermediate',
			implementation : 'y',
		});

		choose_reshuffle_method.push({
			algorithm_name : 'delaying',
			implementation : 'n',
		});
	}
	else if(document.getElementById("delaying_opt").checked) {
		choose_reshuffle_method.push({
			algorithm_name : 'intermediate',
			implementation : 'n',
		});

		choose_reshuffle_method.push({
			algorithm_name : 'delaying',
			implementation : 'y',
		});
	}

	console.log(choose_reshuffle_method)

	if(choose_reshuffle_method.length > 0) {
		for(var i=0; i<choose_reshuffle_method.length; i++) {
			algo_id = (supervisor_id)*(i+3);

			$.ajax({
		    type: 'POST',
		    url: 'http://localhost:3031/test/updatealgodata/' + algo_id,
		    data: {
		      algorithm_name : choose_reshuffle_method[i].algorithm_name, 
		      algorithm_type : 'reshuffle',
		      implementation : choose_reshuffle_method[i].implementation,
		      supervisor_id : supervisor_id,
		    },
		    success: function(data){
		    	console.log(data)
		    },
		    error: function(jqXHR, textStatus, errorThrown) {
		    	console.log(jqXHR);
		      console.log(textStatus, errorThrown);
		    } 
		 	});				
		}
	alert("The reshuffling method is changed successfully")	
	}
}
////////////////////////////////
//		System ready to start
////////////////////////////////

function RunAllFunction() {
	get_initial_data();
	change_port();
}

RunAllFunction();
