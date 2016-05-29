// onload, load login
$( document ).ready(function() {
	load("login");
});

// loads pages by redrawing content DOM
function load(id) {
	switch(id) {
		case "login":
			$("#content").load('pages/login.html', function(data) {
				//
			});
			break;
		case "sign-up":
			$("#content").load('pages/sign-up.html', function(data) {
				//
			});
			break;
		default:
			console.log("got bad load id");
	}
}	

driver = {
	login:
		// login page -> dashboard
		// log the user in and take them to their dashboard
		function(e){
			alert("logging in");
		},
	getstarted:
		// login page -> newuser page
		// reload html page content with new user
		function(e){
			load("sign-up");
		},
	newuser:
		// register page -> login page
		// register the user and then take them back to the login page
		function(e){
			alert("Signed up! Now sign in");
		},
}