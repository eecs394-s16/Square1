// onload, load login
$( document ).ready(function() {
    // load initial login view
	load("login");
});

// globalref for user authentication
var globalref = new Firebase('https://square1.firebaseio.com');
// Register the callback to be fired every time auth state changes
globalref.onAuth(authDataCallback);
// Create a callback which logs the current auth state
function authDataCallback(authData) {
	if (authData) {
		// logged in, redirect to dashboard
		window.name.uid = authData.uid;
		window.location = "index.html";
	}
	else {
		// not logged in, already in splash so stay here
	}
}
// also check manually at page load
authDataCallback(globalref.getAuth());

// loads pages by redrawing content DOM
function load(id) {
	switch(id) {
		case "login":
			$("#content").load('pages/login.html', function(data) {
				// no redirect on form submits
				// not needed because we handle forms with javascript
			    $('#myform').on('submit', function(e) {
			        e.preventDefault();
			    });
			});
			break;
		case "sign-up":
			$("#content").load('pages/sign-up.html', function(data) {
				// no redirect on form submits
				// not needed because we handle forms with javascript
			    $('#myform').on('submit', function(e) {
			        e.preventDefault();
			    });
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
			input = {};
			input.email = document.getElementById("email").value;
			input.password = document.getElementById("password").value;
			globalref.authWithPassword({
				email    : input.email,
				password : input.password,
			}, function(error, authData) {
				if (error) {
				switch (error.code) {
					case "INVALID_EMAIL":
						alert("The specified user account email is invalid.");
						break;
					case "INVALID_PASSWORD":
						alert("The specified user account password is incorrect.");
						break;
					case "INVALID_USER":
						alert("The specified user account does not exist.");
						break;
					default:
						alert("Error logging user in:", error);
					}
				}
			});
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
			input = {};
			input.first = document.getElementById("first").value;
			input.last = document.getElementById("last").value;
			input.tel = document.getElementById("tel").value;
			input.email = document.getElementById("email").value;
			input.password = document.getElementById("password").value;


			globalref.createUser({
				email: input.email,
				password: input.password,
			}, function(error, userData) {
				if (error) {
					switch (error.code) {
						case "EMAIL_TAKEN":
							alert("The new user account cannot be created because the email is already in use.");
							break;
						case "INVALID_EMAIL":
							alert("The specified email is not a valid email.");
							break;
						default:
							alert("Error creating user:", error);
					}
				}
				else {
					alert("Signed up! Now sign in");
					load("login");
				}
			});


		},
}