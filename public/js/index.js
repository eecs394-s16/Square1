var myFirebaseRef = new Firebase('https://square1.firebaseio.com');

// myFirebaseRef.set({
//   alanisawesome: {
//     date_of_birth: "June 23, 1912",
//     full_name: "Alan Turing"
//   },
//   gracehop: {
//     date_of_birth: "December 9, 1906",
//     full_name: "Grace Hopper"
//   }
// });

myFirebaseRef.set(
{
  WoodPanel: {
    Sourcing : {
   		Cost: "20",
    	link: "http:wood",
    	MaxLeadTime: "7" 
    },
  },
  Battery: {
    Sourcing : {
    	Cost: "7.3" ,
    	link: "http:Battery" ,
    	MaxLeadTime: "20" 
    }
  },
  BluetoothChip: {
     Sourcing: {
    	Cost: "3",
    	link: "http:Bluetooth",
    	MaxLeadTime: "20" 
    }
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

	cell1.innerHTML = newItem.Sourcing.Cost;
	cell2.innerHTML = newItem.Sourcing.link;
	cell3.innerHTML = newItem.Sourcing.MaxLeadTime;
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