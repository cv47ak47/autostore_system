var supervisor_data;

function get_username() {
	
	var supervisor_id = parseInt(window.localStorage.getItem("supervisor_id"));

	// get grid data
	$.ajax({
    type: 'GET',
    url: "https://autostore-heroku.herokuapp.com/test/getallsupervisordata",
    async :  false,
    success: function(data){
      for(var i=0; i<data.length; i++) {
        if(data[i].supervisor_id == supervisor_id) {
          supervisor_data = data[i];
        }
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
      alert("error get");
    } 
  });

  document.getElementById("user").innerHTML = "Hi " + supervisor_data.name;
}

get_username();