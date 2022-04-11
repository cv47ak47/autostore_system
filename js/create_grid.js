var coordinate = [];
var all_node = [];
var grids = [];
var graph = [];

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

function create_grid(request) {

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

	switch(request) {
		case "all_node":
			return all_node;
			break;
	
		case "grid":
			return grid;
			break;

		case "graph":
			return graph;
			break;
	}
}

get_initial_data();
var a = create_grid("all_node");