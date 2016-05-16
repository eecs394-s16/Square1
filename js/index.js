// ui stuff ------------------------------------------------------------------------------------

// onload, load in the dashboard
$( document ).ready(function() {
  load("dash");
});

// loads pages by redrawing page-wrapper DOM
function load(id) {
  switch(id) {
    case "dash":
      jQuery.get('pages/dash.html', function(data) {
        document.getElementById("page-wrapper").innerHTML = data;
        jQuery.get('pages/inventory-widget.html', function(data2) {
          document.getElementById("inventory-panel").innerHTML = data2;
          jQuery.get('pages/schedule-widget.html', function(data3) {
            document.getElementById("schedule-panel").innerHTML = data3;
            loadFirebase(id);
          });
        });
      });
      break;
    case "inventory":
      jQuery.get('pages/inventory.html', function(data) {
        document.getElementById("page-wrapper").innerHTML = data;
        loadFirebase(id);
      });
      break;
    case "schedule":
      jQuery.get('pages/schedule.html', function(data) {
        document.getElementById("page-wrapper").innerHTML = data;
        loadFirebase(id);
      });
      break;
    default:
      console.log("got bad load id");
  } 

  // reload firebase stuff regardless of id
}

// firebase stuff ------------------------------------------------------------------------------------

// loads firebase databases (multiple, one for each feature)
// creates listeners for rendering data, adding data, etc
// automatically runs on page load
// call again every time page is drawn (in function "load")
loadFirebase('dash');  // load the dashboard for the first page load
function loadFirebase(id){
  // only rerun the code for that page being loaded
  switch(id) {
    case "dash":
      // bottleneck code here!
      // load all relevant firebase refs, iterate through to detect "bottlenecks"
      // if bottleneck is detected, show user in the appropriate widget

      // INVENTORY BOTTLENECK CODE
      var itemsRef = new Firebase('https://square1.firebaseio.com');
      itemsRef.on("value", function(snapshot){
        snapshot.forEach(function(data) {
          k = data.val();
          if (k.Sourcing.Inventory < 20){
            document.getElementById("inventory-panel-body").innerHTML += makeInventoryAlert(k);
          }
        });
      });
      // do something
      // modify widget

      // SCHEDULE BOTTLENECK CODE
      var scheduleRef = new Firebase('https://square1.firebaseio.com/scheudle');
      // do something
      // modify widget
      break;
    case "inventory":
      // -------------------------------------------------------------------------
      // INVENTORY
      // -------------------------------------------------------------------------
      var itemsRef = new Firebase('https://square1.firebaseio.com');
      itemsRef.on("value", function(snapshot) {
        // alert(snapshot.val());  // Alerts "San Francisco"
        // document.getElementById("demo").innerHTML = snapshot.val();
        var table = document.getElementById("itemsTable");
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
        cell1.innerHTML = newItem.Part;
        cell2.innerHTML = newItem.Sourcing.Cost;
        cell3.innerHTML = newItem.Sourcing.Inventory;
        cell4.innerHTML = '<a href ='+newItem.Sourcing.Link+' style="text-decoration:none"> <button class="btn btn-secondary">Order</button></a>'
        });
      });
      break;
    case "schedule":
      // -------------------------------------------------------------------------
      // SCHEDULE
      // -------------------------------------------------------------------------
      var scheduleRef = new Firebase('https://square1.firebaseio.com/scheudle');
      break;
    default:
      console.log("got bad load id");
  } 
};

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
}

function makeInventoryAlert(k){
  s = "";
  s += "\n<h5>" + String(k.Part) + " running low, only " + String(k.Sourcing.Inventory) + " left</h5>";
  return s;
}
