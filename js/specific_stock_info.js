////////////////////////////////////
//		Local Storage Variable
////////////////////////////////////

var stock_data = [];
var real_location_with_stock = [];
var storage_data = [];
var grid_data = [];
var id;

////////////////////////////////////
//		Initialization
////////////////////////////////////
function get_id() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	id = urlParams.get('id')
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

function get_grid_data() {
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

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
}

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
}

function get_stock_bin_data() {        
	$.ajax({
    url:'http://localhost:3031/test/getallstockbindata',
    type:'get',
    async :  false,
    
    success: function(data) {
    	real_location_with_stock = data;
    	console.log(real_location_with_stock)
    },
  	error: function(jqXHR, textStatus, errorThrown) {
    	console.log(textStatus, errorThrown);
    	alert("error get stock bin data");
    }
	});
}

function get_storage_data() {
	$.ajax({
    url:'https://8a0f-2001-d08-1a02-fb5a-7999-5565-3937-c79c.ngrok.io/test/getallstoragedata',
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
}





function Createtable(data,location,datatable_class) {

	var col = [];
	for(var i=0; i<data.length; i++) {
		for(var key in data[i]) {
			if(col.indexOf(key) === -1) {
				col.push(key);
			}
		}
	}
	var new_col = [];
	new_col.push("Depth","Stock ID","Name","Code","Type","Quantity","Description","Weight  (in g)","Arrival Time","Export Time");

	var table = document.createElement("table");	//dynamic table

	var tr = table.insertRow(-1);		//insert new row

	for(var i=0 ; i < new_col.length; i++) {
		var th = document.createElement("th");
		th.innerHTML = new_col[i];
		tr.appendChild(th);
	}

	for(var i=0 ; i < data.length; i++) {
		tr = table.insertRow(-1);
		for(var j = 0 ; j < col.length; j++) {
			var cell = tr.insertCell(-1);
			cell.innerHTML = data[i][col[j]];				
		}
	}

	var container = document.getElementById(location);
	container.appendChild(table);

  $('.' + datatable_class).DataTable({
		searching:true,
		ordering:true,
		lengthMenu: [[5,10,15,20,-1],[5,10,15,20,"ALL"]],
		order: [[ 1, "desc" ]],
	});
}

function build_stack_with_button(id) {
	console.log("a")
	console.log(real_location_with_stock)

	var grid_stack;
	var half_stock_per_stack = [];
	var stock_per_stack = [];
	var storage_id_range = [];

	for(var i=0; i<storage_data.length; i++) {
		if(xy_to_position(storage_data[i].x_axis,storage_data[i].y_axis) == id) {
			storage_id_range.push(storage_data[i].storage_id)
		}
	}

console.log(storage_id_range)
	//var max = id*grid_data.grid_depth;
	//var min = ((id-1)*grid_data.grid_depth)+1;

	var max = storage_id_range[storage_id_range.length-1];
	var min = storage_id_range[0];

console.log(max)
console.log(min)
	for(var i=0; i<real_location_with_stock.length; i++) {
		if(real_location_with_stock[i].storage_id >= min && real_location_with_stock[i].storage_id <= max) {
			for(var j=0; j<storage_data.length; j++) {
				if(real_location_with_stock[i].storage_id == storage_data[j].storage_id) {
					half_stock_per_stack.push({
						depth : storage_data[j].depth,
						stock_id :real_location_with_stock[i].stock_id,
					})
				}			
			}
		}
	}

	half_stock_per_stack.reverse(); //from lower depth to deeper
	for(var i=0; i<half_stock_per_stack.length; i++) {
		for(var j=0; j<stock_data.length; j++) {
			if(half_stock_per_stack[i].stock_id == stock_data[j].stock_id) {
				stock_per_stack.push({
					depth: half_stock_per_stack[i].depth,
					stock_id: stock_data[j].stock_id,
					stock_name: stock_data[j].stock_name,
					stock_code: stock_data[j].stock_code,
					stock_type: stock_data[j].stock_type,
					stock_amount: stock_data[j].stock_amount,
					stock_description: stock_data[j].stock_description,
					stock_weight: stock_data[j].stock_weight,
					arrival_time: stock_data[j].arrival_time,
					export_time: stock_data[j].export_time,
				})
			}
		}
	}

	if(stock_per_stack.length != 0) {
		Createtable(stock_per_stack,"specific_storage","pick_item_datatable")
	}
	else {
		document.getElementById("nothing").innerHTML = "This grid contains no stock"
	}
}

////////////////////////////////
//		Other
////////////////////////////////
	var stock_transfer = [];
function other(id, depth) {


	var point = position_to_xy(id);

	for(var i=0; i<storage_data.length; i++) {
		if((storage_data[i].x_axis == point.x && storage_data[i].y_axis == point.y) && storage_data[i].depth == depth){
			stock_transfer.push({
				location : id,
				storage_id :storage_data[i].storage_id,
			});
		}
	}

	//console.log(real_location_with_stock)
	// var all_all_all = [];

	// var max = id*grid_data.grid_depth;
	// var min = ((id-1)*grid_data.grid_depth)+1;

	//console.log	

}

////////////////////////////////
//		System ready to start
////////////////////////////////

function RunAllFunction() {
	get_id();
	get_grid_data();
	get_dataset();
	get_stock_bin_data();
	get_storage_data();
	build_stack_with_button(id)

// 	all = [2,6,16,3,7,13];

// 	for(var i=0; i<all.length; i++) {
// 		for(var j=5; j>0; j--) {
// 			other(all[i],j)
// 		}
// 	}
// 	console.log(stock_transfer)
// console.log(real_location_with_stock)


// 	console.log(storage_data)


}


RunAllFunction();
