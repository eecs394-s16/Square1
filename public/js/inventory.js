var inventory = new Firebase('https://395s16-test.firebaseio.com/inventory');

inventory.set({
  "0" : {
  	Part: "Wood Panel", 
    Sourcing : {
   		Cost: "20",
    	Inventory: "0",
        ReorderLevel:"50",
        Location:"Bin 29/Shelf 2",
      Link:"http://www.joann.com/plywood-sheet-12inx.25inx12in/10177616.html?mkwid=Ispx7X3s%7Cdc&utm_source=google&utm_medium=cpc&utm_term=&utm_campaign=Shopping+-+Crafts&CS_003=10131488&CS_010=%5BProductId%5D&gclid=CLGs1PrDycwCFQ8vaQodC_oBug"
    	// Order: "False" 
    }
  },

  "1" :{
  	Part: "Battery",
    Sourcing : {
    	Cost: "7.3" ,
    	Inventory: "1" ,
        ReorderLevel:"30",
        Location:"Bin 4/Shelf 3",
      Link:"http://www.batteryjunction.com/energizer-a27bpz.html?gclid=CJbD647EycwCFQQbaQodKocPgw"
    	// Order: "False" 
    }
  },

  "2" : {

    Part: "Control Switch Panel", 
    Sourcing : {
      Cost: "4",
      Inventory: "12",
      ReorderLevel:"22",
      Location:"Bin 20/ Shelf 5",
      Link:"http://www.htd.com/Products/Speaker-Selectors/SS41-Speaker-Selector?gclid=CN71vd3EycwCFQ4zaQodToMPhA"
      // Order: "False" 
    }
  },

  "3" : {

    Part: "Transducer", 
    Sourcing : {
      Cost: "6",
      Inventory: "26",
      ReorderLevel:"20",
      Location:"Bin 15/Shelf 4",
      Link:"http://www.digikey.com/product-detail/en/CEB-20D64/102-1126-ND/412385?WT.mc_id=IQ_7595_G_pla412385&wt.srch=1&wt.medium=cpc&WT.srch=1&gclid=CLO14ZLFycwCFQsDaQodFdsP7A"
      // Order: "False" 
    }
  },



  "4": {
	 Part: "Bluetooth Chip",
     Sourcing: {
    	Cost: "3",
    	Inventory: "12",
        ReorderLevel: "15",
        Location: "Bin 75/Shelf 3",
        Link:"https://www.adafruit.com/products/1697?gclid=CKXBhKjEycwCFZWFaQod1CUJAw"
    	// Order: "False" 
    }
   }
});


var bottleneck =false
var status = "foo green"
document.getElementById("new_inventory_entry").style.visibility='hidden';
    
inventory.on("value", function(snapshot) {
    var table = document.getElementById("dataTable");
    snapshot.forEach(function(data) {
        var newItem = data.val();
        var row = table.insertRow(0);
        var remainingInventory = newItem.Sourcing.Inventory;
        var reorder_level = newItem.Sourcing.ReorderLevel;
        var reorder_threshold = reorder_level*0.1
        
        if (remainingInventory == 0) {
            row.insertCell(0).innerHTML = '<div class ="foo wine"></div>'
        }
        else if (remainingInventory > reorder_level){
            row.insertCell(0).innerHTML = '<div class ="foo green"></div>'
        }
        else if (remainingInventory <= 5 || remainingInventory <= reorder_threshold){
            row.insertCell(0).innerHTML = '<div class ="foo yellow"></div>'
            
        }
        else {
            row.insertCell(0).innerHTML = '<div class ="foo orange"></div>'
//            document.getElementById("color").className = "foo green";
        }
                
        
        row.insertCell(1).innerHTML = newItem.Part;
        row.insertCell(2).innerHTML=newItem.Sourcing.Inventory;
        row.insertCell(3).innerHTML=newItem.Sourcing.ReorderLevel;
        row.insertCell(4).innerHTML=newItem.Sourcing.Cost;
        row.insertCell(5).innerHTML=newItem.Sourcing.Location;
        row.insertCell(6).innerHTML = '<a href ='+newItem.Sourcing.Link+' style="text-decoration:none"> <button class="btn btn-secondary">Order</button></a>'

    })
    
    var buttonID = document.getElementById("add_item");
    buttonID.onclick = function(){
        document.getElementById("new_inventory_entry").style.visibility='visible';
    }

    
    
//    function addItem(){
//        this.
//    }
    
})
