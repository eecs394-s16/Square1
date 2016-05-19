var inventory = new Firebase('https://395s16-test.firebaseio.com/inventory');

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


    var addFirebase = document.getElementById("add_to_firebase");
    addFirebase.onclick = function(){
        inventory.push({
            Part:document.getElementById("part_input").value,
            Sourcing: {
                Cost:document.getElementById("cost_input").value,
                Inventory:document.getElementById("inventory_input").value,
                ReorderLevel:document.getElementById("reorder_input").value,
                Location:document.getElementById("location_input").value,
                Link:document.getElementById("link_input").value
            }

        })
}


    
    
})


