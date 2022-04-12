var stock_data;


function store_item(stock_id) {
	//alert("The Item is stored in ")
	window.location.href = "path.html?storing_id=" + stock_id;
}

function dates_compare(a,b) {
	if(a.getTime() < b.getTime()) {
		return true;
	}
	else {
		return false;
	}
}

function validate_date() {
	var today = new Date();
	console.log(today.getTime(0))
	var dd = today.getDate();
	var mm = today.getMonth() + 1; //January is 0!
	var yyyy = today.getFullYear();

	if (dd < 10) {
	   dd = '0' + dd;
	}

	if (mm < 10) {
	   mm = '0' + mm;
	} 
	    
	today = yyyy + '-' + mm + '-' + dd;
	document.getElementById("arrival_time_input").setAttribute("min", today);
	document.getElementById("export_time_input").setAttribute("min", today);
}


function add_stock(event) {
	var input = false;
	event.preventDefault();

	var stock_name = event.target['stock_name_input'].value;
	var stock_code = event.target['stock_code_input'].value;
	var stock_type = event.target['stock_type_input'].value;
	var stock_amount = event.target['stock_amount_input'].value;
	var stock_description = event.target['stock_description_input'].value;
	var stock_weight = event.target['stock_weight_input'].value;
	var arrival_time = new Date(event.target['arrival_time_input'].value);
	var export_time = new Date(event.target['export_time_input'].value);

	if(!dates_compare(arrival_time,export_time)) {
		alert("The export date must be greater than arrival date");
		input = false;
		location.reload();
	}

	var dd = String(export_time.getDate()).padStart(2, '0');
	var mm = String(export_time.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = export_time.getFullYear();

	export_time = mm + '/' + dd + '/' + yyyy;

	var dda = String(arrival_time.getDate()).padStart(2, '0');
	var mma = String(arrival_time.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyya = arrival_time.getFullYear();

	arrival_time = mma + '/' + dda + '/' + yyyya;

	console.log(arrival_time)
	console.log(export_time)

	if(stock_amount <= 0) {
		alert("The amount cannot be negative");
		input = false;
		location.reload();
	}



	if(input) {
		$.ajax({
		    type: 'POST',
		    url: 'https://autostore-heroku.herokuapp.com/test/addstockdata',

		    data: {
		    	stock_id : stock_data.length,
				stock_name : stock_name, 
				stock_code : stock_code,
				stock_type : stock_type,
				stock_amount : stock_amount,
				stock_description : stock_description,
				stock_weight : stock_weight,
				arrival_time : arrival_time,
				export_time : export_time,
		    },
		    success: function(data){
		      console.log("success post");
		      alert("The stock is added successfully")

		      store_item(stock_data.length+1)
		    },
		    error: function(jqXHR, textStatus, errorThrown) {
		    	console.log(jqXHR);
		      console.log(textStatus, errorThrown);
		    } 
	 	});		
	}

	get_dataset();
}

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
}

get_dataset();
validate_date();



