var myFirebaseRef = new Firebase('https://square1.firebaseio.com/orders');
document.getElementById("new_shipping_entry").style.visibility='hidden';
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

    var buttonID2 = document.getElementById("add_item2");
    buttonID2.onclick = function(){
        document.getElementById("new_shipping_entry").style.visibility='visible';
    }
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
	cell1.innerHTML = newItem.Order;
	cell2.innerHTML = newItem.Name;
	cell3.innerHTML = newItem.location.Address;
	cell4.innerHTML = newItem.product.items;
	cell5.innerHTML =  newItem.product.weight;
	cell6.innerHTML =  newItem.deadline;
	cell7.innerHTML =  newItem.ship;
	//cell8.innerHTML =  newItem.ship;

  });


});