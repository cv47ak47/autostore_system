////////////////////////////////////
//		Testing
////////////////////////////////////
var current_seconds = Math.ceil(new Date().getTime()/1000);

////////////////////////////////////
//		Local Storage Variable
////////////////////////////////////
var depth = 5;
var bin_height = 0.3;
var retrieve_velocity = 1.6;

////////////////////////////////////
//		Initialization
////////////////////////////////////

var initial_num_robot = 2;
var initial_count = 0;
var initial_status = "stop";
var initial_input_port = 5;
var initial_output_port = 25;
var initial_end_location = null;
var today = new Date();
var current_time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var color = ["red","aqua","purple","grey","brown"];

////////////////////////////////////
//		Static varaible
////////////////////////////////////
var interval;
var counter_infinite_loop = 0;
var timer = 0;
var all_robot = [];
var all_node = [];
var whole_grid = [];
var graph = [];
var nodes = [];
var grids = [];
var coordinate = [];
var path_node = [];
var path_with_time = [];
var path_with_time_used_in_stimulation = []
var metrics = [];
var stock_data = [];
var initial_task = [];
var real_location_with_stock = [];
var storage = [];
var stock = [];
var date_duration = [];
var assigned_task = [];
var stock_bin_data = [];
var statistic_data = [];
var storage_data = [];
var full_full_or_not = []
var picking_stock_id;
var full_full_or_not;

var grid_data;
var agv_data;
var algo_data;
var current_path_algo;
var current_reshuffle_algo;

////////////////////////////////////
//		Initial Variable From DB
////////////////////////////////////

function get_second_time() {
		// get stock bin data
 	$.ajax({
    url:'http://localhost:3031/test/getallstockbindata',
    type:'get',
    async :  false,
    
    success: function(data) {
    	stock_bin_data = data;
    },
  	error: function(jqXHR, textStatus, errorThrown) {
    	console.log(textStatus, errorThrown);
    	alert("error get stock bin data");
    }
	});
}

function get_initial_data() {
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	// get grid data
	$.ajax({
    type: 'GET',
    url: "http://localhost:3031/test/getgriddata/" +supervisor_id ,
    async :  false,
    success: function(data){
			grid_data = data;
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
      alert("error get");
    } 
  });

  // get agv data
	$.ajax({
    type: 'GET',
    url: "http://localhost:3031/test/getallagvdata" ,
    async :  false,
    success: function(data){
			agv_data = data;
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
      alert("error get");
    } 
  });
 
  // get algo data
	$.ajax({
    type: 'GET',
    url: "http://localhost:3031/test/getallalgodata",
    async :  false,
    success: function(data){
			algo_data = data;
			console.log(algo_data)

			for(var i=0; i<algo_data.length; i++) {
				if(algo_data[i].supervisor_id == supervisor_id) {
					if(algo_data[i].implementation == 'y') {
						console.log(i)
						if(algo_data[i].algorithm_type == 'path') {
							current_path_algo = algo_data[i].algorithm_name
						}
						else if(algo_data[i].algorithm_type == 'reshuffle') {
							current_reshuffle_algo = algo_data[i].algorithm_name
						}
					}				
				}
			}
			console.log(current_path_algo)
			console.log(current_reshuffle_algo)
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
      alert("error get");
    } 
  });

	// get stock bin data
 	$.ajax({
    url:'http://localhost:3031/test/getallstockbindata',
    type:'get',
    async :  false,
    
    success: function(data) {
    	stock_bin_data = data;
    },
  	error: function(jqXHR, textStatus, errorThrown) {
    	console.log(textStatus, errorThrown);
    	alert("error get stock bin data");
    }
	});

	$.ajax({
    url:'http://localhost:3031/test/getallstoragedata',
    type:'get',
    async :  false,
    
    success: function(data) {
    	console.log(grid_data.grid_length)
    	console.log(grid_data.grid_width)
    	console.log(grid_data.grid_depth)

    	for(var l=0; l<data.length; l++) {
	    	for(var i=0; i<grid_data.grid_length; i++) {
	        for(var j=0; j<grid_data.grid_width; j++) {		
	        	for(var k=0; k<=grid_data.grid_depth; k++) {
	        		if((data[l].depth == k && data[l].y_axis == j) && (data[l].x_axis == i) && data[l].grid_id == grid_data.grid_id) {
	        			storage_data.push(data[l]);
	        		}
	        	}
	        }
	    	}
    	}
    	console.log(storage_data)
    },
  	error: function(jqXHR, textStatus, errorThrown) {
    	console.log(textStatus, errorThrown);
    	alert("error get storage data");
    }
	});	

 	$.ajax({
	    type: 'GET',
	    url: "http://localhost:3031/test/getallstatisticdata/",
	    async :  false,

	    success: function(data){
				statistic_data = data;
	    },
	    error: function(jqXHR, textStatus, errorThrown) {
	      console.log(textStatus, errorThrown);
	      alert("error get");
	    } 
	});
}


////////////////////////////////////
//		Global Function and variables
////////////////////////////////////

function repeat(str, nTimes) {
  return (0).toFixed(nTimes).substr(2).replaceAll('0', str);
}

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

function position_to_xy(location) {
	var point = [];
	var x = Math.floor(location/grid_data.grid_length);
	var y = Math.floor(location%grid_data.grid_width)-1;

	if(y<0) { y+=grid_data.grid_width;}

	point.x = x;
	point.y = y;

	return point;
}

function xy_to_position(x,y) {
	var position = null;
	position = x*grid_data.grid_length+y+1
	return position;
}

function check_duplicate_path(path, temporary_path) {
	var duplicate_path = [];
  for (var i = 0; i < temporary_path.length; i++) {
    for (var j = 0; j < path.length; j++) {
    	if(temporary_path[i].robot != path[j].robot) {
        if ((temporary_path[i].x == path[j].x && temporary_path[i].y == path[j].y) && temporary_path[i].time == path[j].time) {
        	duplicate_path.push(temporary_path[i]) 		
    		}
      } 
    }
  }
  console.log(duplicate_path)

  if(duplicate_path.length == 0) {
  	return null;
  }
  else {
   	return duplicate_path;
  }
}

function check_all_axis_collision(path, temporary_path, collision_path) {
	if(collision_path != null) {
	  var path_collision_index =null;
	  var temporary_path_collision_index = null;

	  for (var i = 0; i < temporary_path.length; i++) {
	    for (var j = 0; j < path.length; j++) {
	      if ((temporary_path[i].x == path[j].x && temporary_path[i].y == path[j].y) && temporary_path[i].time == path[j].time) {
	        temporary_path_collision_index = i;
	        path_collision_index = j;
	      } 
	    }
	  }
		if(temporary_path_collision_index != 0) {
			if(temporary_path[temporary_path_collision_index-1].x == path[path_collision_index-1].x) {
		  	return "x_axis";
		  }
		  else if(temporary_path[temporary_path_collision_index-1].y == path[path_collision_index-1].y) {
		  	return "y_axis";
		  }	  	
		}
	  else {
	  	return false;
	  }		
	}
}

function check_all_swap_collision(path, temporary_path, collision_path) {
	var swap_collision = [];
	console.log(collision_path)
	if(collision_path == null) {
	  var path_collision_index,temporary_path_collision_index;
	  for (var i = 1; i < temporary_path.length; i++) {
	    for (var j = 1; j < path.length; j++) {
	      if (((temporary_path[i-1].x == path[j].x && temporary_path[i-1].y == path[j].y) && (temporary_path[i].x == path[j-1].x && temporary_path[i].y == path[j-1].y) ) && temporary_path[i].time == path[j].time) {
	        temporary_path_collision_index = i;
	        path_collision_index = j;
	      } 
	    }
	  }

	  if((temporary_path_collision_index != null) && (path_collision_index != null)) {
	  	if(temporary_path[temporary_path_collision_index-1].x == path[path_collision_index-1].x) {
	  		swap_collision.push({
	  			lower_priority_path_index : temporary_path_collision_index,
	  			axis : "x_axis"
	  		});

	  		return swap_collision;
	  	}
	  	else if(temporary_path[temporary_path_collision_index-1].y == path[path_collision_index-1].y) {
	  		swap_collision.push({
	  			lower_priority_path_index : temporary_path_collision_index,
	  			axis : "y_axis"
	  		});

	  		return swap_collision;
	  	}
	  	else {
	  		var a =0;
	  		return a;
	  	}		
	  }
	}
	else {
		return null;
	}
}

function find_row_and_column(location) {
	var column = location, row = 0;
	var row_column = [];

	row = Math.floor(location/100);
	while (location > 100) {
  	column = column - 100;
  	location = location - 100;
	}

	row_column.push({
		col:column,
		row:row,
	});
	return row_column;
}

function find_rowcolumn(row,column) {
	var rowcolsum_with_zero = "0";
	return parseInt(row + rowcolsum_with_zero + column);
}

function heuristic(pos0,pos1) {
	//console.log(pos0)
	var d1 = Math.abs(pos1.x - pos0.x);
  var d2 = Math.abs(pos1.y - pos0.y);
  return d1 + d2;
}

function Createtable(data,table_location,data_type,table_type,datatable_class) {
	console.log(data)
	var new_col = [];

	var col = [];
    for (var i = 0; i < data.length; i++) {      
      for (var key in data[i]) {        
        if (col.indexOf(key) === -1) { 
            col.push(key);
        }
      }
    } 
    console.log(col)
    

  // CREATE DYNAMIC TABLE.
  if(table_type == "table") {
	  var table = document.createElement("table");

	  // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

	  var tr = table.insertRow(-1);                   // TABLE ROW.
	 
	  for (var i = 0; i < col.length; i++) {
	      var th = document.createElement("th");      // TABLE HEADER.
	      th.innerHTML = col[i];
	      //console.log(col[i]);
	      tr.appendChild(th);
	  }

	  // ADD JSON DATA TO THE TABLE AS ROWS.
	  for (var i = 0; i < data.length; i++) {

	    tr = table.insertRow(-1);
	    for (var j = 0; j < col.length; j++) {
	      var tabCell = tr.insertCell(-1);
	      // console.log(tabCell);
	      tabCell.innerHTML = data[i][col[j]];
	      console.log(data[i][col[j]])
	    }
	  }

	  console.log(tr)
	  // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
	  var divContainer = document.getElementById(table_location);
	  //divContainer.innerHTML = "";

	  console.log(divContainer)


	  divContainer.appendChild(table); 	
  }
  else if(table_type == "datatable") {
  	col.push("Selection")

	  var thead = document.createElement("thead");
	  var tbody = document.createElement("tbody");  
	  
	  var tr = thead.insertRow(-1);                   // TABLE ROW.

	  if(data_type != "stock_data") {
		  for (var i = 0; i < col.length; i++) {
	      var th = document.createElement("th");      // TABLE HEADER.
	      th.innerHTML = col[i];
	      //console.log(col[i]);
	      tr.appendChild(th);
		  }		  	
	  }
	  else {
		  for (var i = 0; i < col.length; i++) {
	      var th = document.createElement("th");      // TABLE HEADER.
	      var new_col = [];
	      new_col.push("Stock ID","Name","Code","Type","Quantity","Description","Weight  (in g)","Arrival Time","Export Time","Function");

	      th.innerHTML = new_col[i];
	      tr.appendChild(th);
		  }			  	
	  }


	  for (var i = 0; i < data.length; i++) {
	    var tr = tbody.insertRow(-1);
	    for (var j = 0; j < col.length; j++) {
	      var tabCell = tr.insertCell(-1);
	      // console.log(tabCell);
	      tabCell.innerHTML = data[i][col[j]];
	      if(col[j] == "Selection") {
	      	tabCell.innerHTML = '<button type="button" onclick="pick_item(' + data[i].stock_id + ')">Pick</button>';
	      }
	    }
	  }
	  var divContainer = document.getElementById(table_location);
	  //divContainer.innerHTML = "";

	  divContainer.appendChild(thead);
	  divContainer.appendChild(tbody);

	  $('.' + datatable_class).DataTable({
  		searching:true,
  		ordering:true,
  		lengthMenu: [[5,10,15,20,-1],[5,10,15,20,"ALL"]],
  		order: [[ 1, "desc" ]],
  	});
  }
}

////////////////////////////////
//		Robot Node
/////////////////////////////////

class GridNode{

 	constructor(id,x,y,weight,f,g,h,closed,visited,parent) {
 		this.id = id;
 		this.x = x;
 		this.y = y;
 		this.weight = weight;
 		this.f = f;
 		this.g = g;
 		this.h = h;
 		this.isWall = 0;
 		this.closed = closed;
 		this.visited = visited;
 		this.parent = parent;
 	}

 	getCost() { return weight;}
}

function createNode() {

}

////////////////////////////////
//		Robot Class
/////////////////////////////////

class Robot{

	constructor(id,name,count,status,availability,current_position,start_position,end_position) {
		this.id = id;
		this.name = name;
		this.count = count;
		this.status = status;
		this.availability = availability;
		this.current_position = current_position;
		this.start_position = start_position;
		this.end_position = end_position;
	}
	// Robot info
	id() { return this.id; }
	name() { return this.name; }
	status() { return this.status; }
	availability() { return this.availability; }
	current_position() { return this.current_position; }
	start_position() { return this.start_position; }
	end_position() { return this.end_position; }

	// Robot Action
	start_moving() {this.status = "move";}
	stop_moving()  {this.status = "stop";}

	// Add the metrics
	add_path() {this.count++;}

	// Change info of the robot
	change_availability(availability) {this.availability = availability;}
	change_current_pos(current_pos) {this.current_position = current_pos;}
	change_start_pos(start_pos) {this.start_position = start_pos;}
	change_end_pos(end_pos) {this.end_position = end_pos;}


	find_path_length() {
		return this.count;
	}
}

////////////////////////////////
//		Specific Function for Robot
////////////////////////////////

function createRobot() {
	//console.log("test")
	
	var num_robot = initial_num_robot;
	for(var i=0; i<num_robot;i++) {
		var current_position = agv_data[i].current_pos;
		var num = i+1;
		var robot_name = "AGV" + num.toString() ;
		var availability = "yes";

		robot_name = new Robot(num,robot_name,initial_count,initial_status,availability,
			current_position,initial_input_port,initial_end_location);

		all_robot.push(robot_name);

		console.log(robot_name.name + " is built");
	}

	console.log(all_robot)
}

function put_robot_into_input_port(start_pos,end_pos,robot_id) {
	var input_location,input_id;

	for(var i=0; i<id_and_location.length;i++) {
		if(id_and_location[i].function == "PI") {	
			input_location = parseInt(id_and_location[i].value); 
			input_id = parseInt(id_and_location[i].id);
		}
	}

	input_id = start_pos;	//hard_code
	output_id = end_pos;

	for(var i=0; i<all_robot.length; i++) {	// check robot availability
		if(all_robot[i].availability == "yes") {

			let robot = all_robot[i];
			//console.log(robot);
			robot.change_availability("no");
			robot.change_start_pos(input_id);
			robot.change_current_pos(input_id);
			robot.change_end_pos(end_pos);

			console.log(i)
			console.log(robot_id)
			set_input_port(input_id,all_robot[robot_id-1].id,color[i]);
			set_output_port(output_id,color[i])

			//console.log(all_robot[i]);

			//robot.change_start_pos(robot.current_position);	// if robot not at the input location
			//robot.change_end_pos(input_location);	

			//if(robot.current_position = input_location);
			return;
		}
	}
}

////////////////////////////////
//	  Calculation
////////////////////////////////

function calculate_retrieve_and_store_time_in_one_stack(h) {	//h is the item depth
	var retrieve_time = 0;
	var distance =0;

	distance = 2*(depth-h)*bin_height;

	retrieval_time = distance/retrieve_velocity;

	return retrieval_time;
}

////////////////////////////////
//		Grid 
////////////////////////////////

function create_grid() {

	var small_grid =[];
	for(var i=0; i<grid_data.grid_width; i++) {
		small_grid.push(i);
	}

	var grid = [];
	var nodes_by_x = [];

	for(var i=0;i<small_grid.length;i++) {
		grid.push(small_grid)
	}

	for(var x = 0; x < small_grid.length; x++) {
		var gridnode = [];
		var one_grid = [];
		var one_nodes_by_x = [];
	    for(var y = 0; y < grid_data.grid_length; y++) {

	    	var f = 0;
	    	var g = 0;
	    	var h = 0;
	    	var isWall = 0;
	    	var visited = false;
	    	var closed = false;
	    	var debug = "";
	    	var parent = null;
	    	var weight = 1;
	    	var id = x*grid_data.grid_width+y+1;
	    		
	    	var node_name = "node" + ((x+1)*grid_data.grid_length+(y+1)).toString() ;
				node_name = new GridNode(id,x,y,weight,f,g,h,closed,visited,parent);

				coordinate.push({
					x:x,
					y:y
				})

				one_nodes_by_x.push(node_name);
				all_node.push(node_name);
	    }
	    nodes_by_x.push(one_nodes_by_x)
	    grids.push(one_grid)
	}

	graph.push({
		nodes : all_node,
		diagonal : false,
		grid : nodes_by_x,
		dirtyNodes : [],
	})
}

function set_input_port(id,robot_id,color){
	//document.getElementById(id.toString()).innerHTML +='<div><span class="got-robot" style="background-color:'+color+';"><div>'+robot_id+'</div></span></div>';
	//document.getElementById(id.toString()).style.backgroundColor = color;
}

function set_output_port(id,color){
	//document.getElementById(id.toString()).innerHTML +='<div><span class="got-robot-destination" style="background-color:'+color+';"><div></div></span></div>';
	document.getElementById(id.toString()).setAttribute("robot",color)
	//document.getElementById(id.toString()).style.backgroundColor = color;
}

function cancel_path(x,y,robot) {
	for(var i=0 ; i<all_node.length ; i++) { 
		if(all_node[i].x == x && all_node[i].y == y) {
			//console.log(i)
			if(document.getElementById((i+1).toString()).getAttribute("robot") == "no"){
				//document.getElementById((i+1).toString()).innerHTML = "["+x+"]["+y+"]";
				document.getElementById((i+1).toString()).innerHTML = '<font size="5">'+(i+1).toString()+'</font>' +'<div><span class="no-robot"></span></div>';
			}			
			else if(document.getElementById((i+1).toString()).getAttribute("robot") != color[robot-1]){
				//document.getElementById((i+1).toString()).innerHTML = '<font size="5">'+(i+1).toString()+'</font>' +'<div><span class="got-robot" style="background-color:'+color[robot-1]+';"><div>'+robot+'</div></span></div>';
				document.getElementById((i+1).toString()).innerHTML = '<font size="5">'+(i+1).toString();
				//set_output_port(i+1,document.getElementById((i+1).toString()).getAttribute("robot"));
			}
			else if(document.getElementById((i+1).toString()).getAttribute("robot") == color[robot-1]){
				//document.getElementById((i+1).toString()).innerHTML = '<font size="5">'+(i+1).toString()+'</font>' +'<div><span class="got-robot" style="background-color:'+color[robot-1]+';"><div>'+robot+'</div></span></div>';
				document.getElementById((i+1).toString()).innerHTML = '<font size="5">'+(i+1).toString()+'</font>' +'<div><span class="no-robot"></span></div>';
			}
			if(i+1 == grid_data.input_port_location) {
				//document.getElementById((i+1).toString()).innerHTML = '<font size="5">PI</font>' +'<div><span class="got-robot" style="background-color:'+color[robot_id-1]+';"><div>'+robot_id+'</div></span></div>';
			document.getElementById((i+1).toString()).innerHTML = '<font size="5">PI</font>' +'<div><span class="no-robot"></span></div>';
			}
			else if(i+1 == grid_data.output_port_location){
			//	document.getElementById((i+1).toString()).innerHTML = '<font size="5">PO</font>' +'<div><span class="got-robot" style="background-color:'+color[robot_id-1]+';"><div>'+robot_id+'</div></span></div>';	
			document.getElementById((i+1).toString()).innerHTML = '<font size="5">PO</font>' +'<div><span class="no-robot"></span></div>';
			}
		}
	}
}

function draw_path(x,y,robot_id) {
	for(var i=0 ; i<all_node.length ; i++) { 
		//console.log(x)
		if(all_node[i].x == x && all_node[i].y == y) {
			//console.log("a")
			if(i+1 == grid_data.input_port_location) {
				document.getElementById((i+1).toString()).innerHTML = '<font size="5">PI</font>' +'<div><span class="got-robot" style="background-color:'+color[robot_id-1]+';"><div>'+robot_id+'</div></span></div>';
			}
			else if(i+1==grid_data.output_port_location){
				document.getElementById((i+1).toString()).innerHTML = '<font size="5">PO</font>' +'<div><span class="got-robot" style="background-color:'+color[robot_id-1]+';"><div>'+robot_id+'</div></span></div>';	
			}
			else {
				//console.log("a")
				document.getElementById((i+1).toString()).innerHTML = '<font size="5">'+(i+1).toString()+'</font>' +'<div><span class="got-robot" style="background-color:'+color[robot_id-1]+';"><div>'+robot_id+'</div></span></div>';
			}
			
		}
	}
}

function draw_into_grid(real_location_with_stock) {
	var num_of_rows_of_pallets = window.localStorage.getItem("num_of_rows_of_pallets");
	var num_of_columns_of_pallets = window.localStorage.getItem("num_of_columns_of_pallets");

	for(var j=0; j<real_location_with_stock.length; j++) {
		if(real_location_with_stock[j].depth == 5) {
			document.getElementById(real_location_with_stock[j].location).innerHTML += real_location_with_stock[j].stock_id;		
		}
		else {
			document.getElementById(real_location_with_stock[j].location).innerHTML += "," + real_location_with_stock[j].stock_id;			
		}
	}
}

var id_and_location = [];

function build_pallets() {	
	
	var num_of_rows_of_pallets = grid_data.grid_length;
	var num_of_columns_of_pallets = grid_data.grid_width;

	var id_count = 1;
	var value_count = 1;

	document.getElementById("grid-container").style.gridTemplateColumns = (repeat(800/num_of_columns_of_pallets+ "px ", num_of_columns_of_pallets).toString());
	document.getElementById("grid-container").style.gridcolumngap = "40px";

	var cell_weight = 1;

	for(var i=1; i<= num_of_rows_of_pallets;i++) {
		var nodeRow = [];
		for(var j=1; j<= num_of_columns_of_pallets; j++) {
			var rowcolsum_with_zero = "0";
      if(j<10) { 
          rowcolsum_with_zero = rowcolsum_with_zero + j;
      }else {
          rowcolsum_with_zero = j;
      }

      var idid = id_count;
			id_and_location.push({
				id : idid,
				value : i.toString() + rowcolsum_with_zero,
				function : "none",
			})

			var grid = document.createElement('div');
			var id = i+(num_of_rows_of_pallets*(j-1));

			if(id == grid_data.input_port_location) {
				grid.setAttribute("id", id)
				grid.setAttribute("class","grid-item");
				grid.setAttribute("value", i.toString() + rowcolsum_with_zero);
				grid.setAttribute("x", (j-1).toString());
				grid.setAttribute("y", (i-1).toString());
				grid.setAttribute("robot", "no");
				grid.setAttribute("port", "yes");
				grid.innerHTML = '<font size="5">PI</font>' +'<div><span class="no-robot"></span></div>'; //放101,201这样
			}
			else if(id == grid_data.output_port_location) {
				grid.setAttribute("id", id)
				grid.setAttribute("class","grid-item");
				grid.setAttribute("value", i.toString() + rowcolsum_with_zero);
				grid.setAttribute("x", (j-1).toString());
				grid.setAttribute("y", (i-1).toString());
				grid.setAttribute("robot", "no");
				grid.setAttribute("port", "yes");
				grid.innerHTML = '<font size="5">PO</font>' +'<div><span class="no-robot"></span></div>'; //放101,201这样
			}
			else {
				grid.setAttribute("id", id)
				grid.setAttribute("class","grid-item");
				grid.setAttribute("value", i.toString() + rowcolsum_with_zero);
				grid.setAttribute("x", (j-1).toString());
				grid.setAttribute("y", (i-1).toString());
				grid.setAttribute("robot", "no");
				grid.setAttribute("port", "no");
				//grid.innerHTML = i.toString() + rowcolsum_with_zero +'<div><span class="no-robot"></span></div>'; //放101,201这样
				grid.innerHTML = '<font size="5">'+id+'</font>' +'<div><span class="no-robot"></span></div>'; //放101,201这样
			}

			document.getElementById('grid-container').appendChild(grid);	

			nodeRow.push(cell_weight);
		}
		nodes.push(nodeRow);
	}

	var pick_input_location_index = Math.floor(num_of_rows_of_pallets/2/2);
	var pick_output_location_index = Math.ceil(num_of_rows_of_pallets/2);
	var pick_input_location  = num_of_columns_of_pallets * pick_input_location_index + 1;
	var pick_output_location = num_of_columns_of_pallets * pick_output_location_index + 1;

	for(var i=0; i<id_and_location.length;i++) {
		if(id_and_location[i].id == pick_input_location) {
			id_and_location[i].function = "PI";
		}
		else if(id_and_location[i].id == pick_output_location) {
			id_and_location[i].function = "PO";
		}
	}
}

function run_in_grid(all_all_path) {
	found = false;
	for(var i=0; i<all_all_path.length-1; i++) {
		if(all_all_path[i].time == timer-1) {
			cancel_path(all_all_path[i].x,all_all_path[i].y,all_all_path[i].robot)
		}
	}

	for(var i=0; i<all_all_path.length; i++) {
		if(all_all_path[i].time == timer) {
			draw_path(all_all_path[i].x,all_all_path[i].y,all_all_path[i].robot)
			found = true;
		}
	}

	timer++;



	if(!found){
		pos = xy_to_position(all_all_path[all_all_path.length-1].x , all_all_path[all_all_path.length-1].y)

		// change current_data
		agv_data[all_all_path[0].robot-1].current_pos = pos;
		console.log(agv_data[(all_all_path[0].robot)-1].agv_id)

		for(var i=0; i<all_all_path.length-1; i++) {
			for(var j=1; j<=initial_num_robot; j++) {	
				if(all_all_path[i].robot == j && all_all_path[i+1].robot != j) {

					//first_back_position = xy_to_position(1,grid_data.grid_length-2)
					//second_back_position = xy_to_position(grid_data.grid_width-2,grid_data.grid_length-2)

					console.log(all_all_path[i].x)
					console.log(all_all_path[i].y)
					$.ajax({
				    type: 'POST',
				    url: "http://localhost:3031/test/updateagvdata" ,   
				    data: {
							agv_id : j,
							current_pos : xy_to_position(all_all_path[i].x , all_all_path[i].y),

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
				
				if(i==all_all_path.length-2 &&  all_all_path[i].robot == j) {
					$.ajax({
				    type: 'POST',
				    url: "http://localhost:3031/test/updateagvdata" ,   
				    data: {
							agv_id : j,
							current_pos : xy_to_position(all_all_path[i+1].x , all_all_path[i+1].y),
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
		}
		
		all_robot[0].availability = "yes";
		clearInterval(interval)
	}
}

////////////////////////////////
//		Storage info
////////////////////////////////

function all_storage() {
	var storage_count = 1;
	var num_of_rows_of_pallets = grid_data.grid_length;
	var num_of_columns_of_pallets = grid_data.grid_width;

	var total_storage = num_of_rows_of_pallets*num_of_columns_of_pallets*depth;

	//location = num_of_rows_of_pallets + "-" + num_of_columns_of_pallets + "-" + depth;
	for(var i=0; i<num_of_rows_of_pallets; i++) {
		for(var j=0; j<num_of_columns_of_pallets; j++) {
			var storage_id = (j*num_of_rows_of_pallets)+i+1;
			for(var k=0; k<depth; k++) {
				var location = (i+1) + "-" + (j+1) + "-" + (k+1);
				storage.push({
					storage_id : storage_id,
					availability : "y",
					total_weight : 0,
					x_axis : j,
					y_axis : i,
					depth : k+1,
					stock_id : null,
					stock_amount : null,
				});	
				storage_count++;
			}
		}
	}
	console.log(storage)
}

////////////////////////////////
//		Path Finding
////////////////////////////////

function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
}

function pathTo(node){
    var curr = node,
        path = [];
    while(curr.parent) {
        path.push(curr);
        curr = curr.parent;
    }
    return path.reverse();
}

function getHeap() {
    return new BinaryHeap(function(node) {
        return node.f;
    });
}

function push(openHeap,element){
	//	console.log(element)
		openHeap.content.push(element);

	  // Allow it to sink down.
	  sinkDown(openHeap,openHeap.content.length - 1);
}

function pop(openHeap){
		var result = openHeap.content[0];
	//	console.log(result)

		
	  // Get the element at the end of the array.
	  var end = openHeap.content.pop();
	  // If there are any elements left, put the end element at the
	  // start, and let it bubble up.

	  if (openHeap.content.length > 0) {
	  //		console.log("A")
	      openHeap.content[0] = end;
	      bubbleUp(openHeap,0);
	  }
	 // console.log(result)
	  return result;
}

function remove(openHeap,node) {
	var i = openHeap.content.indexOf(node);

  // When it is found, the process seen in 'pop' is repeated
  // to fill up the hole.
  var end = openHeap.content.pop();

  if (i !== openHeap.content.length - 1) {
      openHeap.content[i] = end;

      if (openHeap.scoreFunction(end) < openHeap.scoreFunction(node)) {
          sinkDown(openHeap,i);
      }
      else {
          bubbleUp(openHeap,i);
      }
  }
}

function size(openHeap) {
	return openHeap.content.length;
}

function rescoreElement(openHeap,node) {
	sinkDown(openHeap,openHeap.content.indexOf(node));
}

function sinkDown(openHeap,n) {
	// Fetch the element that has to be sunk.
  var element = openHeap.content[n];

  // When at 0, an element can not sink any further.
  while (n > 0) {

      // Compute the parent element's index, and fetch it.
      var parentN = ((n + 1) >> 1) - 1,
          parent = openHeap.content[parentN];
      // Swap the elements if the parent is greater.
      if (openHeap.scoreFunction(element) < openHeap.scoreFunction(parent)) {
          openHeap.content[parentN] = element;
          openHeap.content[n] = parent;
          // Update 'n' to continue at the new position.
          n = parentN;
      }

      // Found a parent that is less, no need to sink any further.
      else {
          break;
      }
  }
}

function bubbleUp(openHeap,n) {
  // Look up the target element and its score.
  var length = openHeap.content.length,
      element = openHeap.content[n],
      elemScore = openHeap.scoreFunction(element);

      //console.log(elemScore)

  while(true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) << 1,
          child1N = child2N - 1;
      // This is used to store the new position of the element, if any.
      var swap = null,
          child1Score;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
          // Look it up and compute its score.
          var child1 = openHeap.content[child1N];
          child1Score = openHeap.scoreFunction(child1);

          // If the score is less than our element's, we need to swap.
          if (child1Score < elemScore){
              swap = child1N;
          }
      }

      // Do the same checks for the other child.
      if (child2N < length) {
          var child2 = openHeap.content[child2N],
              child2Score = openHeap.scoreFunction(child2);
          if (child2Score < (swap === null ? elemScore : child1Score)) {
              swap = child2N;
          }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
          openHeap.content[n] = openHeap.content[swap];
          openHeap.content[swap] = element;
          n = swap;
      }
      // Otherwise, we are done.
      else {
          break;
      }
  }	
}

function neighbour(grid,node) {
  var ret = [];
  var x = node.x;
  var y = node.y;

  var grid = grid.grid;

  // West
  if(grid[x-1] && grid[x-1][y]) {
      ret.push(grid[x-1][y]);
  }

  // East
  if(grid[x+1] && grid[x+1][y]) {
      ret.push(grid[x+1][y]);
  }

  // South
  if(grid[x] && grid[x][y-1]) {
      ret.push(grid[x][y-1]);
  }

  // North
  if(grid[x] && grid[x][y+1]) {
      ret.push(grid[x][y+1]);
  }

  return ret;
}

function getCost(node) {
	return node.weight;
}

function markDirty(grid,node) {
	grid.dirtyNodes.push(node);
}

function cleanDirty(grid,node) {
  grid.dirtyNodes = [];
}

function clean_visited_node(node) {
	node.visited = false;
}

function clean_node(node) {
  node.f = 0;
  node.g = 0;
  node.h = 0;
  node.visited = false;
  node.closed = false;
  node.parent = null;
}

function isWall(node) {
	return node.weight === 0;
}

function add_current_agv_dirty(node) {

}

function check_obstacle(start,end,path,robot,current_time,algo) {
	console.log(path)

	var num_of_rows_of_pallets = grid_data.grid_length;
	var num_of_columns_of_pallets = grid_data.grid_width;

	var temporary_path = [];
	var temporary_path_time = current_time;

	temporary_path.push({
		robot : robot,
		id : xy_to_position(start.x,start.y),
		x : start.x,
		y : start.y,
		time: temporary_path_time
	})

	temporary_path_time++;

	for(var i=0;i<path.length; i++) {
		temporary_path.push({
			robot : robot,
			id : xy_to_position(path[i].x,path[i].y),
			x : path[i].x,
			y : path[i].y,
			time: temporary_path_time
		})
		temporary_path_time++;
	}

	console.log(temporary_path)

	do{
		var check_swap_collision = null;
		var check_duplicate = check_duplicate_path(path_with_time,temporary_path);
		var check_axis_collision = check_all_axis_collision(path_with_time,temporary_path,check_duplicate)

		if(check_duplicate == null) {
			//console.log("a")
			check_swap_collision = check_all_swap_collision(path_with_time,temporary_path,check_duplicate)		
		}
		// console.log(check_duplicate)
		// console.log(check_swap_collision)

		if(check_swap_collision != null) {
			check_duplicate = check_swap_collision;
		}

		if(check_duplicate != null) {
			console.log(check_duplicate)
			if(check_axis_collision == false) {
				//console.log("AA")
				var insert_place;
				for(var i=0;i<temporary_path.length;i++) {
					if(check_duplicate[0].x == temporary_path[i].x && check_duplicate[0].y == temporary_path[i].y) {
						insert_place = i;
					}
				}
				//console.log(insert_place)

				var add_path = [];
				add_path.push({
					robot : robot,
					id : xy_to_position(temporary_path[insert_place-1].x,temporary_path[insert_place-1].y),
					x : temporary_path[insert_place-1].x,
					y : temporary_path[insert_place-1].y,
					time: temporary_path[insert_place-1].time+1,
				});
				
				temporary_path.splice(insert_place,0,add_path[0]);

				for(var i=insert_place+1;i<temporary_path.length; i++) {
					//console.log(temporary_path[i])
					temporary_path[i].time = temporary_path[i].time + 1
				}
			}
			else if(check_axis_collision == "x_axis") {
				var insert_place,node_index;
				for(var i=0;i<temporary_path.length;i++) {
					if(check_duplicate[0].x == temporary_path[i].x && check_duplicate[0].y == temporary_path[i].y) {
						insert_place = i;
					}
				}

				for(var i=0; i<all_node.length; i++) {
					if(check_duplicate[0].x == all_node[i].x && check_duplicate[0].y == all_node[i].y) {
						node_index = i;
					}
				}

				for(var i=0; i<all_node.length; i++) {
					clean_node(all_node[i]);
				}

				all_node[node_index].visited = true;
				//console.log(all_node[node_index])

				graph[0].nodes[node_index].visited = true;
				graph[0].grid[parseInt(node_index / num_of_rows_of_pallets)][(node_index)%num_of_rows_of_pallets].visited = true;

				var modified_path = search(graph[0],start,end,"closest",algo,"null",robot);
				//console.log(modified_path)
				check_obstacle(start,end,modified_path,robot,current_time)
				//check_duplicate = null;
				return ;
			}
			else if(check_axis_collision == "y_axis") {
				var insert_place,node_index;
				for(var i=0;i<temporary_path.length;i++) {
					if(check_duplicate[0].x == temporary_path[i].x && check_duplicate[0].y == temporary_path[i].y) {
						insert_place = i;
					}
				}

				for(var i=0; i<all_node.length; i++) {
					if(check_duplicate[0].x == all_node[i].x && check_duplicate[0].y == all_node[i].y) {
						node_index = i;
					}
				}

				for(var i=0; i<all_node.length; i++) {
					clean_node(all_node[i]);
				}

				all_node[node_index].visited = true;
				//console.log(all_node[node_index])

				graph[0].nodes[node_index].visited = true;
				graph[0].grid[parseInt(node_index / num_of_rows_of_pallets)][(node_index)%num_of_rows_of_pallets].visited = true;

				var modified_path = search(graph[0],start,end,"closest",algo,"null",robot);
				//console.log(modified_path)
				check_obstacle(start,end,modified_path,robot,current_time)
				//check_duplicate = null;
				return ;
			}
			
			if(check_swap_collision != null) {
				if(check_swap_collision[0].axis == "x_axis") {
					var node_index;
					for(var i=0; i<all_node.length; i++) {
						clean_node(all_node[i]);
					}

					for(var i=0; i<all_node.length; i++) {
						if(temporary_path[check_swap_collision[0].lower_priority_path_index].x == all_node[i].x && temporary_path[check_swap_collision[0].lower_priority_path_index].y == all_node[i].y) {
							node_index = i;
						}
					}

					all_node[node_index].visited = true;
					//console.log(all_node[node_index])

					graph[0].nodes[node_index].visited = true;
					graph[0].grid[parseInt(node_index / num_of_rows_of_pallets)][(node_index)%num_of_rows_of_pallets].visited = true;

					var modified_path = search(graph[0],start,end,"closest",algo,"null",robot);
					//console.log(modified_path)
					check_obstacle(start,end,modified_path,robot,current_time)
					//check_duplicate = null;
					return ;
				}
				else if(check_swap_collision[0].axis == "y_axis") {
					var node_index;
					for(var i=0; i<all_node.length; i++) {
						clean_node(all_node[i]);
					}

					for(var i=0; i<all_node.length; i++) {
						if(temporary_path[check_swap_collision[0].lower_priority_path_index].x == all_node[i].x && temporary_path[check_swap_collision[0].lower_priority_path_index].y == all_node[i].y) {
							node_index = i;
						}
					}

					all_node[node_index].visited = true;
					//console.log(all_node[node_index])

					graph[0].nodes[node_index].visited = true;
					graph[0].grid[parseInt(node_index / num_of_rows_of_pallets)][(node_index)%num_of_rows_of_pallets].visited = true;

					var modified_path = search(graph[0],start,end,"closest",algo,"null",robot);

					check_obstacle(start,end,modified_path,robot,current_time)

					return ;
				}			
			}
		}

		console.log(check_duplicate)
	}while(check_duplicate != null)

	console.log("come out")

	for(var i=0;i<temporary_path.length; i++) {
		path_with_time.push({
			robot : temporary_path[i].robot,
			id : xy_to_position(temporary_path[i].x, temporary_path[i].y),
			x : temporary_path[i].x,
			y : temporary_path[i].y,
			time: temporary_path[i].time,
		})

		path_with_time_used_in_stimulation.push({
			robot : temporary_path[i].robot,
			id : xy_to_position(temporary_path[i].x, temporary_path[i].y),
			x : temporary_path[i].x,
			y : temporary_path[i].y,
			time: temporary_path[i].time,
		})
	}
}

function search(grid, start, end, option,algo,firstlast,agv) {

	first_back_position = xy_to_position(1,grid_data.grid_length-2)
	second_back_position = xy_to_position(grid_data.grid_width-2,grid_data.grid_length-2)

		var closest;

		if(closest == option) {
			closest = true;
		}

		cleanDirty(grid);

		if(agv == 1) {
			grid.grid[grid_data.grid_width-2][grid_data.grid_length-2].visited = true;
			grid.nodes[second_back_position-1].visited = true;
		}
		else if(agv == 2) {
			grid.grid[1][grid_data.grid_length-2].visited = true;
			grid.nodes[first_back_position-1].visited = true;			
		}

		// if(firstlast != "first" || firstlast != "last") {


		// }

		// if(firstlast == "first" || firstlast == "last") {
		// 	grid.grid[1][grid_data.grid_length-2].visited = false;
		// 	grid.grid[grid_data.grid_width-2][grid_data.grid_length-2].visited = false;
		// 	grid.nodes[first_back_position-1].visited = false;
		// 	grid.nodes[second_back_position-1].visited = false;
		// }
		
	//add_current_agv_dirty(grid);


		var openHeap = getHeap()

	  var closestNode = start; // set the start node to be the closest if required

	  if(algo == "astar") {
	  	start.h = heuristic(start,end);
	  }
		
		push(openHeap,start)

	  while(size(openHeap) > 0) {

	    // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
	    var currentNode = pop(openHeap);

	    // End case -- result has been found, return the traced path.
	    if(currentNode === end) {
	        return pathTo(currentNode);
	    }

	    // Normal case -- move currentNode from open to closed, process each of its neighbors.
	    currentNode.closed = true;

	    // Find all neighbors for the current node.
	    var neighbors = neighbour(grid,currentNode);

	    for (var i = 0, il = neighbors.length; i < il; ++i) {
	        var neighbor = neighbors[i];

	        if (neighbor.closed || isWall(neighbor)) {
	            // Not a valid node to process, skip to next neighbor.
	            continue;
	        }

	        // The g score is the shortest distance from start to current node.
	        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
	        var gScore = currentNode.g + getCost(currentNode)
	        var beenVisited = neighbor.visited;

	        if (!beenVisited || gScore < neighbor.g) {

	            // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
	            neighbor.visited = true;
	            neighbor.parent = currentNode;
	            if(algo == "astar") {
	  						neighbor.h = neighbor.h || heuristic(neighbor, end); 
	  					} 
	            neighbor.g = gScore;
	            neighbor.f = neighbor.g + neighbor.h;
	        		markDirty(grid,neighbor);

	            if (closest) {
	                // If the neighbour is closer than the current closestNode or if it's equally close but has
	                // a cheaper path than the current closest node then it becomes the closest node
	                if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
	                    closestNode = neighbor;
	                }
	            }

	            if (!beenVisited) {
	                // Pushing to heap will put it in proper place based on the 'f' value.
	                push(openHeap,neighbor);
	            }
	            else {
	                // Already seen the node, but since it has been rescored we need to reorder it in the heap
	                rescoreElement(openHeap,neighbor);
	            }
	        }
	     }
	  }

		if (closest) {
		  return pathTo(closestNode);
		}

		// No result was found - empty array signifies failure to find path.
		return [];
}

function start_search(start,end,robot,current_time,algo,firstlast) {

	for(var i=0; i<all_node.length; i++) {
		clean_node(all_node[i]);
	}

	var start_time = performance.now()

	//var path = search(graph[0],start,end,"closest",algo_data.algorithm_name);
	var path = search(graph[0],start,end,"closest",algo,firstlast,robot);

	var final_time = performance.now()
	var duration = (final_time-start_time);
	console.log(duration.toFixed(10))
	//var duration = final_time-start_time;

	check_obstacle(start,end,path,robot,current_time,current_path_algo)

	console.log("path : ")
	for(var i=0; i<path.length; i++) {
		console.log(path[i].x + "," +path[i].y)
	}
	
  if(path.length === 0) {
  	console.log("couldn't find a path (" + duration + "ms)")
  }
  else {
  	var count = 0;
  	for(var i=0; i<path_with_time.length; i++) {
  		if(path_with_time[i].robot == robot) {
  			count++;
  		}
  	}
  	metrics.push({
  		AGV : "AGV " + robot,
  		path_length : path.length,
  		path : path,
  		time : count-1,
  		search_time : duration,
  	});

  	console.log("search took " + duration + "ms.")
  }
  
  return path_with_time;	
}


////////////////////////////////
//		Check the temporary location for reshuffling
////////////////////////////////
function reshuffling_location(check_got_item) {
	var selected_width_length;
	var left = 0;
	var right = 0;
	var up = 0;
	var down = 0;
	var left_top_location = [];
	var right_top_location = [];
	var up_top_location = [];
	var down_top_location = [];
	var all_temporary_location = [];
	var temporary_location = [];

	if(grid_data.grid_width >= grid_data.grid_length) {
		selected_width_length = "width";
	}
	else {
		selected_width_length = "length";
	}

	if(selected_width_length == "width") {
		for(j=0; j<initial_task.length; j++) {			//find the left top and right top
			 if(check_got_item[0].stock_id == initial_task[j].stock_id) {
				for(var k=initial_task[j].location; k>grid_data.grid_width; k=k-grid_data.grid_width) {
					left+=1;
				}
				right = grid_data.grid_width - left - 1;

				for(var h=left; h>0; h--) {
					left_top_location.push(initial_task[j].location - (h*grid_data.grid_width));
				}

				for(var h=right; h>0; h--) {
					right_top_location.push(initial_task[j].location + (h*grid_data.grid_width));
				}

				all_temporary_location = left_top_location.concat(right_top_location);

				if(left_top_location.length >= check_got_item.length) {
					for(i=check_got_item.length, k=0; i>0; k++,i--) {
						temporary_location.push({
							stock_id : check_got_item[k].stock_id,
							assigned_location : initial_task[j].location - (i*grid_data.grid_width)
						});
					}
				}
				else {
					for(i=0;i<left_top_location.length; i++) {
						temporary_location.push({
							stock_id : check_got_item[i].stock_id,
							assigned_location : left_top_location[i],
						});
					}

					for(i=check_got_item.length - left_top_location.length, k=left_top_location.length; i>0; k++,i--) {
						temporary_location.push({
							stock_id : check_got_item[k].stock_id,
							assigned_location : initial_task[j].location + (i*grid_data.grid_width)
						});
					}
				}
			}
		}
	}
	else if(selected_grid_width == "length") {
		for(j=0; j<initial_task.length; j++) {			//find the left top and right top
			if(check_got_item[0].stock_id == initial_task[j].stock_id) {
				for(var k=initial_task[j].location; k>grid_data.grid_length; k=k-grid_data.grid_width) {
					up = initial_task[j].location%grid_data.grid_length-1;
				}
				down = grid_data.grid_lengt - up;

				for(var h=up; h>0; h--) {
					up_top_location.push(initial_task[j].location - h);
				}

				for(var h=down; h>0; h--) {
					down_top_location.push(initial_task[j].location + h);
				}

				all_temporary_location = up_top_location.concat(down_top_location);

				if(up_top_location.length >= check_got_item.length) {
					for(i=check_got_item.length, k=0; i>0; k++,i--) {
						temporary_location.push({
							stock_id : check_got_item[k].stock_id,
							assigned_location : initial_task[j].location - i
						});
					}					
				}
				else {
					for(i=0; i<up_top_location.length; i++) {
						temporary_location.push({
							stock_id : check_got_item[i].stock_id,
							assigned_location : up_top_location[i],
						});
					}

					for(i=check_got_item.length - up_top_location.length, k=up_top_location.length; i>0; k++,i--) {
						temporary_location.push({
							stock_id : check_got_item[k].stock_id,
							assigned_location : initial_task[j].location + i
						});
					}
				}
			}	
		}
	}
	
	return temporary_location;
}
////////////////////////////////
//		Reshuffling
////////////////////////////////
function delaying_reshuffling(check_got_item,selected_stock_id) {
	console.log(check_got_item)
	var temporary_location = reshuffling_location(check_got_item);
	console.log(temporary_location)
	var original_location;
	var selected_stock_depth = 0;

	for(var j=0; j<initial_task.length; j++){
		if(selected_stock_id == initial_task[j].stock_id) {
			selected_stock_depth = initial_task[j].depth;
		}
	}

	// take other stock
	for(var i=0; i<temporary_location.length; i++) {
		for(var j=0; j<initial_task.length; j++){
			if(temporary_location[i].stock_id == initial_task[j].stock_id) {
				original_location = initial_task[j].location;
				assigned_task.push({
					stock_id : initial_task[j].stock_id,
					current_location : initial_task[j].location,
					location : temporary_location[i].assigned_location,
					from_depth :initial_task[j].depth,
					depth : 0,
					status : "pick",
				});
				initial_task[j].location = temporary_location[i].assigned_location;
				initial_task[j].depth = 0;
			}
		}
	}

	// take selected stock to output port
	for(var j=0; j<initial_task.length; j++){
		if(selected_stock_id == initial_task[j].stock_id) {
			assigned_task.push({
				stock_id : initial_task[j].stock_id,
				current_location : initial_task[j].location,
				location : grid_data.output_port_location,
				from_depth :initial_task[j].depth,
				depth : 0,
				status : "pick_select",
			});
			initial_task[j].location = grid_data.output_port_location;
			initial_task[j].depth = 0;
		}
	}	

	// take other stock to put back the storage
	for(var i=temporary_location.length-1,k=selected_stock_depth; i>=0; k--, i--) {
		for(var j=0; j<initial_task.length; j++){
			if(temporary_location[i].stock_id == initial_task[j].stock_id) {
				assigned_task.push({
					stock_id : initial_task[j].stock_id,
					current_location : initial_task[j].location,
					location : original_location,
					from_depth :initial_task[j].depth,
					depth : k,
					status : "store",
				});				
			}
		}
	}
	console.log(assigned_task);

	return assigned_task;
}

function intermediate_reshuffling(check_got_item,selected_stock_id) {
	var temporary_location = reshuffling_location(check_got_item);
	var original_location;
	var selected_stock_depth = 0;

	for(var j=0; j<initial_task.length; j++){
		if(selected_stock_id == initial_task[j].stock_id) {
			selected_stock_depth = initial_task[j].depth;
		}
	}
			



	// take other stock
	for(var i=0; i<temporary_location.length; i++) {
		for(var j=0; j<initial_task.length; j++){
			if(temporary_location[i].stock_id == initial_task[j].stock_id) {
				original_location = initial_task[j].location;
				assigned_task.push({
					stock_id : initial_task[j].stock_id,
					current_location : initial_task[j].location,
					location : temporary_location[i].assigned_location,
					from_depth :initial_task[j].depth,
					depth : 0,
					status : "pick",
				});
				initial_task[j].location = temporary_location[i].assigned_location;
				initial_task[j].depth = 0;
			}
		}
	}

	//take selected stock to other place
	if(grid_data.grid_width >= grid_data.grid_length) {		//width
		for(var j=0; j<initial_task.length; j++){
			if(selected_stock_id == initial_task[j].stock_id) {
				if(initial_task[j].location%grid_data.length == 0) {
					assigned_task.push({
						stock_id : initial_task[j].stock_id,
						current_location : initial_task[j].location,
						location : initial_task[j].location-1,
						from_depth :initial_task[j].depth,
						depth : 0,
						status : "pick_select",
					});	
				initial_task[j].location = initial_task[j].location-1;
				initial_task[j].depth = 0;				
				}
				else {
					assigned_task.push({
						stock_id : initial_task[j].stock_id,
						current_location : initial_task[j].location,
						location : initial_task[j].location+1,
						from_depth :initial_task[j].depth,
						depth : 0,
						status : "pick_select",
					});
				}
				initial_task[j].location = initial_task[j].location+1;
				initial_task[j].depth = 0;
			}
		}
	}
	else {		//length
		for(var j=0; j<initial_task.length; j++){
			if(selected_stock_id == initial_task[j].stock_id) {
				if(initial_task[j].location+grid_data.width > grid_data.width*grid_data.length) {
					assigned_task.push({
						stock_id : initial_task[j].stock_id,
						current_location : initial_task[j].location,
						location : initial_task[j].location-grid_data.width,
						from_depth :initial_task[j].depth,
						depth : 0,
						status : "pick_select",
					});					
					initial_task[j].location = initial_task[j].location-grid_data.width;
					initial_task[j].depth = 0;
				}
				else {
					assigned_task.push({
						stock_id : initial_task[j].stock_id,
						current_location : initial_task[j].location,
						location : initial_task[j].location+grid_data.width,
						from_depth :initial_task[j].depth,
						depth : 0,
						status : "pick_select",
					});
					initial_task[j].location = initial_task[j].location+grid_data.width;
					initial_task[j].depth = 0;
				}
			}
		}
	}

	// take other stock to put back storage
	for(var i=temporary_location.length-1,k=selected_stock_depth; i>=0; k--, i--) {
		for(var j=0; j<initial_task.length; j++){
			if(temporary_location[i].stock_id == initial_task[j].stock_id) {
				assigned_task.push({
					stock_id : initial_task[j].stock_id,
					current_location : initial_task[j].location,
					location : original_location,
					from_depth :initial_task[j].depth,
					depth : k,
					status : "store",
				});				
			}
		}
	}

	//take the stock to the output port
	for(var j=0; j<initial_task.length; j++){
		if(selected_stock_id == initial_task[j].stock_id) {
			console.log(initial_task[j].location)
			assigned_task.push({
				stock_id : initial_task[j].stock_id,
				current_location : initial_task[j].location,
				location : grid_data.output_port_location,
				from_depth :initial_task[j].depth,
				depth : 0,
				status : "store",
			});
			initial_task[j].location = grid_data.output_port_location;
			initial_task[j].depth = 0;
		}
	}	

	return assigned_task;
}

function storing_item_to_storage(selected_stock_id) {
	for(var j=0; j<initial_task.length; j++){
		if(selected_stock_id == initial_task[j].stock_id) {

			assigned_task.push({
				stock_id : initial_task[j].stock_id,
				current_location : grid_data.input_port_location,
				location : initial_task[j].location,
				from_depth :0,
				depth : initial_task[j].depth,
				status : "store",
			});
		}
	}	

	return assigned_task;
}

////////////////////////////////
//		Set Point
////////////////////////////////

function set_point_for_pick(task,selected_item_id,special) {
	var near = 10000;
	var near_agv = [];
	var agv_index;
	path_with_time = [];
	path_with_time_used_in_stimulation = [];
	console.log(task)
	timer = Math.ceil(new Date().getTime()/1000);		//simple

	console.log(all_robot)

	if(special == "null") {
		for(var i=0; i<task.length; i++) {
			for(var j=0; j<initial_num_robot; j++) {		//assign current stock
				if(all_robot[j].availability == "yes") {

					var robot_xy_position = position_to_xy(all_robot[j].current_position);
					var task_xy_position = position_to_xy(task[0].location)

					var position_distance = heuristic(robot_xy_position,task_xy_position)
					
					if( position_distance < near) {
						near = position_distance;
						agv_index = j;
					}
				}
			}
			//all_robot[agv_index].availability == "no";

			near_agv.push({
				task_index : i,
				agv_index : agv_index,
				dist : near,
			})	
		}		
	}
	else if(special == "reshuffle") {
	//	for(var i=0; i<task.length; i++) {
			for(var j=0; j<initial_num_robot; j++) {		//assign current stock
				if(all_robot[j].availability == "yes") {

					var robot_xy_position = position_to_xy(all_robot[j].current_position);
					var task_xy_position = position_to_xy(task[0].location)

					var position_distance = heuristic(robot_xy_position,task_xy_position)
					
					if( position_distance < near) {
						near = position_distance;
						agv_index = j;
					}
				}
			}
			//all_robot[agv_index].availability == "no";

			near_agv.push({
				task_index : 0,
				agv_index : agv_index,
				dist : near,
			})	
	//	}	
	}
	else if(special == "store") {
		for(var j=0; j<initial_num_robot; j++) {		//assign current stock
			if(all_robot[j].availability == "yes") {

				var robot_xy_position = position_to_xy(all_robot[j].current_position);

				var position_distance = heuristic(robot_xy_position,position_to_xy(grid_data.input_port_location))
				
				if( position_distance < near) {
					near = position_distance;
					agv_index = j;
				}
			}
		}
		//all_robot[agv_index].availability == "no";

		near_agv.push({
			task_index : 0,
			agv_index : agv_index,
			dist : near,
		})		
	}

	console.log(near_agv)
	console.log(task)
	
	var current_time = Math.ceil(new Date().getTime()/1000);
	console.log(near_agv)

	if(special == "null") {
			task_index = near_agv[0].task_index;
			console.log(task_index)
			agv_index = near_agv[0].agv_index;

			// pick from robot current point to selected stock location
			put_robot_into_input_port(all_robot[agv_index].current_position,task[task_index].location,agv_index+1);
			all_robot[agv_index].availability = "no";
			var path = start_search(all_node[all_robot[agv_index].current_position-1],all_node[task[task_index].location-1],agv_index+1,current_time,current_path_algo,"first");
			//interval = setInterval(run_in_grid, 1000);	

			//pick the item 
			var waiting_time = Math.ceil(calculate_retrieve_and_store_time_in_one_stack(task[task_index].depth));
			console.log(waiting_time)
			//var waiting_time = 0;
			//interval = setInterval(run_in_grid(), 1000);

			for(var i=1; i<=waiting_time; i++) {
				path_with_time.push({
					robot: agv_index+1,
					id : xy_to_position(path_with_time[path_with_time.length-1].x,path_with_time[path_with_time.length-1].y),
					x : path_with_time[path_with_time.length-1].x,
					y : path_with_time[path_with_time.length-1].y,
					time : path_with_time[path_with_time.length-i].time+i,
				});		
			}

			console.log(path_with_time[path_with_time.length-1].time)
			all_robot[agv_index].current_position = task[task_index].location;

			// pick from selected stock location to output port location
			//put_robot_into_input_port(all_robot[agv_index].current_position,grid_data.output_port_location,agv_index+1);
			all_robot[agv_index].availability = "no";
			var paths = start_search(all_node[all_robot[agv_index].current_position-1],all_node[grid_data.output_port_location-1],agv_index+1,path_with_time[path_with_time.length-1].time+1,current_path_algo,"null");

			all_robot[agv_index].current_position = grid_data.output_port_location;
			first_back_position = xy_to_position(1,grid_data.grid_length-2)
			second_back_position = xy_to_position(grid_data.grid_width-2,grid_data.grid_length-2)
			console.log(agv_index)
			if(agv_index == 0) {
				console.log("aa")
				var pathss = start_search(all_node[all_robot[agv_index].current_position-1],all_node[first_back_position-1],agv_index+1,path_with_time[path_with_time.length-1].time+1,current_path_algo,"last");
				//var path = start_search(all_node[25-1],all_node[9-1],agv_index+1,path_with_time[path_with_time.length-1].time+1,current_path_algo,"last");
			}
			else if(agv_index == 1) {
				var pathss = start_search(all_node[all_robot[agv_index].current_position-1],all_node[second_back_position-1],agv_index+1,path_with_time[path_with_time.length-1].time+1,current_path_algo,"last");			
			}
			interval = setInterval(function() {run_in_grid(path)}, 500);			
	}
	else if(special == "reshuffle") {
		task_index = near_agv[0].task_index;
		agv_index = near_agv[0].agv_index;

		// pick from robot current point to selected stock location
		put_robot_into_input_port(all_robot[agv_index].current_position,task[task_index].current_location,agv_index+1);
		all_robot[agv_index].availability = "no";
		var path = start_search(all_node[all_robot[agv_index].current_position-1],all_node[task[task_index].current_location-1],agv_index+1,current_time,current_path_algo,"first");
		
		all_robot[agv_index].current_position = task[0].current_location;
		for(var i=0; i<task.length; i++) {
			var waiting_time = 0;
			//pick the item 
			console.log(task)
			if(task[i].status == "take" || task[i].status == "take_select" ) {
				waiting_time = Math.ceil(calculate_retrieve_and_store_time_in_one_stack(task[i].from_depth));
			}
			else if(task[i].status == "store") {
				waiting_time = Math.ceil(calculate_retrieve_and_store_time_in_one_stack(task[i].depth));
			}
			

			for(var j=1; j<=waiting_time; j++) {
				path_with_time.push({
					robot: agv_index+1,
					id : xy_to_position(path_with_time[path_with_time.length-1].x,path_with_time[path_with_time.length-1].y),
					x : path_with_time[path_with_time.length-1].x,
					y : path_with_time[path_with_time.length-1].y,
					time : path_with_time[path_with_time.length-j].time+j,
				});			
			}
		// send the item from this location to next location
		var path = start_search(all_node[all_robot[agv_index].current_position-1],all_node[task[i].location-1],agv_index+1,path_with_time[path_with_time.length-j].time+waiting_time+1,current_path_algo,"null");
		//path = start_search(all_node[10],all_node[0],agv_index+1,path_with_time[path_with_time.length-j].time+waiting_time+1,current_path_algo);
		
		all_robot[agv_index].current_position = task[i].location;
		//alert(task[i].location)
		if(i != task.length-1) {	
		console.log("wowo")	
			var path = start_search(all_node[all_robot[agv_index].current_position-1],all_node[task[i+1].current_location-1],agv_index+1,path_with_time[path_with_time.length-j].time+waiting_time+1,current_path_algo,"null");
			//var path = start_search(all_node[11],all_node[12],agv_index+1,path_with_time[path_with_time.length-j].time+waiting_time+1,current_path_algo);
			all_robot[agv_index].current_position = task[i+1].current_location;
			//alert(task[i].current_location)
		}		
	}
	//all_robot[agv_index].current_position = task[i].current_location;
	first_back_position = xy_to_position(1,grid_data.grid_length-2)
	second_back_position = xy_to_position(grid_data.grid_width-2,grid_data.grid_length-2)

	if(agv_index == 0) {
		var pathss = start_search(all_node[all_robot[agv_index].current_position-1],all_node[first_back_position-1],agv_index+1,path_with_time[path_with_time.length-1].time+1,current_path_algo,"last");
	}
	else if(agv_index == 1) {
		var pathss = start_search(all_node[all_robot[agv_index].current_position-1],all_node[second_back_position-1],agv_index+1,path_with_time[path_with_time.length-1].time+1,current_path_algo,"last");			
	}
	interval = setInterval(function() {run_in_grid(path)}, 500);

	console.log(path_with_time)

	console.log(metrics)
	//Createtable(metrics,"showData",null,"table",null)	
	}
	if(special == "store") {
			task_index = near_agv[0].task_index;
			agv_index = near_agv[0].agv_index;

			// pick from robot current point to selected stock location
			put_robot_into_input_port(all_robot[agv_index].current_position,task[task_index].location,agv_index+1);
			all_robot[agv_index].availability = "no";
			var path = start_search(all_node[all_robot[agv_index].current_position-1],all_node[grid_data.input_port_location-1],agv_index+1,current_time,current_path_algo,"first");
			//interval = setInterval(run_in_grid, 1000);	

			//pick the item at input port
			var waiting_time = Math.ceil(calculate_retrieve_and_store_time_in_one_stack(grid_data.grid_depth));
			console.log(waiting_time)
			//var waiting_time = 0;
			//interval = setInterval(run_in_grid(), 1000);

			for(var i=1; i<=waiting_time; i++) {
				path_with_time.push({
					robot: agv_index+1,
					id : xy_to_position(path_with_time[path_with_time.length-1].x,path_with_time[path_with_time.length-1].y),
					x : path_with_time[path_with_time.length-1].x,
					y : path_with_time[path_with_time.length-1].y,
					time : path_with_time[path_with_time.length-i].time+i,
				});		
			}

			console.log(path_with_time[path_with_time.length-1].time)
			all_robot[agv_index].current_position = grid_data.input_port_location;

			// pick from selected stock location to output port location
			//put_robot_into_input_port(all_robot[agv_index].current_position,grid_data.output_port_location,agv_index+1);
			all_robot[agv_index].availability = "no";
			var paths = start_search(all_node[all_robot[agv_index].current_position-1],all_node[task[task_index].location-1],agv_index+1,path_with_time[path_with_time.length-1].time+1,current_path_algo,"null");
	
			all_robot[agv_index].current_position = task[task_index].location;			
			first_back_position = xy_to_position(1,grid_data.grid_length-2)
			second_back_position = xy_to_position(grid_data.grid_width-2,grid_data.grid_length-2)

			if(agv_index == 0) {
				var pathss = start_search(all_node[all_robot[agv_index].current_position-1],all_node[first_back_position-1],agv_index+1,path_with_time[path_with_time.length-1].time+1,current_path_algo,"last");
			}
			else if(agv_index == 1) {
				var pathss = start_search(all_node[all_robot[agv_index].current_position-1],all_node[second_back_position-1],agv_index+1,path_with_time[path_with_time.length-1].time+1,current_path_algo,"last");			
			}
			
			interval = setInterval(function() {run_in_grid(path)}, 500);			
	}
}
function set_point() {
	console.log("hi")
	// var S = [6,11,16];
	// var D = [10,15,20];

	//var expression = document.getElementById("mySelect").selectedIndex+1;
		var expression = 1;

	var S = [];
	var D = [];

	S.push({	x : 0,	y : 1 });
	D.push({	x : 4,	y : 1 });

	var S_id,D_id;

	for(var i=0; i<all_node.length; i++) {
		if(all_node[i].x == S[0].x && all_node[i].y == S[0].y) {
			S_id = i+1;
		}

		if(all_node[i].x == D[0].x && all_node[i].y == D[0].y) {
			D_id = i+1;
		}
	}

  timer = Math.ceil(new Date().getTime()/1000);		//simple
  var pathss,pathsss,pathssss;
  var current_time = Math.ceil(new Date().getTime()/1000);
	//put_robot_into_input_port(25,21);	
	//start_search(all_node[24],all_node[20],2)

	var start_1 = 2
	var end_1 = 12

	var start_2 = 9
	var end_2 = 13

	for(var i=0; i<S.length; i++) {
		switch(expression) {
			case 1:
				//put_robot_into_input_port(3,23,1);
				//put_robot_into_input_port(18,3,2);
				
				put_robot_into_input_port(start_1,end_1,1);
				put_robot_into_input_port(start_2,end_2,2);

				//pathss = start_search(all_node[start_1-1],all_node[end_1-1],1,current_time,"dijkstra")
				//pathsss = start_search(all_node[start_2-1],all_node[end_2-1],2,current_time,"dijkstra")
				pathss = start_search(all_node[start_1-1],all_node[end_1-1],1,current_time,"astar","None")
				pathsss = start_search(all_node[start_2-1],all_node[end_2-1],2,current_time,"astar","None")
				//start_search(all_node[S_id],all_node[D_id],2)
				//pathsss = start_search(all_node[13],all_node[10],3,current_time)
				console.log(pathss)
				interval = setInterval(function() {run_in_grid(pathsss)}, 1500);
				

				break;
			}
		}

	// 		case 2:
	// 			put_robot_into_input_port(S_id,D_id);
	// 			put_robot_into_input_port(9,12);
	// 			put_robot_into_input_port(S_id+1,D_id+1);

	// 			start_search(all_node[S_id-1],all_node[D_id-1],1)
	// 			start_search(all_node[8],all_node[11],2)
	// 			start_search(all_node[S_id],all_node[D_id],3)

	// 			break;

	// 		case 3:
	// 			put_robot_into_input_port(S_id+1,D_id+1);
	// 			put_robot_into_input_port(9,12);
	// 			put_robot_into_input_port(S_id,D_id);

	// 			start_search(all_node[S_id],all_node[D_id],1)
	// 			start_search(all_node[8],all_node[11],2)
	// 			start_search(all_node[S_id-1],all_node[D_id-1],3)

	// 			break;

	// 		case 4:
	// 			put_robot_into_input_port(S_id+1,D_id+1);
	// 			put_robot_into_input_port(S_id,D_id);
	// 			put_robot_into_input_port(9,12);

	// 			start_search(all_node[S_id],all_node[D_id],1)
	// 			start_search(all_node[S_id-1],all_node[D_id-1],2)
	// 			start_search(all_node[8],all_node[11],3)

	// 			break;

	// 		case 5:
	// 			put_robot_into_input_port(9,12);
	// 			put_robot_into_input_port(S_id+1,D_id+1);
	// 			put_robot_into_input_port(S_id,D_id);

	// 			start_search(all_node[8],all_node[11],1)
	// 			start_search(all_node[S_id],all_node[D_id],2)
	// 			start_search(all_node[S_id-1],all_node[D_id-1],3)

	// 			break;

	// 		case 6:
	// 			put_robot_into_input_port(9,12);
	// 			put_robot_into_input_port(S_id,D_id);
	// 			put_robot_into_input_port(S_id+1,D_id+1);

	// 			start_search(all_node[8],all_node[11],1)
	// 			start_search(all_node[S_id-1],all_node[D_id-1],2)
	// 			start_search(all_node[S_id],all_node[D_id],3)

	// 			break;

	// 		case 7:
	// 			put_robot_into_input_port(6,10);
	// 			put_robot_into_input_port(10,6);
	// 			// put_robot_into_input_port(2,5);

	// 			start_search(all_node[5],all_node[9],1)
	// 			start_search(all_node[9],all_node[5],2)
	// 			// start_search(all_node[1],all_node[4],3)

	// 		break;

	// 		case 8:
	// 			put_robot_into_input_port(7,22)
	// 			put_robot_into_input_port(22,7)

	// 			start_search(all_node[6],all_node[21],1)
	// 			start_search(all_node[21],all_node[6],2)

	// 		break;

	// 		case 9:
	// 			put_robot_into_input_port(2,5)
	// 			put_robot_into_input_port(5,2)

	// 			start_search(all_node[1],all_node[4],1)
	// 			start_search(all_node[4],all_node[1],2)		

	// 		break;

	// 		default:
	// 			console.log("noting")
	// 	}
	// }

	//run_in_grid()
	console.log(metrics)

	sort_metrics(metrics)

	var test_metrics = metrics;

			for(var i=0; i<test_metrics.length; i++) {
				delete test_metrics[i]['path'];
				delete test_metrics[i]['search_time'];
			}

//	console.log(metrics[0].search_time+metrics[1].search_time)
	Createtable(test_metrics,"showData",null,"table",null)
}

////////////////////////////////
//		Path Metrics
////////////////////////////////

function sort_metrics(metric) {
	var metric_path = [];
	var metric_computational_time = 0;
	var metric_path_length = 0;
	var agv_id;
	var current_path_algo_id;

	for(var i=0; i<metric.length; i++) {
		metric_computational_time += metric[i].search_time;
		metric_path_length += metric[i].path_length;

		for(var j=0; j<metric[i].path.length; j++) {
			metric_path.push(metric[i].path[j].id);
		}
	}


	console.log(metric_path)
	console.log(metric_computational_time)
	console.log(metric_path_length)

	if(metric[0].AGV == 'AGV 1') {
		agv_id = 1;
	}
	else if(metric[0].AGV == 'AGV 2') {
		agv_id = 2;
	}
	console.log(current_path_algo)
	if(current_path_algo == "astar") {
		current_path_algo_id = 2;
	}
	else if(current_path_algo == "dijkstra") {
			current_path_algo_id = 1;	
	}
console.log(agv_id)
console.log(current_path_algo_id)
	$.ajax({
	    type: 'POST',
	    url: 'http://localhost:3031/test/addstatisticdata',

	    data: {
				statistic_id : statistic_data[statistic_data.length-1].statistic_id+1,
				path :JSON.stringify(metric_path),
				//path : metric_path,
				path_length : metric_path_length,
				computational_time : metric_computational_time,
				algorithm_id : current_path_algo_id,
				agv_id : agv_id,
	    },
	    success: function(data){
	      console.log("success post");
	    },
	    error: function(jqXHR, textStatus, errorThrown) {
	    	console.log(jqXHR);
	      console.log(textStatus, errorThrown);
	    } 
 	});
}

function calculate_path_length() {
	var path_length = [];
	for(var i=0; i<all_robot.length; i++) {
		var robot = all_robot[i];
		path_length.push(robot.find_path_length());
		console.log("Robot " + (i+1) + " : " + robot.find_path_length() + " units");
	}
}

////////////////////////////////
//		Storage Part
////////////////////////////////
function get_dataset() {        
	$.ajax({
    url:'http://localhost:3031/test/getallstockdata',
    type:'get',
    async :  false,
    
    success: function(data) {
  		stock_data = data;
    },
  	error: function(jqXHR, textStatus, errorThrown) {
    	console.log(textStatus, errorThrown);
    	alert("error get stock data");
    }
	});
	console.log(stock_data)
}

function calculate_duration(storing_stock) {

	var date_duration = [];
	var date1 = new Date(storing_stock.arrival_time);
	var date2 = new Date(storing_stock.export_time);

	var Difference_In_Time = date2.getTime() - date1.getTime();
	var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

	date_duration.push({
		stock_id : storing_stock.stock_id,
		duration : Difference_In_Days,
	});


	return date_duration;
}

function divide_zone() {
	var classes = [];
	var width = grid_data.grid_width;
	var row = [];
	var class_a = [];
	var class_b = [];
	var class_c = [];
	var class_a_b = [];
	var n_class_a = 0,n_class_b = 0,n_class_c = 0;

	//for(var i=0; i< parseInt(width))

	for(var i=0; i< parseInt(width); i++) {
		row.push(i+1);
	}

	if(width/3 == 1) {	//(1)	
		class_a.push(1);
		class_b.push(1);
		class_c.push(1);
	}

	else if(width/3 == 2) {	//(2)
		class_a.push(1);
		class_b.push(2);
		class_c.push(2);
	}

	else if(width%3 == 0) {	//balance for all class (3,6,9)
		n_class_a = width/3;
		n_class_b = width/3;
		n_class_c = width/3;
	}

	else if(width%3 == 1) {	//(4,7)
		n_class_a = Math.floor(width/3);
		n_class_b = Math.floor(width/3);
		n_class_c = width - n_class_a - n_class_b;
	}

	else if(width%3 == 2) {	//(5,8)
		n_class_a = Math.floor(width/3);
		n_class_b = Math.ceil(width/3);
		n_class_c = width - n_class_a - n_class_b;
	}

	var total_n_class = n_class_a + n_class_b + n_class_c;
	if(total_n_class != 0) {
		for(var i=0; i<n_class_a; i++) {
			class_a.push(i+1)
		}

		for(var i=0; i<n_class_b; i++) {
			class_b.push(n_class_a+i+1)
		}

		for(var i=0; i<n_class_c; i++) {
			class_c.push(n_class_a+n_class_b+i+1)
		}
	}

	console.log(class_a)
	console.log(class_b)
	console.log(class_c)

	classes.push({
		class_a : class_a,
		class_b : class_b,
		class_c : class_c
	});

	return classes;
}

function find_storage_index_with_location(location) {
	var index = [];

	for(var i=0; i<storage_data.length; i++) {
		if(xy_to_position(storage_data[i].x_axis,storage_data[i].y_axis) == location) {
		//if(storage_data[i].storage_id == location) {
			index.push(i+1);
		}
	}
	console.log(index)
	return index;
}

function check_location(stock_id,location) {
	var put_location = [];
	console.log(full_or_not)
	var found = false;

	for(var i=0; i<location.length; i++) {
		var storage_index = find_storage_index_with_location(location[i]);
		for(var j=0; j<full_or_not.length; j++) {
			if(!found) {
				if(location[i] == full_or_not[j].location) {
					if(full_or_not[j].stock.length != grid_data.grid_depth) {
						var stock_inside_depth = 5;
						for(var k=0; k=full_or_not[j].stock.length; k++) {
							stock_inside_depth--;
						}
						put_location.push({
							storage_id : storage_index[stock_inside_depth-1],
							location : full_or_not[j].location,
							depth : storage_data[storage_index[stock_inside_depth-1]-1].depth,
						})

						found = true;
					}
				}	
			}	
		}
	}
	return put_location;
}

function check_location_and_type(stock_id,location,type) {	
	var actual_location = [];	
	var stock_location_index = null;

	storage = storage_data;

	console.log(storage_data)

	//console.log(storage_index)
	for(var i=0; i<location.length; i++) {
		var storage_index = find_storage_index_with_location(location[i]);
				
		for(var j=depth; j>0; j--) {
			if(j == depth) {
				if(storage[storage_index[j-1]].availability == 'y' && storage[storage_index[j-1]].stock_id == null){
					if(stock_location_index == null) {
						stock_location_index = storage_index[j-1];
							storage[storage_index[j-1]].stock_id = stock_id;
							storage[storage_index[j-1]].stock_amount = stock_data[stock_id-1].stock_amount;
							storage[storage_index[j-1]].total_weight = stock_data[stock_id-1].stock_weight*stock_data[stock_id-1].stock_amount/1000;
							storage[storage_index[j-1]].availability = 'n';
					}
				}
			}
			else{
				if(storage[storage_index[j-1]].availability == 'y'){
					if(stock_location_index == null) {
						stock_location_index = storage_index[j-1];
						storage[storage_index[j-1]].stock_id = stock_id;
						storage[storage_index[j-1]].stock_amount = stock_data[stock_id-1].stock_amount;
						storage[storage_index[j-1]].total_weight = stock_data[stock_id-1].stock_weight*stock_data[stock_id-1].stock_amount/1000;
						storage[storage_index[j-1]].availability = 'n';
					}
				}
			}
		}
	}

	return stock_location_index;
}

function build_stack_with_button(id) {

	var grid_stack;
	var half_stock_per_stack = [];
	var stock_per_stack = [];
	var storage_id_range = [];

	for(var i=0; i<storage_data.length; i++) {
		if(xy_to_position(storage_data[i].x_axis,storage_data[i].y_axis) == id) {
			storage_id_range.push(storage_data[i].storage_id)
		}
	}

	var max = storage_id_range[storage_id_range.length-1];
	var min = storage_id_range[0];

	for(var i=0; i<stock_bin_data.length; i++) {
		if(stock_bin_data[i].storage_id >= min && stock_bin_data[i].storage_id <= max) {
			for(var j=0; j<storage_data.length; j++) {
				if(stock_bin_data[i].storage_id == storage_data[j].storage_id) {
					half_stock_per_stack.push({
						stock_id :stock_bin_data[i].stock_id,
					})
				}			
			}
		}
	}

	full_full_or_not.push({
		location :id,
		stock : half_stock_per_stack,
	});

	return full_full_or_not;
}

function check_whole_storage() {
	for(var i=0; i<grid_data.grid_width*grid_data.grid_length; i++) {
		full_or_not = build_stack_with_button(i+1)
	}
	console.log(full_or_not)
}

function find_all_class_location(classes,duration) {
	var all_class_location = [];
	var num_of_row = grid_data.grid_length;
	var num_of_column = grid_data.grid_width;

	if(duration == 1) {	// class a
		for(var i=0; i<classes.length; i++) {
			for(var j=0; j<num_of_row; j++) {
				all_class_location.push(((classes[i]-1)*num_of_column)+j+1)
			}			
		}
	}
	else if(duration == 2){	// class b
		for(var i=0; i<classes.length; i++) {
			for(var j=0; j<num_of_row; j++) {
				all_class_location.push(((classes[i]-1)*num_of_column)+j+1)
			}			
		}
	}
	else {	// class c
		for(var i=0; i<classes.length; i++) {
			for(var j=0; j<num_of_row; j++) {
				all_class_location.push(((classes[i]-1)*num_of_column)+j+1)
			}			
		}
	}

	for(var i=0; i<all_class_location.length; i++) {
		if(all_class_location[i] == grid_data.input_port_location || all_class_location[i] == grid_data.output_port_location) {
			all_class_location.splice(i,1);
		}
	}

	return all_class_location;
}

function assigning_stock(storing_stock_id) {
	var num_of_column = grid_data.grid_width;
	var storing_stock = [];
	var classes = divide_zone();
	var class_a = classes[0].class_a;
	var class_b = classes[0].class_b;
	var class_c = classes[0].class_c;
	var class_a_location = [];
	var class_b_location = [];
	var class_c_location = [];
	var find_put_location;

	for(var i=0; i<stock_data.length; i++) {
		if(stock_data[i].stock_id == storing_stock_id) {
			storing_stock = stock_data[i];
		}
	}
	var storing_stock_id_with_duration = calculate_duration(storing_stock);
	console.log(storing_stock_id_with_duration)
	//storing_stock_id_with_duration = 1;

	// console.log(storing_stock_id_with_duration)
	if(storing_stock_id_with_duration.duration == 1){
		var class_location = find_all_class_location(class_a,1);
		find_put_location = check_location(storing_stock_id_with_duration.stock_id,class_location)
		initial_task.push({
			stock_id : storing_stock_id,
			location :find_put_location[0].location,
			depth : find_put_location[0].depth,
		});		
	}
	else if(storing_stock_id_with_duration.duration == 2) {
		var class_location = find_all_class_location(class_b,1);
		find_put_location = check_location(storing_stock_id_with_duration.stock_id,class_location)
		initial_task.push({
			stock_id : storing_stock_id,
			location :find_put_location[0].location,
			depth : find_put_location[0].depth,
		});		
	}
	else {
		var class_location = find_all_class_location(class_c,1);
		find_put_location = check_location(storing_stock_id_with_duration.stock_id,class_location)
		initial_task.push({
			stock_id : storing_stock_id,
			location :find_put_location[0].location,
			depth : find_put_location[0].depth,
		});		
	}

		$.ajax({
    type: 'POST',
    url: 'http://localhost:3031/test/addstockbindata',

    data: {
  		stock_bin_id : stock_bin_data[stock_bin_data.length-1].stock_bin_id+1,
    	stock_id : storing_stock_id,
    	storage_id : find_put_location[0].storage_id,
    	stock_bin_code : stock_bin_data.length+1,
    },
    success: function(data){
      console.log("success post");
      console.log("The stock bin is added successfully")
    },
    error: function(jqXHR, textStatus, errorThrown) {
    	console.log(jqXHR);
      console.log(textStatus, errorThrown);
    } 
 	});

 	get_second_time()

	assigned_task = storing_item_to_storage(storing_stock_id);
	console.log(assigned_task)
	set_point_for_pick(assigned_task,storing_stock_id,"store");


}

function assign_stock(storing_stock_id) {
	var num_of_column = grid_data.grid_width;
	var storing_stock = [];
	var classes = divide_zone();
	var class_a = classes[0].class_a;
	var class_b = classes[0].class_b;
	var class_c = classes[0].class_c;
	var class_a_location = [];
	var class_b_location = [];
	var class_c_location = [];
	var ah = "s";

	for(var i=0; i<stock_data.length; i++) {
		if(stock_data[i].stock_id == storing_stock_id) {
			storing_stock = stock_data[i];
		}
	}

	var stock_id_with_duration = calculate_duration(storing_stock);

	for(var i=0;i<stock_id_with_duration.length;i++) {
		if(stock_id_with_duration[i].duration == 1){
			var class_location = find_all_class_location(class_a,1);
			var type = stock_data[stock_id_with_duration[i].stock_id-1].stock_type;
			var actual_location = check_location_and_type(stock_id_with_duration[i].stock_id,class_location,type);

			if(typeof(actual_location) == "number") {
				initial_task.push({
					stock_id : stock_id_with_duration[i].stock_id,
					//duration : stock_id_with_duration[i].duration,
					location : storage[actual_location].storage_id,
					depth : storage[actual_location].depth,
					amount : storage[actual_location].stock_amount,
					type : type,
				});			
			}
			else if(typeof(actual_location) == "object"){
				for(var j=0; j<actual_location.length; j++) {
					initial_task.push({
						stock_id : stock_id_with_duration[i].stock_id,
						//duration : stock_id_with_duration[i].duration,
						location : storage[actual_location[j].location].storage_id,
						depth : storage[actual_location[j].depth].depth,
						amount : actual_location[j].amount,
						type : type,
					});
				}			
			}
		}
		else if(stock_id_with_duration[i].duration == 2) {
			var class_location = find_all_class_location(class_b,2);
			var type = stock_data[stock_id_with_duration[i].stock_id-1].stock_type;
			var actual_location = check_location_and_type(stock_id_with_duration[i].stock_id,class_location,type);

			if(typeof(actual_location) == "number") {
				initial_task.push({
					stock_id : stock_id_with_duration[i].stock_id,
					//duration : stock_id_with_duration[i].duration,
					location : storage[actual_location].storage_id,
					depth : storage[actual_location].depth,
					amount : storage[actual_location].stock_amount,
					type : type,
				});			
			}
			else if(typeof(actual_location) == "object"){
				for(var j=0; j<actual_location.length; j++) {
					initial_task.push({
						stock_id : stock_id_with_duration[i].stock_id,
						//duration : stock_id_with_duration[i].duration,
						location : storage[actual_location[j].location].storage_id,
						depth : storage[actual_location[j].depth].depth,
						amount : actual_location[j].amount,
						type : type,
					});
				}			
			}
		}
		else {
			var class_location = find_all_class_location(class_c,3);
			var type = stock_data[stock_id_with_duration[i].stock_id-1].stock_type;
			var actual_location = check_location_and_type(stock_id_with_duration[i].stock_id,class_location,type);

			if(typeof(actual_location) == "number") {
				initial_task.push({
					stock_id : stock_id_with_duration[i].stock_id,
					//duration : stock_id_with_duration[i].duration,
					location : storage[actual_location].storage_id,
					depth : storage[actual_location].depth,
					amount : storage[actual_location].stock_amount,
					type : type,
				});			
			}
			else if(typeof(actual_location) == "object"){
				for(var j=0; j<actual_location.length; j++) {
					initial_task.push({
						stock_id : stock_id_with_duration[i].stock_id,
						//duration : stock_id_with_duration[i].duration,
						location : storage[actual_location[j].location].storage_id,
						depth : storage[actual_location[j].depth].depth,
						amount : actual_location[j].amount,
						type : type,
					});
				}			
			}
		}
	}

	console.log(initial_task);

	for(var i=0; i<initial_task.length; i++) {
		real_location_with_stock.push({
			stock_id : initial_task[i].stock_id,
			current_location : null,
			location : initial_task[i].location,
			depth : initial_task[i].depth,
			amount : initial_task[i].amount,
			type : initial_task[i].type,
		})
	}

	//draw_into_grid(real_location_with_stock);
}

////////////////////////////////
//	  Pick Item
////////////////////////////////

function check_upper_got_item(pick_item_id) {
	var storage_index = [];
	var storage_depth;
	var got_item = [];

	storage = storage_data

	for(var i=0; i<initial_task.length; i++) {
		if(initial_task[i].stock_id == pick_item_id){
			console.log(initial_task[i].location)
			storage_index = find_storage_index_with_location(initial_task[i].location)
			storage_depth = initial_task[i].depth;
		}
	}

	console.log(storage_depth)
	console.log(storage_index)

	for(var i=1; i<storage_depth; i++) {
		for(var j=0; j<stock_bin_data.length; j++) {
			if(storage[storage_index[storage_depth-1-i]].storage_id == stock_bin_data[j].storage_id) {
				got_item.push({
					stock_id : stock_bin_data[j].stock_id,
					depth : storage[storage_index[storage_depth-1-i]].depth,
				});
			}
		}
	}

	if(got_item.length == 0){
		got_item = null;
	}
	else {
		got_item.reverse();
	}

	console.log(got_item)
	return got_item;
}

function pick_item(item_id) {
	var stock;
	var stock_name;
	var stock_location;
	var check_got_item;
	var shuffling_method = current_reshuffle_algo; // default
	console.log(shuffling_method)

	var pick_item_id = item_id;

	console.log(pick_item_id)
	console.log(initial_task)

	for(var i=0; i<initial_task.length; i++) {
		if(initial_task[i].stock_id == pick_item_id){
			check_got_item = check_upper_got_item(pick_item_id);
			console.log(check_got_item)

			if(check_got_item == null) {		//upper no stock
		
				assigned_task.push({
					stock_id : initial_task[i].stock_id,
					location : initial_task[i].location,
					depth : initial_task[i].depth,
					amount : initial_task[i].amount,
					type : initial_task[i].type,
				});		
				if(assigned_task != null) {
					set_point_for_pick(assigned_task,pick_item_id,"null");	
				}
			}
			else {		//upper got stock
				var next = 1;
				if(shuffling_method == "intermediate") { 
					assigned_task = intermediate_reshuffling(check_got_item,pick_item_id);
					set_point_for_pick(assigned_task,pick_item_id,"reshuffle");
				}
				else if(shuffling_method == "delaying") { 
							console.log("aaaaa")
					assigned_task = delaying_reshuffling(check_got_item,pick_item_id);
					set_point_for_pick(assigned_task,pick_item_id,"reshuffle");
				}
			}
		}
	}	
}

function hi(i,r_i) {

		robot_id=r_i;
		id=i;
		document.getElementById((i).toString()).innerHTML ="PO" +'<div><span class="got-robot" style="background-color:'+color[robot_id-1]+';"><div>'+robot_id+'</div></span></div>';
}

function receive_picking_stock() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	picking_stock_id = urlParams.get('picking_id')

	if(picking_stock_id != null) {
		pick_item(picking_stock_id)
	}
}

function receive_storing_stock() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	storing_stock_id = urlParams.get('storing_id')

	if(storing_stock_id != null) {
		assigning_stock(storing_stock_id)
	}
}

function add_current_location_robot() {
	for(var i=0; i<agv_data.length; i++) {
		var point = position_to_xy(agv_data[i].current_pos)
		console.log(point)
		draw_path(point.x,point.y,agv_data[i].agv_id);
	}
}

function initial_task_assign() {

	for(var i=0; i<stock_bin_data.length; i++) {
		for(var j=0; j<storage_data.length; j++) {
			if(stock_bin_data[i].storage_id == storage_data[j].storage_id) {
				initial_task.push({
					stock_id : stock_bin_data[i].stock_id,
					location : xy_to_position(storage_data[j].x_axis,storage_data[j].y_axis),
					depth : storage_data[j].depth,
				})
			}
		}
	}
	console.log(initial_task)
}

////////////////////////////////
//		System ready to start
////////////////////////////////

function RunAllFunction() {
	get_initial_data();
	build_pallets();
	create_grid();
	createRobot();
	get_dataset();
	all_storage();
	initial_task_assign();
	check_whole_storage();
	//assign_stock();
	receive_picking_stock();
	receive_storing_stock();
	//position_to_xy(11)
	//add_current_location_robot();
	set_point();

	//assigning_stock(1)
}


RunAllFunction();
