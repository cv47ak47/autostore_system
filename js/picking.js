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
//		Local Storage Variable
////////////////////////////////////

var stock_data = [];

////////////////////////////////////
//		Initialization
////////////////////////////////////

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

function Createtable(data,table_location,data_type,table_type,datatable_class) {
	console.log(data[0])
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
	      	tabCell.innerHTML = '<button class="pick-button" type="button" onclick="pick_item(' + data[i].stock_id + ')">Pick</button>';
	      }
	    }
	  }
	  var divContainer = document.getElementById(table_location);
	  //divContainer.innerHTML = "";

	  divContainer.appendChild(thead);
	  divContainer.appendChild(tbody);
  }
}

function pick_item(stock_id) {
	//alert("The Item is stored in ")
	window.location.href = "path.html?picking_id=" + stock_id;
}

////////////////////////////////
//		System ready to start
////////////////////////////////

function RunAllFunction() {
	get_dataset();
	Createtable(stock_data,"pick_item","stock_data","datatable","pick_item_datatable")
}

RunAllFunction();
