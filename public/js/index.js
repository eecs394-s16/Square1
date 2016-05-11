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

myFirebaseRef.set({
  "0" : {
  	Part: "Wood Panel", 
    Sourcing : {
   		Cost: "20",
    	Inventory: "10",
      Link:"http://www.joann.com/plywood-sheet-12inx.25inx12in/10177616.html?mkwid=Ispx7X3s%7Cdc&utm_source=google&utm_medium=cpc&utm_term=&utm_campaign=Shopping+-+Crafts&CS_003=10131488&CS_010=%5BProductId%5D&gclid=CLGs1PrDycwCFQ8vaQodC_oBug"
    	// Order: "False" 
    }
  },

  "1" :{
  	Part: "Battery",
    Sourcing : {
    	Cost: "7.3" ,
    	Inventory: "8" ,
      Link:"http://www.batteryjunction.com/energizer-a27bpz.html?gclid=CJbD647EycwCFQQbaQodKocPgw"
    	// Order: "False" 
    }
  },

  "2" : {

    Part: "Control Switch Panel", 
    Sourcing : {
      Cost: "4",
      Inventory: "12",
      Link:"http://www.htd.com/Products/Speaker-Selectors/SS41-Speaker-Selector?gclid=CN71vd3EycwCFQ4zaQodToMPhA"
      // Order: "False" 
    }
  },

  "3" : {

    Part: "Transducer", 
    Sourcing : {
      Cost: "6",
      Inventory: "12",
      Link:"http://www.digikey.com/product-detail/en/CEB-20D64/102-1126-ND/412385?WT.mc_id=IQ_7595_G_pla412385&wt.srch=1&wt.medium=cpc&WT.srch=1&gclid=CLO14ZLFycwCFQsDaQodFdsP7A"
      // Order: "False" 
    }
  },



  "4": {
	 Part: "Bluetooth Chip",
     Sourcing: {
    	Cost: "3",
    	Inventory: "12",
      Link:"https://www.adafruit.com/products/1697?gclid=CKXBhKjEycwCFZWFaQod1CUJAw"
    	// Order: "False" 
    }
   }
});

myFirebaseRef.once("value", function(snapshot) {

  // console.log("go there agian!");
  // alert(snapshot.val());  // Alerts "San Francisco"
  // document.getElementById("demo").innerHTML = snapshot.val();
  var table = document.getElementById("dataTable");
  

  snapshot.forEach(function(data) {
  var newItem = data.val();
	var row = table.insertRow(table.rows.length);
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


  cell1.innerHTML = newItem.Part;
  cell1.setAttribute('contenteditable', true);

	cell2.innerHTML = newItem.Sourcing.Cost;
  cell2.setAttribute('contenteditable', true);
	cell3.innerHTML = newItem.Sourcing.Inventory;
  cell3.setAttribute('contenteditable', true);
  cell4.innerHTML = '<a href ='+newItem.Sourcing.Link+' style="text-decoration:none"> <button class="btn btn-secondary">Order</button></a>'
  // cell4.setAttribute('contenteditable', true);
  // cell4.innerHTML = '<button onclick='+newItem.Sourcing.Link+'>Order Item</button>'

	// cell4.innerHTML = newItem.Sourcing.Link;
	// cell4.innerHTML = newItem.
    // console.log("The " + data.key() + " dinosaur's score is " + data.val());
    // document.getElementById("demo").innerHTML = data.val();
  
  });
});



var show_text = false;
function view_more() {
    document.getElementById("demo").style.color = "red";
    if (show_text ==false){
      // document.write("\n")
      document.getElementById("demo").innerHTML = "Order 3 Control Switch Panels and 1 Transducer to restock inventory to fulfill order!";
      show_text = true
    }
    else {
      show_text = false;
      document.getElementById("demo").innerHTML ="";
    }
        


    // <p>Need three more chips</p>
    // document.write("view more button clicked");
    
}

var changeDataHashTable = [];

// (function(){
  var editableArray = document.querySelector('#inventorydetails');

  editableArray.addEventListener('input', changeinfo = function(e){
    
    
    var newData = e.target.innerText;
    // console.log(newData);
    var IndexCol = e.target.cellIndex;  // the index of cell cliked in the table
    // console.log(IndexCol);

    // get cell's col's name 
    var firebaseCol = document.querySelectorAll('#inventorydetails thead tr th')[IndexCol].innerText;
    // console.log(firebaseCol);  
    
    // get cell row's name
    var firebaseRow = e.target.parentNode.childNodes[0].innerText;
    // console.log(firebaseRow);

    // store all data has been changed into a hashtable     
    var key = [firebaseRow, firebaseCol];
    changeDataHashTable[key] = newData;
    // console.log(changeDataHashTable);
  
  }, false);
// })();

 
function saveChange(){
    
    // console.log(changeDataHashTable);
    // save all data in the hashtable above into firebase
    myFirebaseRef.once("value", function(snapshot){
      // get all contents in firebase
      num = 0;
      snapshot.forEach(function(data){
        var each = data.val();
        // var ref = myFirebaseRef.child()
          // console.log(each);
        // console.log(changeDataHashTable);
        for (var k in changeDataHashTable) {
          console.log("key is ", k);
          var keys = k.split(",");
          var indexR = keys[0];
          var indexC = keys[1];
          // console.log(indexR + indexC);

          // console.log(keys[0]);
          if (each.Part == indexR) {
             // first find part name 
             
             // var path = num.toString() + '/Sourcing/' + indexC;
             // console.log(path);
             // console.log(path == '2/Sourcing/Cost');  
             // myFirebaseRef.update({path: changeDataHashTable[k].toString()});

             var ref = myFirebaseRef.child(num.toString()).child('Sourcing');
             // path = indexC.toString();


             for (var i in each.Sourcing) {
                if(indexC == 'Cost') {
                    ref.update({'Cost': changeDataHashTable[k].toString()});
                } 
                if (indexC == 'Inventory') {
                  // statement
                  ref.update({'Inventory': changeDataHashTable[k].toString()});
                } 
                if (indexC == 'Link') {
                  // statement
                  ref.update({'Link': changeDataHashTable[k].toString()});
                }
             }
          }  // check row equal or not 

        }  // for 
          num = num + 1;
          console.log(num);
      });  //foreach
    });
    // changeDataHashTable = [];
   
}

