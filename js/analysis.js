var grid_data = [];
var algo_data = []
var statistic_data = [];
var modified_statistic_data = [];

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

	delete col['created_at'];
	console.log(col)
	new_col.push("No","Path","Path Length","Computational Time(ms)","Path algorithm","AGV");

	var thead = document.createElement("thead");
  var tbody = document.createElement("tbody");  
  
  var tr = thead.insertRow(-1);                   // TABLE ROW.

	//var table = document.createElement("table");	//dynamic table

	//var tr = table.insertRow(-1);		//insert new row

	for(var i=0 ; i < new_col.length; i++) {
		var th = document.createElement("th");
		th.innerHTML = new_col[i];
		tr.appendChild(th);
	}

	for(var i=0 ; i < data.length; i++) {
		tr = tbody.insertRow(-1);
		for(var j = 0 ; j < new_col.length; j++) {
			var cell = tr.insertCell(-1);
			cell.innerHTML = data[i][col[j]];				
		}		
	}

	var container = document.getElementById(location);
	  container.appendChild(thead);
	  container.appendChild(tbody);
	//container.appendChild(table);

}

function get_initial_data() {
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	// get grid data
	$.ajax({
	    type: 'GET',
	    url: "https://autostore-heroku.herokuapp.com/test/getallgriddata/" ,
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
	    url: "https://autostore-heroku.herokuapp.com/test/getallalgodata",
	    async :  false,

	    success: function(data){
	
				algo_data = data;

	    },
	    error: function(jqXHR, textStatus, errorThrown) {
	      console.log(textStatus, errorThrown);
	      alert("error get");
	    } 
	});

 	$.ajax({
	    type: 'GET',
	    url: "https://autostore-heroku.herokuapp.com/test/getallstatisticdata/",
	    async :  false,

	    success: function(data){
	    	console.log(data)
	    	modified_statistic_data = data;
			for(var i=0; i<modified_statistic_data.length; i++) {
				delete modified_statistic_data[i]['created_at'];
			}

			for(var i=0; i<modified_statistic_data.length; i++) {
				if(modified_statistic_data[i].algorithm_id == 2) {
					modified_statistic_data[i].algorithm_id = "Astar";
				}
				else if(modified_statistic_data[i].algorithm_id == 1) {
					modified_statistic_data[i].algorithm_id = "Dijkstra";
				}

				if(modified_statistic_data[i].agv_id == 1) {
					modified_statistic_data[i].agv_id = "AGV1";
				}
				else if(modified_statistic_data[i].agv_id == 2) {
					modified_statistic_data[i].agv_id = "AGV2";
				}

				modified_statistic_data[i].path = JSON.parse(modified_statistic_data[i].path);
			}			

			Createtable(modified_statistic_data,"statistic_table","")
	    },
	    error: function(jqXHR, textStatus, errorThrown) {
	      console.log(textStatus, errorThrown);
	      alert("error get");
	    } 
	});
}
function delete_data() {
	id =34;
 	$.ajax({
    type: 'POST',
    url: "https://autostore-heroku.herokuapp.com/test/deletestockdata/",
    async :  false,
    data : {
    	stock_id : 31, 
    },

    success: function(data){

    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
      alert("error get");
    } 
});
}

get_initial_data();


// delete_data()