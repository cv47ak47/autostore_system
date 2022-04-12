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

var grid_data;

////////////////////////////////////
//		Initial Variable From DB
////////////////////////////////////

function get_initial_data() {
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	// get grid data
	$.ajax({
    type: 'GET',
    url: "https://autostore-heroku.herokuapp.com/test/getgriddata/" +supervisor_id ,
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


function draw_into_grid(real_location_with_stock) {
	var num_of_rows_of_pallets = grid_data.grid_length;
	var num_of_columns_of_pallets = grid_data.grid_width;

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
	window.location.href = "specific_stock_info.html?id=" + id;
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
				grid.innerHTML += '<div><button class="stock_button" onclick="build_stack_with_button('+ id +')">Stock</button></div>'
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
//		Storage Part
////////////////////////////////
function get_dataset() {        
	$.ajax({
    url:'https://autostore-heroku.herokuapp.com/test/getallstockdata',
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
	console.log(initial_task);
	//draw_into_grid(real_location_with_stock);
}

////////////////////////////////
//		System ready to start
////////////////////////////////

function RunAllFunction() {
	get_initial_data();
	build_pallets();
	create_grid();
	get_dataset();
	all_storage();
	assign_stock();
}


RunAllFunction();
