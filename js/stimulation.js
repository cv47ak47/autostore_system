////////////////////////////////////
//		Testing
////////////////////////////////////

////////////////////////////////////
//		Local Storage Variable
////////////////////////////////////
var depth = 5;
var bin_height = 0.3;
var retrieve_velocity = 1.6;

////////////////////////////////////
//		Initialization
////////////////////////////////////

var initial_num_robot = 3;
var initial_count = 0;
var initial_status = "stop";
var initial_input_port = 1;
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

var grid_data;
var agv_data;

////////////////////////////////////
//		Initial Variable From DB
////////////////////////////////////

function get_initial_data() {
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	// get grid data
	$.ajax({
    type: 'GET',
    url: "http://localhost:3031/test/getgriddata/" +supervisor_id ,
    async :  false,
    success: function(data){
			console.log(data)
			grid_data = data;
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
      alert("error get");
    } 
  });

	$.ajax({
    type: 'GET',
    url: " http://localhost:3031/test/getallagvdata" ,
    async :  false,
    success: function(data){
			agv_data = data;
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

function check_duplicate_path(path, temporary_path) {
	var duplicate_path = [];
  for (var i = 0; i < temporary_path.length; i++) {
    for (var j = 0; j < path.length; j++) {
      if ((temporary_path[i].x == path[j].x && temporary_path[i].y == path[j].y) && temporary_path[i].time == path[j].time) {
        duplicate_path.push(temporary_path[i])
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
	  var path_collision_index,temporary_path_collision_index;
	  for (var i = 0; i < temporary_path.length; i++) {
	    for (var j = 0; j < path.length; j++) {
	      if ((temporary_path[i].x == path[j].x && temporary_path[i].y == path[j].y) && temporary_path[i].time == path[j].time) {
	        temporary_path_collision_index = i;
	        path_collision_index = j;
	      } 
	    }
	  }

	  if(temporary_path[temporary_path_collision_index-1].x == path[path_collision_index-1].x) {
	  	return "x_axis";
	  }
	  else if(temporary_path[temporary_path_collision_index-1].y == path[path_collision_index-1].y) {
	  	return "y_axis";
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

	var col = [];
    for (var i = 0; i < data.length; i++) {      
      for (var key in data[i]) {        
        if (col.indexOf(key) === -1) { 
            col.push(key);
        }
      }
    } 
    console.log("a")

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
	    }
	  }

	  // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
	  var divContainer = document.getElementById(table_location);
	  //divContainer.innerHTML = "";

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
		var current_position = initial_input_port;
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
	console.log(color)
	//document.getElementById(id.toString()).style.backgroundColor = color;
}

function cancel_path(x,y,robot) {
	for(var i=0 ; i<all_node.length ; i++) { 
		if(all_node[i].x == x && all_node[i].y == y) {
			console.log(document.getElementById((i+1).toString()));
			if(document.getElementById((i+1).toString()).getAttribute("robot") == "no"){
				//document.getElementById((i+1).toString()).innerHTML = "["+x+"]["+y+"]";
				document.getElementById((i+1).toString()).innerHTML = (i+1).toString() +'<div><span class="no-robot"></span></div>';
				document.getElementById((i+1).toString()).innerHTML +='<div><button class="stock_button" onclick="build_stack_with_button('+ all_node[i].id +')">Stock</button></div>';
			}			
			else if(document.getElementById((i+1).toString()).getAttribute("robot") != color[robot-1]){
				document.getElementById((i+1).toString()).innerHTML = "["+x+"]["+y+"]";
				document.getElementById((i+1).toString()).innerHTML +='<div><button class="stock_button" onclick="build_stack_with_button('+ all_node[i].id +')">Stock</button></div>';
				set_output_port(i+1,document.getElementById((i+1).toString()).getAttribute("robot"));

			}		
		}
	}
}

function draw_path(x,y,robot_id) {
	console.log(robot_id)
	for(var i=0 ; i<all_node.length ; i++) { 
		if(all_node[i].x == x && all_node[i].y == y) {
			if(i+1 == 5) {
				document.getElementById((i+1).toString()).innerHTML = "input port" +'<div><span class="got-robot" style="background-color:'+color[robot_id-1]+';"><div>'+robot_id+'</div></span></div>';
				document.getElementById((i+1).toString()).innerHTML +='<div><button class="stock_button" onclick="build_stack_with_button('+ all_node[i].id +')">Stock</button></div>';	
			}
			else if(i==25){
				document.getElementById((i+1).toString()).innerHTML = "output port" +'<div><span class="got-robot" style="background-color:'+color[robot_id-1]+';"><div>'+robot_id+'</div></span></div>';
				document.getElementById((i+1).toString()).innerHTML +='<div><button class="stock_button" onclick="build_stack_with_button('+ all_node[i].id +')">Stock</button></div>';		
			}
			else {
				document.getElementById((i+1).toString()).innerHTML = (i+1).toString() +'<div><span class="got-robot" style="background-color:'+color[robot_id-1]+';"><div>'+robot_id+'</div></span></div>';
				document.getElementById((i+1).toString()).innerHTML +='<div><button class="stock_button" onclick="build_stack_with_button('+ all_node[i].id +')">Stock</button></div>';		
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

function build_stack_with_button(id) {

	var grid_stack;
	var stock_per_stack = [];
	var stock = document.getElementById("stock");
	console.log(stock)

	if(stock.getAttribute("value") == "yes") {
		$('#stock div').remove();
	}

	for(var i=0; i<real_location_with_stock.length; i++) {
		if(real_location_with_stock[i].location == id) {
			stock_per_stack.push({
				depth : real_location_with_stock[i].depth,
				stock_id :real_location_with_stock[i].stock_id,
			})
		}
	}
	stock_per_stack.reverse(); //from lower depth to deeper

	document.getElementById("view_stock").style.display = 'block';

	for(var i=0; i<depth; i++) {

		grid_stack = document.createElement('div');
		grid_stack.setAttribute("id","grid_stack"+id.toString()+(i+1).toString());
		grid_stack.setAttribute("class", "stock_grid");
		grid_stack.setAttribute("value",i+1);
		grid_stack.setAttribute("item","no");

		document.getElementById("stock").setAttribute("value","yes")
		document.getElementById("stock").appendChild(grid_stack);
	}

	for(var i=0; i<stock_per_stack.length; i++) {
		for(var j=0; j<depth; j++) {
			if(stock_per_stack[i].depth == document.getElementById("grid_stack"+id.toString()+(j+1)).getAttribute("value")) {
				document.getElementById("grid_stack"+id.toString()+(j+1).toString()).innerHTML += stock_per_stack[i].stock_id;
				document.getElementById("grid_stack"+id.toString()+(j+1)).setAttribute("item","yes");
				break;
			}
			else if(document.getElementById("grid_stack"+id.toString()+(j+1)).getAttribute("item")=="no"){
				$('#grid_stack'+id.toString()+(j+1).toString() + ' div').remove();
				//document.getElementById("grid_stack"+id.toString()+(j+1).toString())
				document.getElementById("grid_stack"+id.toString()+(j+1).toString()).innerHTML += '<div class = "no-robot"></div>';
			}
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
			var id = id_count+i-1+(num_of_columns_of_pallets*(j-1));

			grid.setAttribute("id", id)
			//grid.setAttribute("id", id_count++);
			grid.setAttribute("class","grid-item");
			grid.setAttribute("value", i.toString() + rowcolsum_with_zero);
			grid.setAttribute("x", (j-1).toString());
			grid.setAttribute("y", (i-1).toString());
			grid.setAttribute("robot", "no");
			grid.setAttribute("port", "no");
			//grid.innerHTML = i.toString() + rowcolsum_with_zero +'<div><span class="no-robot"></span></div>'; //放101,201这样
			grid.innerHTML = (id).toString() +'<div><span class="no-robot"></span></div>'; //放101,201这样
			grid.innerHTML += '<div><button class="stock_button" onclick="build_stack_with_button('+ id +')">Stock</button></div>'		

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

// Grid Cnonfiguration

function change_grid() {
	document.getElementById("change_grid_size").style.display = "block";
}

function change_grid_size(event) {
	event.preventDefault();

	var specific_grid_info;
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	var selected_grid_length = event.target['grid_length_input'].value;
	var selected_grid_width = event.target['grid_width_input'].value;
	var selected_grid_depth = event.target['grid_depth_input'].value;

	if(selected_grid_length > 10 || selected_grid_length < 1) {
		alert("the value of grid length must be between 1 to 10");
		location.reload();
	}	
	else if(selected_grid_width > 10 || selected_grid_width < 1) {
		alert("the value of grid width must be between 1 to 10");
		location.reload();
	}
	else if(selected_grid_depth > 5 || selected_grid_depth < 1) {
		alert("the value of grid depth must be between 1 to 5");
		location.reload();		
	}

	$.ajax({
	    type: 'POST',
	    url: 'http://localhost:3031/test/updategriddata',
	    data: {
	      grid_depth : grid_data.grid_depth, 
	      grid_length : selected_grid_length,
	      grid_width : selected_grid_width,
	      input_port_location : grid_data.input_port_location,
	      output_port_location : grid_data.output_port_location,
	      supervisor_id : supervisor_id,
	    },
	    success: function(data){
	    	console.log(data);
	      console.log("success post");
	    },
	    error: function(jqXHR, textStatus, errorThrown) {
	    	console.log(jqXHR);
	      console.log(textStatus, errorThrown);
	      //alert("error post");
	    } 
	 	});
	location.reload();
	build_pallets();
}

function change_port() {
	
	var input_option = [];
	var output_option = [];

	var num_of_rows_of_pallets = grid_data.grid_length;
	var num_of_columns_of_pallets = grid_data.grid_width;

	document.getElementById("change_port").style.display = "block";

	console.log(all_node)
	
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
		alert("the input port and output cannot be the same location");
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
	    	console.log(data);
	      console.log("success post");
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

function change_algorithm() {
	var algorithm_data;
	var changed_algo = null;
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	$.ajax({
    type: 'GET',
    url: 'http://localhost:3031/test/getalgodata' + supervisor_id,

    success: function(data){
      algorithm_data = data;
    },
    error: function(jqXHR, textStatus, errorThrown) {
    	console.log(jqXHR);
      console.log(textStatus, errorThrown);
    } 
 	});

 	console.log(algorithm_data)

 	//get changed data from frontend
 	//changed_algo = 

 	$.ajax({
    type: 'POST',
    url: 'http://localhost:3031/test/updatealgodata',
    data: {
      algorithm_name : changed_algo, 
      algorithm_type : algorithm_data.algorithm_type,
      implementation : 'y',
      supervisor_id : supervisor_id,
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

function run_in_grid() {
	console.log(path_with_time_used_in_stimulation)
	for(var i=0; i<path_with_time_used_in_stimulation.length; i++) {
		if(path_with_time_used_in_stimulation[i].time == timer-1) {
			cancel_path(path_with_time_used_in_stimulation[i].x,path_with_time_used_in_stimulation[i].y,path_with_time_used_in_stimulation[i].robot)
		}
	}

	for(var i=0; i<path_with_time_used_in_stimulation.length; i++) {
		if(path_with_time_used_in_stimulation[i].time == timer) {
			draw_path(path_with_time_used_in_stimulation[i].x,path_with_time_used_in_stimulation[i].y,path_with_time_used_in_stimulation[i].robot)
		}
	}

	timer++;

	if(path_with_time_used_in_stimulation.length < timer){
		clearInterval(interval)
	}
}

// function store_item_page() {
// 	var modal = document.getElementById("myModal");
// 	var sidebar = document.getElementsByClassName("sidebar");
// 	var span = document.getElementsByClassName("close")[0];

// 	modal.style.display = "block";

// 	span.onclick = function() {
//   	modal.style.display = "none";
// 	}

// 	window.onclick = function(event) {
// 	  if (event.target == modal) {
// 	    modal.style.display = "none";
// 	  }
// 	}
// }

// function store_item() {
// 	alert("Storing Item");
// 	localStorage.setItem("store_location",null);
// 	var store_location = window.localStorage.getItem("store_location");
// 	var count = 0;

// 	if((store_location == null || store_location == "null") || (store_location == null || store_location == "null")) {
// 		store_location = prompt("Please enter the input location :");
// 		for(var i=0; i<document.getElementsByClassName("grid-item").length ; i++) {
// 			if(id_and_location[i].value == store_location) {
// 				localStorage.setItem("store_location",store_location); 
// 				count++;
// 			} 
// 		}		
// 		if(store_location = null || store_location == "") {
// 			alert("Number of rows cannot be null");
// 			return false;
// 		}
// 		if(count==0) {
// 			alert("Number is not exist");
// 			return false;
// 		}
// 	}

// 	var store_location = window.localStorage.getItem("store_location");
// 	//id_and_location

// 	var store_location_row_column = find_row_and_column(store_location);
// 	var store_row = store_location_row_column[0].row;
// 	var store_col = store_location_row_column[0].col; 

// 	for(var i=0; i<document.getElementsByClassName("grid-item").length ; i++) {
// 		if(id_and_location[i].value == store_location) {
// 			document.getElementById(id_and_location[i].id.toString()).innerHTML = id_and_location[i].id + '<span class="robot-final-destination"></span>';
// 		} 
// 	}		
// 	build_path(store_col, store_row,store_location)
// }

// function build_path(store_col, store_row, store_location) {
// 	var input_id,output_id;
// 	var input_location, output_location;
// 	var input_location_col, input_location_row;
// 	var output_location_col, output_location_row;
// 	var time_unit_count = 0;

// 	for(var i=0; i<id_and_location.length;i++) {
// 		if(id_and_location[i].function == "PI") {	
// 			input_location = parseInt(id_and_location[i].value); 
// 			input_id = parseInt(id_and_location[i].id);
// 		}
// 		else if(id_and_location[i].function == "PO") { 
// 			output_location = parseInt(id_and_location[i].value); 
// 			output_id = parseInt(id_and_location[i].id);
// 		}
// 	}

// 	var num_of_rows_of_pallets = parseInt(window.localStorage.getItem("num_of_rows_of_pallets"));
// 	var num_of_columns_of_pallets = parseInt(window.localStorage.getItem("num_of_columns_of_pallets"));

// 	var input_location = find_row_and_column(input_location);		// find PI location
// 	input_location_col = input_location[0].col;
// 	input_location_row = input_location[0].row;

// 	var output_location = find_row_and_column(output_location);	// find PO location
// 	output_location_col = output_location[0].col;
// 	output_location_row = output_location[0].row;

// 	// console.log(input_id)
// 	// console.log(store_col)
// 	// console.log(input_location_col)
// 	// console.log(num_of_columns_of_pallets)

// 	//alert("store_row : " + store_row + " , store_column : " + store_col + "\n" + "input_row : " + input_location_row + " , input_column : " + input_location_col);

// 	if(store_col-input_location_col >= 0) {			//right-hand-side
// 		if((store_col-input_location_col)>=0 && (store_row-input_location_row)>=0) { // right-down-side
// 			if((store_col-input_location_col)>(store_row-input_location_row)) {		// right-down-side( row > column )
// 				var location_id;
// 				for(var i=0, j=input_id+1 ; i<store_col-input_location_col ; i++,j++) {		//row		
// 					document.getElementById(j.toString()).innerHTML = id_and_location[j-1].value + '<div><span class="got-robot"></span></div>';
// 					time_unit_count++;
// 				}
// 				//console.log(input_id+store_col-input_location_col+num_of_columns_of_pallets)
// 				for(var i=0, j=input_id+store_col-input_location_col+num_of_columns_of_pallets ; i<store_row-input_location_row ; i++) {	//column
// 					document.getElementById(j.toString()).innerHTML = id_and_location[j-1].value + '<div><span class="got-robot"></span></div>';
// 					location_id = j
// 					j= j+num_of_columns_of_pallets;
// 					time_unit_count++;
// 				}
// 				for(var i=0; i<document.getElementsByClassName("grid-item").length ; i++) {
// 					if(id_and_location[i].value == store_location) {
// 						document.getElementById(id_and_location[i].id.toString()).innerHTML = store_location + '<div><span class="robot-final-destination"></span></div>';
// 					} 
// 				}		
// 				console.log("Step : " + time_unit_count)
// 				if(time_unit_count == 1) { document.getElementById("time-unit").innerHTML = time_unit_count + " unit" ;}
// 				else { document.getElementById("time-unit").innerHTML = time_unit_count + " units" ;}			

// 			} else {	// right-down-side( column > row )
// 				for(var i=0, j=input_id+num_of_columns_of_pallets ; i<store_row-input_location_row ; i++) {		//column
// 					document.getElementById(j.toString()).innerHTML = id_and_location[j-1].value + '<div><span class="got-robot"></span></div>';
// 					j= j+num_of_columns_of_pallets;
// 					time_unit_count++;
// 				}
// 				for(var i=0, j=input_id+((store_row-input_location_row)*num_of_columns_of_pallets) ; i<store_col-input_location_col ; i++,j++) {	// row
// 					document.getElementById(j.toString()).innerHTML = id_and_location[j-1].value + '<div><span class="got-robot"></span></div>';
// 					time_unit_count++;
// 				}
// 				for(var i=0; i<document.getElementsByClassName("grid-item").length ; i++) {
// 					if(id_and_location[i].value == store_location) {
// 						document.getElementById(id_and_location[i].id.toString()).innerHTML = '<div>Storing</div>' + '<span class="robot-final-destination"></span>';
// 					} 
// 				}	
// 				console.log("Step : " + time_unit_count)
// 				if(time_unit_count == 1) { document.getElementById("time-unit").innerHTML = time_unit_count + " unit" ;}
// 				else { document.getElementById("time-unit").innerHTML = time_unit_count + " units" ;}
// 			}
// 		} else if((store_col-input_location_col)>=0 && (store_row-input_location_row)<=0) {	// right-up-side
// 			if((store_col-input_location_col)>Math.abs(store_row-input_location_row)) {		// right-up-side( column > row )
// 				for(var i=0, j=input_id+1 ; i<store_col-input_location_col ; i++,j++) {		//column		
// 					document.getElementById(j.toString()).innerHTML = id_and_location[j-1].value + '<div><span class="got-robot"></span></div>';
// 					time_unit_count++;
// 				}
// 				//console.log(input_id+store_col-input_location_col+num_of_columns_of_pallets);
// 				for(var i=0, j=input_id+store_col-input_location_col-num_of_columns_of_pallets ; i<Math.abs(store_row-input_location_row) ; i++) {	//row
// 					document.getElementById(j.toString()).innerHTML = id_and_location[j-1].value + '<div><span class="got-robot"></span></div>';
// 					j= j-num_of_columns_of_pallets;
// 					time_unit_count++;
// 				}
// 				console.log("Step : " + time_unit_count)
// 				if(time_unit_count == 1) { document.getElementById("time-unit").innerHTML = time_unit_count + " unit" ;}
// 				else { document.getElementById("time-unit").innerHTML = time_unit_count + " units" ;}			
// 			}
// 			else {	// right-up-side( row > column )
// 				for(var i=0, j=input_id-num_of_columns_of_pallets ; i<Math.abs(store_row-input_location_row) ; i++) {		//row
// 					document.getElementById(j.toString()).innerHTML = id_and_location[j-1].value + '<div><span class="got-robot"></span></div>';
// 					j= j-num_of_columns_of_pallets;
// 					time_unit_count++;
// 				}
// 				for(var i=0, j=input_id+((store_row-input_location_row)*num_of_columns_of_pallets) ; i<store_col-input_location_col ; i++,j++) {	// column
// 					document.getElementById(j.toString()).innerHTML = id_and_location[j-1].value + '<div><span class="got-robot"></span></div>';
// 					time_unit_count++;
// 				}
// 				console.log("Step : " + time_unit_count)
// 				if(time_unit_count == 1) { document.getElementById("time-unit").innerHTML = time_unit_count + " unit" ;}
// 				else { document.getElementById("time-unit").innerHTML = time_unit_count + " units" ;}
// 			}
// 		}
// 	}
// }

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

function check_obstacle(start,end,path,robot) {
	console.log(path)

	var num_of_rows_of_pallets = window.localStorage.getItem("num_of_rows_of_pallets");
	var num_of_columns_of_pallets = window.localStorage.getItem("num_of_columns_of_pallets");

	var temporary_path = [];
	var temporary_path_time = 0;

	temporary_path.push({
		robot : robot,
		x : start.x,
		y : start.y,
		time: temporary_path_time
	})

	temporary_path_time++;

	for(var i=0;i<path.length; i++) {
		temporary_path.push({
			robot : robot,
			x : path[i].x,
			y : path[i].y,
			time: temporary_path_time
		})
		temporary_path_time++;
	}

	console.log(temporary_path)

	do{
		var check_swap_collision;
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

				var modified_path = search(graph[0],start,end,"closest");
				//console.log(modified_path)
				check_obstacle(start,end,modified_path,robot)
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

				var modified_path = search(graph[0],start,end,"closest");
				//console.log(modified_path)
				check_obstacle(start,end,modified_path,robot)
				//check_duplicate = null;
				return ;
			}

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

				var modified_path = search(graph[0],start,end,"closest");
				//console.log(modified_path)
				check_obstacle(start,end,modified_path,robot)
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

				var modified_path = search(graph[0],start,end,"closest");
				//console.log(modified_path)
				check_obstacle(start,end,modified_path,robot)
				//check_duplicate = null;
				return ;
			}
		}

		console.log(check_duplicate)
	}while(check_duplicate != null)

	console.log("come out")

	for(var i=0;i<temporary_path.length; i++) {
		path_with_time.push({
			robot : temporary_path[i].robot,
			x : temporary_path[i].x,
			y : temporary_path[i].y,
			time: temporary_path[i].time,
		})

		path_with_time_used_in_stimulation.push({
			robot : temporary_path[i].robot,
			x : temporary_path[i].x,
			y : temporary_path[i].y,
			time: temporary_path[i].time,
		})
	}
}

function search(grid, start, end, option) {
		console.log(grid)
		var closest;

		if(closest == option) {
			closest = true;
		}

		cleanDirty(grid);
		console.log(grid)

		var openHeap = getHeap()

	  var closestNode = start; // set the start node to be the closest if required

		start.h = heuristic(start,end);

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
	            neighbor.h = neighbor.h || heuristic(neighbor, end);
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

function start_search(start,end,robot) {
	for(var i=0; i<all_node.length; i++) {
		clean_node(all_node[i]);
	}

	var start_time = new Date().getTime();
	var path = search(graph[0],start,end,"closest");

	var final_time = new Date().getTime();
	var duration = (final_time-start_time).toFixed(2);
	//var duration = final_time-start_time;

	check_obstacle(start,end,path,robot)

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
  		time : count-1,
  	});
  	console.log("search took " + duration + "ms.")
  }
  
  console.log(path_with_time);	
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
function intermediate_reshuffling(check_got_item,selected_stock_id) {
	var temporary_location = reshuffling_location(check_got_item);
	var original_location;

	// take other stock
	for(var i=0; i<temporary_location.length; i++) {
		for(var j=0; j<initial_task.length; j++){
			if(temporary_location[i].stock_id == initial_task[j].stock_id) {
				original_location = initial_task[j].location;
				assigned_task.push({
					stock_id : initial_task[j].stock_id,
					current_location : initial_task[j].location,
					location : temporary_location[i].assigned_location,
					depth : 0,
					amount : initial_task[j].amount,
					type : initial_task[j].type,
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
				depth : 0,
				amount : initial_task[j].amount,
				type : initial_task[j].type,
			});
			initial_task[j].location = grid_data.output_port_location;
			initial_task[j].depth = 0;
		}
	}	

	// take other stock to put back the storage
	for(var i=temporary_location.length-1,k=grid_data.grid_depth; i>=0; k--, i--) {
		for(var j=0; j<initial_task.length; j++){
			if(temporary_location[i].stock_id == initial_task[j].stock_id) {
				assigned_task.push({
					stock_id : initial_task[j].stock_id,
					current_location : initial_task[j].location,
					location : original_location,
					depth : k,
					amount : initial_task[j].amount,
					type : initial_task[j].type,
				});				
			}
		}
	}
}

function delay_reshuffling(check_got_item,selected_stock_id) {
	var temporary_location = reshuffling_location(check_got_item);
	var original_location;

	// take other stock
	for(var i=0; i<temporary_location.length; i++) {
		for(var j=0; j<initial_task.length; j++){
			if(temporary_location[i].stock_id == initial_task[j].stock_id) {
				original_location = initial_task[j].location;
				assigned_task.push({
					stock_id : initial_task[j].stock_id,
					current_location : initial_task[j].location,
					location : temporary_location[i].assigned_location,
					depth : 0,
					amount : initial_task[j].amount,
					type : initial_task[j].type,
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
						depth : 0,
						amount : initial_task[j].amount,
						type : initial_task[j].type,
					});	
				initial_task[j].location = initial_task[j].location-1;
				initial_task[j].depth = 0;				
				}
				else {
					assigned_task.push({
						stock_id : initial_task[j].stock_id,
						current_location : initial_task[j].location,
						location : initial_task[j].location+1,
						depth : 0,
						amount : initial_task[j].amount,
						type : initial_task[j].type,
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
						depth : 0,
						amount : initial_task[j].amount,
						type : initial_task[j].type,
					});					
					initial_task[j].location = initial_task[j].location-grid_data.width;
					initial_task[j].depth = 0;
				}
				else {
					assigned_task.push({
						stock_id : initial_task[j].stock_id,
						current_location : initial_task[j].location,
						location : initial_task[j].location+grid_data.width,
						depth : 0,
						amount : initial_task[j].amount,
						type : initial_task[j].type,
					});
					initial_task[j].location = initial_task[j].location+grid_data.width;
					initial_task[j].depth = 0;
				}
			}
		}
	}

	// take other stock to put back storage
	for(var i=temporary_location.length-1,k=grid_data.grid_depth; i>=0; k--, i--) {
		for(var j=0; j<initial_task.length; j++){
			if(temporary_location[i].stock_id == initial_task[j].stock_id) {
				assigned_task.push({
					stock_id : initial_task[j].stock_id,
					current_location : initial_task[j].location,
					location : original_location,
					depth : k,
					amount : initial_task[j].amount,
					type : initial_task[j].type,
				});				
			}
		}
	}

	// take the stock to the output port
	for(var j=0; j<initial_task.length; j++){
		if(selected_stock_id == initial_task[j].stock_id) {
			assigned_task.push({
				stock_id : initial_task[j].stock_id,
				current_location : initial_task[j].location,
				location : grid_data.output_port_location,
				depth : 0,
				amount : initial_task[j].amount,
				type : initial_task[j].type,
			});
			initial_task[j].location = grid_data.output_port_location;
			initial_task[j].depth = 0;
		}
	}	
}

////////////////////////////////
//		Set Point
////////////////////////////////

function set_point_for_pick(task) {
	path_with_time = [];
	path_with_time_used_in_stimulation = [];
	console.log(task)
	timer = 0;		//simple

	for(var i=0; i<initial_num_robot; i++) {		//assign current stock
		if(all_robot[i].availability == "yes") {
			put_robot_into_input_port(all_robot[i].current_position,task[0].location,i+1);
			all_robot[i].availability = "no";
			console.log(all_node[task[0].location])
			start_search(all_node[all_robot[i].current_position-1],all_node[task[0].location-1],i+1);

			interval = setInterval(run_in_grid, 500);	

			return;	
		}
	}

	console.log(metrics)
	Createtable(metrics,"showData",null,"table",null)
	// 	//for(var j=0; j<1; j++) {
	// 		console.log("j start")

	// 		var robot_name = "AGV" + (j+1).toString();
	// 		console.log(robot_name)
	// 		console.log(all_robot)
	// 		console.log(all_robot[j].start_position)
	// 		all_robot[j].current_position = all_robot[j].start_position;


	// 		put_robot_into_input_port(all_robot[j].current_position,assigned_task[i+j].location,j+1);	


	// 		all_robot[j].availability = "no";

	// 		start_search(all_node[all_robot[j].current_position-1],all_node[assigned_task[i+j].location-1],j+1)	

				

	// 		//path_with_time = [];
			
	// 		// all_robot[j].current_position =  initial_task[i+j].location;
	// 		// all_robot[j].start_position =  initial_task[i+j].location;
	// 		// all_robot[j].end_position =  null;
	// 		// all_robot[j].availability = "yes"

			
	// 	}
	// }
	
}

function set_point() {
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

	console.log(initial_task);


// 	for(var i=0; i<initial_num_robot; i=i+initial_num_robot) {		//assign all stock at starting point
// 		console.log("i start")
// 		for(var j=0; j<initial_num_robot; j++) {
// 		//for(var j=0; j<1; j++) {
// 			console.log("j start")

// 			var robot_name = "Robot" + (j+1).toString();
// 			console.log(robot_name)
// 			console.log(all_robot)
// 			console.log(all_robot[j].start_position)
// 			all_robot[j].current_position = all_robot[j].start_position;


// 			put_robot_into_input_port(all_robot[j].current_position,assigned_task[i+j].location,j+1);	


// 			all_robot[j].availability = "no";

// 			start_search(all_node[all_robot[j].current_position-1],all_node[assigned_task[i+j].location-1],j+1)	

				

// 			//path_with_time = [];
			
// 			// all_robot[j].current_position =  initial_task[i+j].location;
// 			// all_robot[j].start_position =  initial_task[i+j].location;
// 			// all_robot[j].end_position =  null;
// 			// all_robot[j].availability = "yes"

			
// 		}
// 	}
 setInterval(run_in_grid, 1250);	
			//put_robot_into_input_port(25,21);	
			//			start_search(all_node[24],all_node[20],2)

	for(var i=0; i<S.length; i++) {
		switch(expression) {
			case 1:
				put_robot_into_input_port(S_id,D_id,1);
				//put_robot_into_input_port(S_id+1,D_id+1,2);
				put_robot_into_input_port(9,12,3);

				start_search(all_node[S_id-1],all_node[D_id-1],1)
				//start_search(all_node[S_id],all_node[D_id],2)
				start_search(all_node[8],all_node[11],3)

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
	Createtable(metrics,"showData",null,"table",null)
}

////////////////////////////////
//		Path Metrics
////////////////////////////////

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

function calculate_duration() {

	for(var i=0; i<stock_data.length; i++) {
		var date1 = new Date(stock_data[i].arrival_time);
		var date2 = new Date(stock_data[i].export_time);

		var Difference_In_Time = date2.getTime() - date1.getTime();
		var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

		date_duration.push({
			stock_id : stock_data[i].stock_id,
			duration : Difference_In_Days,
		});
	}

	return date_duration;
}

function divide_zone() {
	var classes = [];
	var num_of_row = window.localStorage.getItem("num_of_rows_of_pallets");
	var row = [];
	var class_a = [];
	var class_b = [];
	var class_c = [];
	var class_a_b = [];
	var n_class_a,_class_b,n_class_c;

	for(var i=0; i< parseInt(num_of_row); i++) {
		row.push(i+1);
	}

	if(num_of_row%2 == 0) {		//even
		n_class_c = parseInt(num_of_row/2);
		n_class_a = 2;
	}
	else if(num_of_row%2 != 0) {		//odd
		n_class_c = parseInt(num_of_row/2);
		n_class_a = 1;
	}

	for(var i=0; i<n_class_c/2; i++) {
		class_c.push(i+1)
		class_c.push(num_of_row-i)
	}

	if(n_class_a == 1) {
		class_a.push(parseInt(num_of_row/2)+1)
	}
	else if(n_class_a == 2) {
		class_a.push(parseInt(num_of_row/2));
		class_a.push(parseInt(num_of_row/2)+1);
	}

	class_a_c = class_a.concat(class_c);
	console.log(class_a_c)

	class_b = row.filter( function( el ) {
  	return class_a_c.indexOf( el ) < 0;
	});

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
	for(var i=0; i<storage.length; i++) {
		if(storage[i].storage_id == location) {
			index.push(i);
		}
	}
	return index;
}

function check_location_and_type(stock_id,location,type) {	
	var actual_location = [];	
	var stock_location_index = null;

	//console.log(storage_index)
	for(var i=0; i<location.length; i++) {
		var storage_index = find_storage_index_with_location(location[i]);
				
		for(var j=depth; j>0; j--) {
			if(j == depth) {
				if(storage[storage_index[j-1]].availability == 'y' && storage[storage_index[j-1]].stock_id == null){
					if(stock_location_index == null) {
						//insert the stock into certain location (one storage one item)
						// if(stock_data[stock_id-1].stock_weight*stock_data[stock_id-1].stock_amount/1000 < 3){
						// 	stock_location_index = storage_index[j-1];
						// 	storage[storage_index[j-1]].stock_id = stock_id;
						// 	storage[storage_index[j-1]].stock_amount = stock_data[stock_id-1].stock_amount;
						// 	storage[storage_index[j-1]].total_weight = stock_data[stock_id-1].stock_weight*stock_data[stock_id-1].stock_amount/1000;
						// }
						// else {
						// 	var bear_amount = parseInt(3000/stock_data[stock_id-1].stock_weight);
						// 	var put_round = parseInt(stock_data[stock_id-1].stock_amount/bear_amount);
										
						// 	if((put_round*10)%10 != 0){ put_round = Math.ceil(put_round); }

						// 	for(var k=0; k<put_round; k++) {
						// 		stock_location_index = storage_index[j-1];
						// 		storage[storage_index[j-1]].stock_id = stock_id;
						// 		storage[storage_index[j-1]].stock_amount = stock_data[stock_id-1].stock_amount;
						// 		storage[storage_index[j-1]].total_weight = stock_data[stock_id-1].stock_weight*stock_data[stock_id-1].stock_amount/1000;
						// 		if(k != put_round-1) {storage[storage_index[j-1]].availability = 'n';}
						// 		j=j-1;
						// 	}
						// }
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
					// 	console.log(storage[storage_index[4]])
					// 	console.log(stock_id)
					// 	console.log(stock_data[storage[storage_index[4]].stock_id])
					// 	if(stock_data[storage[storage_index[depth-1]].stock_id-1].stock_type == type) {
					// 		//insert the stock into certain location (one stack one type)
					// 		if((parseInt(stock_data[stock_id-1].stock_weight*stock_data[stock_id-1].stock_amount)/1000) < 3){
					// 			console.log("hihi2")
					// 			stock_location_index = storage_index[j-1];
					// 			storage[storage_index[j-1]].stock_id = stock_id;
					// 			storage[storage_index[j-1]].stock_amount = stock_data[stock_id-1].stock_amount;
					// 			storage[storage_index[j-1]].total_weight = stock_data[stock_id-1].stock_weight*stock_data[stock_id-1].stock_amount/1000;
					// 		}
					// 		else {
					// 			console.log("hihi3")
					// 			var bear_amount = parseInt(3000/stock_data[stock_id-1].stock_weight);
					// 			var put_round = parseInt(stock_data[stock_id-1].stock_amount/bear_amount);

					// 			if((put_round*10)%10 != 0){ put_round = put_round.ceil(); }

					// 			for(var k=0; k<put_round; k++) {
					// 				stock_location_index = storage_index[j-1];
					// 				storage[storage_index[j-1]].stock_id = stock_id;
					// 				storage[storage_index[j-1]].stock_amount = stock_data[stock_id-1].stock_amount;
					// 				storage[storage_index[j-1]].total_weight = stock_data[stock_id-1].stock_weight*stock_data[stock_id-1].stock_amount/1000;
					// 				if(k != put_round-1) {storage[storage_index[j-1]].availability = 'n';}

					// 				j=j-1;
					// 			}
					// 		}					
					// 	}

					}
				}
			}
		}
	}

	return stock_location_index;
}

function find_all_class_location(classes,duration) {
	var all_class_location = [];
	var num_of_row = window.localStorage.getItem("num_of_rows_of_pallets");
	var num_of_column = window.localStorage.getItem("num_of_columns_of_pallets");

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
	return all_class_location;
}

function assign_stock() {
	var num_of_column = window.localStorage.getItem("num_of_columns_of_pallets");
	var classes = divide_zone();
	var class_a = classes[0].class_a;
	var class_b = classes[0].class_b;
	var class_c = classes[0].class_c;
	var class_a_location = [];
	var class_b_location = [];
	var class_c_location = [];
	var ah = "s";
	var stock_id_with_duration = calculate_duration();

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

function open_pick_item_form() {
	// Get the modal
	Createtable(stock_data,"pick_item2","stock_data","datatable","pick_item_datatable")
	var modal = document.getElementById('pick_item');
	modal.style.display='block';
}

function check_upper_got_item(pick_item_id) {
	var storage_index = [];
	var storage_depth;
	var got_item = [];

	for(var i=0; i<initial_task.length; i++) {
		if(initial_task[i].stock_id == pick_item_id){
			storage_index = find_storage_index_with_location(initial_task[i].location)
			storage_depth = initial_task[i].depth;
		}
	}

	for(var i=1; i<storage_depth; i++) {
		if(storage[storage_index[storage_depth-1-i]].availability == 'n'){
			got_item.push({
				stock_id : storage[storage_index[storage_depth-1-i]].stock_id,
				depth : storage[storage_index[storage_depth-1-i]].depth,
			});
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
	var assigned_task = [];
	var shuffling_method = "intermediate"; // default

	var modal = document.getElementById('pick_item');
	modal.style.display='none';

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
			}
			else {		//upper got stock
				console.log(check_got_item);
				var next = 1;
				console.log(initial_task)
				if(shuffling_method == "intermediate") { 
					intermediate_reshuffling(check_got_item,pick_item_id);
				}
				else if(shuffling_method == "delay") { 
					delaying_reshuffling(check_got_item,pick_item_id);
				}
			}
		}
	}	

	// 			for(var i=0; i<check_got_item.length; i++) {
	// 				for(j=0; j<initial_task.length; j++) {
	// 					if(check_got_item[i].stock_id == initial_task[j].stock_id) {
	// 						console.log(i)
	// 						if(initial_task[j].location%grid_data.grid_width != 1) {
	// 							switch(i) {
	// 								case 0:
	// 									assigned_task.push({
	// 										stock_id : initial_task[j].stock_id,
	// 										current_location : initial_task[j].location,
	// 										location : initial_task[j].location-grid_data.grid_width,
	// 										depth : initial_task[j].depth,
	// 										amount : initial_task[j].amount,
	// 										type : initial_task[j].type,
	// 									});	
	// 									//initial_task[j].location = initial_task[j].location+next;
	// 									break;

	// 								case 1:
	// 									assigned_task.push({
	// 										stock_id : initial_task[j].stock_id,
	// 										current_location : initial_task[j].location,
	// 										location : initial_task[j].location-grid_data.grid_width-next,
	// 										depth : initial_task[j].depth,
	// 										amount : initial_task[j].amount,
	// 										type : initial_task[j].type,
	// 									});	
	// 								//	initial_task[j].location = initial_task[j].location-window.localStorage.getItem("num_of_columns_of_pallets");
	// 									break;

	// 								case 2:
	// 									assigned_task.push({
	// 										stock_id : initial_task[j].stock_id,
	// 										current_location : initial_task[j].location,
	// 										location : initial_task[j].location-next,
	// 										depth : initial_task[j].depth,
	// 										amount : initial_task[j].amount,
	// 										type : initial_task[j].type,
	// 									});	
	// 								//	initial_task[j].location = initial_task[j].location+window.localStorage.getItem("num_of_columns_of_pallets");
	// 									break;

	// 								case 3:
	// 									assigned_task.push({
	// 										stock_id : initial_task[j].stock_id,
	// 										current_location : initial_task[j].location,
	// 										location : initial_task[j].location+grid_data.grid_width-next,
	// 										depth : initial_task[j].depth,
	// 										amount : initial_task[j].amount,
	// 										type : initial_task[j].type,
	// 									});	
	// 								//	initial_task[j].location = initial_task[j].location-next;
	// 									break;

	// 								default:
	// 									console.log("no");
	// 									break;
	// 							}	
	// 						}
	// 						else if(initial_task[j].location%grid_data.grid_width == 1) {
	// 							switch(i) {
	// 								case 0:
	// 									assigned_task.push({
	// 										stock_id : initial_task[j].stock_id,
	// 										current_location : initial_task[j].location,
	// 										location : initial_task[j].location-grid_data.grid_width,
	// 										depth : initial_task[j].depth,
	// 										amount : initial_task[j].amount,
	// 										type : initial_task[j].type,
	// 									});	
	// 									//initial_task[j].location = initial_task[j].location+next;
	// 									break;

	// 								case 1:
	// 									assigned_task.push({
	// 										stock_id : initial_task[j].stock_id,
	// 										current_location : initial_task[j].location,
	// 										location : initial_task[j].location-grid_data.grid_width+next,
	// 										depth : initial_task[j].depth,
	// 										amount : initial_task[j].amount,
	// 										type : initial_task[j].type,
	// 									});	
	// 								//	initial_task[j].location = initial_task[j].location-window.localStorage.getItem("num_of_columns_of_pallets");
	// 									break;

	// 								case 2:
	// 									assigned_task.push({
	// 										stock_id : initial_task[j].stock_id,
	// 										current_location : initial_task[j].location,
	// 										location : initial_task[j].location+next,
	// 										depth : initial_task[j].depth,
	// 										amount : initial_task[j].amount,
	// 										type : initial_task[j].type,
	// 									});	
	// 								//	initial_task[j].location = initial_task[j].location+window.localStorage.getItem("num_of_columns_of_pallets");
	// 									break;

	// 								case 3:
	// 									assigned_task.push({
	// 										stock_id : initial_task[j].stock_id,
	// 										current_location : initial_task[j].location,
	// 										location : initial_task[j].location+grid_data.grid_width+next,
	// 										depth : initial_task[j].depth,
	// 										amount : initial_task[j].amount,
	// 										type : initial_task[j].type,
	// 									});	
	// 								//	initial_task[j].location = initial_task[j].location-next;
	// 									break;

	// 								default:
	// 									console.log("no");
	// 									break;
	// 							}	
	// 						}
	// 					}
	// 				}								
	// 			}

	// 			// assigned_task.push({
	// 			// 		stock_id : initial_task[i].stock_id,
	// 			// 		location : initial_task[i].location,
	// 			// 		depth : initial_task[i].depth,
	// 			// 		amount : initial_task[i].amount,
	// 			// 		type : initial_task[i].type,
	// 			// 	});		
	// 		}
	// 	}
	// }	
	console.log(assigned_task)
	if(assigned_task.length != 0) {
		set_point_for_pick(assigned_task);		
	}
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
	assign_stock();
	console.log(real_location_with_stock)
}


RunAllFunction();
