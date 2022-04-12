function submitLoginForm(event){
    event.preventDefault();

	var username = event.target['username'].value
	var password = event.target['password'].value
	var supervisor_data;
	var found = false;

	$.ajax({
	    url:'https://autostore-heroku.herokuapp.com/test/getallsupervisordata',
	    type:'get',
	    async :  false,
	    
	    success: function(data) {
			supervisor_data = data;
	    },
	  	error: function(jqXHR, textStatus, errorThrown) {
	    	console.log(textStatus, errorThrown);
	    	alert("error get supervisor data");
	    }
	});

	for(var i=0; i< supervisor_data.length; i++) {
		if(supervisor_data[i].name == username && supervisor_data[i].password == password) {
			found = true;
			localStorage.setItem("supervisor_id",supervisor_data[i].supervisor_id);
			window.location.href = "./grid.html";
		}
	}

	if(!found) {
		alert("The username and password is not correct");
		location.reload();
	}
}