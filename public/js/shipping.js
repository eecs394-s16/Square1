var myFirebaseRef = new Firebase('https://square1.firebaseio.com/orders');

myFirebaseRef.set({
	"2304" : {
		Order: "2304",
	  	Name: "John Doe",
	  	location: { 
	  		Address: "1234 Apple rd",
	  		City: "Evanston",
	  		State: "Il",
	  		zip: 60201
	  	},
	  	product: {
	  		items:"duo speaker",
	  		weight: "3.3 lbs"
	  	},   
	  	deadline: 120416,
	  	ship: "ship"
  }
});

myFirebaseRef.on("value", function(snapshot) {
	var table = document.getElementById("dataTable");
	snapshot.forEach(function(data) {
	var newItem = data.val();
	var row = table.insertRow(0);
	// table.setAttribute("align","center");
	var cell1 = row.insertCell(0);
	var cell2 = row.insertCell(1);
	var cell3 = row.insertCell(2);
	var cell4 = row.insertCell(3);
	var cell5 = row.insertCell(4);
	var cell6 = row.insertCell(5);
	var cell7 = row.insertCell(6);
	var cell8 = row.insertCell(7);
	var cell9 = row.insertCell(8);
	var cell10 = row.insertCell(9);
	cell1.innerHTML = newItem.Name;
	cell2.innerHTML = newItem.location.Address;
	cell3.innerHTML = newItem.product.items;
	cell4.innerHTML = '<a href ='+newItem.Sourcing.Link+' style="text-decoration:none"> <button class="btn btn-secondary">Order</button></a>'
	  // cell4.innerHTML = '<button onclick='+newItem.Sourcing.Link+'>Order Item</button>'

		// cell4.innerHTML = newItem.Sourcing.Link;
		// cell4.innerHTML = newItem.
	 //    console.log("The " + data.key() + " dinosaur's score is " + data.val());
	 //    document.getElementById("demo").innerHTML = data.val();

  });


});