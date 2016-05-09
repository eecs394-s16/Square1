var myFirebaseRef = new Firebase('https://square1.firebaseio.com');

// reading local json file 
$.getJSON("js/data.json", function(json) {
    // console.log(json); // this will show the info it in firebug console
	for(var key in json) {
		var newDataRef = myFirebaseRef.push();
		// console.log(json[0].Part);
		newDataRef.set({
			Part : json[key].Part,
			Sourcing : json[key].Sourcing
		});
	}
});


myFirebaseRef.on("value", function(snapshot) {
  // alert(snapshot.val());  // Alerts "San Francisco"
  // document.getElementById("demo").innerHTML = snapshot.val();
  var table = document.getElementById("dataTable");
  

  snapshot.forEach(function(data) {
  	// 
  	var newItem = data.val();

	var row = table.insertRow(0);
	// table.setAttribute("align","center");
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    cell1.innerHTML = newItem.Part;
	cell2.innerHTML = newItem.Sourcing.Cost;
	cell3.innerHTML = newItem.Sourcing.link;
	cell4.innerHTML = newItem.Sourcing.MaxLeadTime;
	// cell4.innerHTML = newItem.
    // console.log("The " + data.key() + " dinosaur's score is " + data.val());
    // document.getElementById("demo").innerHTML = data.val();
  });
});

// Get a reference to our posts
// var ref = new Firebase("https://docs-examples.firebaseio.com/web/saving-data/fireblog/posts");

// Retrieve new posts as they are added to our database
// myFirebaseRef.on("child_added", function(snapshot, prevChildKey) {
//   var newPost = snapshot.val();
//   console.log("Author: " + newPost.title);
//   console.log("Title: " + newPost.author);
//   console.log("Title: " + newPost.location);
//   console.log("Previous Post ID: " + prevChildKey);
// });