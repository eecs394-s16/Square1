// ui stuff ------------------------------------------------------------------------------------

// onload, load in the dashboard
$( document ).ready(function() {
  load("dash");
});

// loads pages by redrawing page-wrapper DOM
function load(id) {
  switch(id) {
    case "dash":

    $("#page-wrapper").load('pages/dash.html', function(data) {
      $('#inventory-panel').load('pages/inventory-widget.html');
      $('#schedule-panel').load('pages/schedule-widget.html');
      loadFirebase(id);
    });
    break;

    case "inventory":

    $('#page-wrapper').load('pages/inventory.html');
    loadFirebase(id);
    break;
    case "schedule":
    jQuery.get('pages/schedule.html', function(data) {
      document.getElementById("page-wrapper").innerHTML = data;
      loadFirebase(id);
    });
    break;
    case "shipping":
    $('#page-wrapper').load('pages/shipping.html');
    loadFirebase(id);
    break;
    default:
    console.log("got bad load id");
  }
}

// firebase stuff ------------------------------------------------------------------------------------

// loads firebase databases (multiple, one for each feature)
// creates listeners for rendering data, adding data, etc
// automatically runs on page load
// call again every time page is drawn (in function "load")
// read about js switches: http://www.w3schools.com/js/js_switch.asp
function loadFirebase(id){
  // only rerun the code for that page being loaded
  switch(id) {
    case "dash":
      // display bottlenecked stuff in widgets
      bottleneckLogic();
      break;
    case "inventory":
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
      break;
    case "schedule":
      // -------------------------------------------------------------------------
      // SCHEDULE
      // -------------------------------------------------------------------------
      var scheduleRef = new Firebase('https://square1.firebaseio.com/schedule');
      break;
    case "shipping":
      // -------------------------------------------------------------------------
      // SHIPPING
      // -------------------------------------------------------------------------
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
      break;
    default:
      console.log("got bad load id");
  }
}

// run bottleneck logic here, called from loadfirebase() in the dash case of that switch
function bottleneckLogic(){
  // bottleneck code here!
  // load all relevant firebase refs, iterate through to detect "bottlenecks"
  // if bottleneck is detected, show user in the appropriate widget
  // console.log("go here");

  // INVENTORY BOTTLENECK CODE ---------------------------------------------------
  var itemsRef = new Firebase('https://square1.firebaseio.com');
  itemsRef.once("value", function(snapshot){
    // table html
    s = '<div class= "table-responsive" style = "textAlign:left">' +
    '<table class="table">' + 
    '<thead>' +  
    '<tr> ' +
    '<th> Part/Material</th>' + 
    '<th> Inventory</th> ' +
    '</tr> ' +
    '</thead>' + 
    '<tbody>' ;

    snapshot.forEach(function(data) {
      k = data.val();
      // table to show inventory alert data 
      if (k.Sourcing && k.Sourcing.Inventory && k.Sourcing.Inventory < 20){
        s = makeInventoryAlert(s, k);
      }
    });

    s += '</tbody> </table> </div>';

    document.getElementById("inventory-panel-body").innerHTML = s;
  });

  // SCHEDULE BOTTLENECK CODE  --------------------------------------------------- 
  var scheduleRef = new Firebase('https://square1.firebaseio.com/scheudle');
  // do something
  // modify widget

  // bottleneck functions ----------------------
  // function for generating inventory bottleneck notification html
  function makeInventoryAlert(s, k){
    s += "<tr> <td> <b>" + String(k.Part) + " </b> </td>" 
    s +=  "<td> <b> <span style='color : red'>" + String(k.Sourcing.Inventory) + "</span> </b> </td> <tr>";
    return s;
  }
}
