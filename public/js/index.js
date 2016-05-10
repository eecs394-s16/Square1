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
  	"0" : {

  	Part: "Wood Panel", 
    Sourcing : {
   		Cost: "20",
    	Inventory: "10",
      Link:"http://www.homedepot.com/p/Future-Foam-2-in-Thick-Multipurpose-Foam-10030BULK2/203837080?cm_mmc=SEM%7CTHD%7Cgoogle%7CD23+Carpet&mid=sDIJWZ2mP%7Cdc_mtid_8903pdd25182_pcrid_63605926408_pkw__pmt__product_203837080&gclid=CMbQgfbEycwCFQktaQodrVMOLQ"
    	// Order: "False" 
    }
  },
  "1" :{
  	Part: "Battery",
    Sourcing : {
    	Cost: "7.3" ,
    	Inventory: "20" ,
      Link:"http://www.homedepot.com/p/Future-Foam-2-in-Thick-Multipurpose-Foam-10030BULK2/203837080?cm_mmc=SEM%7CTHD%7Cgoogle%7CD23+Carpet&mid=sDIJWZ2mP%7Cdc_mtid_8903pdd25182_pcrid_63605926408_pkw__pmt__product_203837080&gclid=CMbQgfbEycwCFQktaQodrVMOLQ"
    	// Order: "False" 
    }
  },
  "2": {
	 Part: "Bluetooth Chip",
     Sourcing: {
    	Cost: "3",
    	Inventory: "12",
      Link:"http://www.homedepot.com/p/Future-Foam-2-in-Thick-Multipurpose-Foam-10030BULK2/203837080?cm_mmc=SEM%7CTHD%7Cgoogle%7CD23+Carpet&mid=sDIJWZ2mP%7Cdc_mtid_8903pdd25182_pcrid_63605926408_pkw__pmt__product_203837080&gclid=CMbQgfbEycwCFQktaQodrVMOLQ"
    	// Order: "False" 
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
  var cell5 = row.insertCell(4);
  cell1.innerHTML = newItem.Part;
	cell2.innerHTML = newItem.Sourcing.Cost;
	cell3.innerHTML = newItem.Sourcing.Inventory;
  cell4.innerHTML = '<a href ='+newItem.Sourcing.Link+' style="text-decoration:none"> <button>Order</a></button>'
  // cell4.innerHTML = '<button onclick='+newItem.Sourcing.Link+'>Order Item</button>'

	// cell4.innerHTML = newItem.Sourcing.Link;
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