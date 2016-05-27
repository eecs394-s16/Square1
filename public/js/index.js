// ui stuff ------------------------------------------------------------------------------------

// onload, load in the dashboard
$( document ).ready(function() {
  load("orders");
  // load("dash");
});

// loads pages by redrawing page-wrapper DOM
function load(id) {
  switch(id) {
    case "dash":
      $("#page-wrapper").load('pages/dash.html', function(data) {
        $('#inventory-panel').load('pages/inventory-widget.html', function(){
          $('#orders-panel').load('pages/orders-widget.html', function(){
            loadFirebase(id);
          });
        });
      });
      break;
    case "inventory":
      $('#page-wrapper').load('pages/inventory.html', function(data){
        loadFirebase(id);

      });
      break;
          
    case "orders":
      jQuery.get('pages/orders.html', function(data) {
        document.getElementById("page-wrapper").innerHTML = data;
        loadFirebase(id);
      });
      break;
        
    case "tasks":
      $('#page-wrapper').load('pages/tasks.html', function(data){
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
      var inventoryRef = new Firebase('https://square1.firebaseio.com/inventory');

      var bottleneck =false;
      var status = "foo green";

      inventoryRef.on("value", function(snapshot) {
        var table = document.getElementById("dataTable");
        snapshot.forEach(function(data) {
          var newItem = data.val();
          var row = table.insertRow(0);
          var remainingInventory = newItem.Sourcing.Quantity;
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
          row.insertCell(2).innerHTML = newItem.Sourcing.Quantity;
          row.insertCell(3).innerHTML = newItem.Sourcing.ReorderLevel;
          row.insertCell(4).innerHTML = newItem.Sourcing.Cost;
          row.insertCell(5).innerHTML = newItem.Sourcing.Location;
          row.insertCell(6).innerHTML = '<a href ='+newItem.Sourcing.Link+' style="text-decoration:none"> <button class="btn btn-secondary">Order</button></a>';
          row.insertCell(7).innerHTML = '<button class="glyphicon glyphicon-edit btn-sm"></button><button class="glyphicon glyphicon-remove btn-sm"></button></div>'
            
        })
      })

      document.getElementById("new_inventory_entry").style.display='none';
      var buttonID = document.getElementById("add_item");
      buttonID.onclick = function(){
        document.getElementById("new_inventory_entry").style.display='block';
      }

      var addFirebase = document.getElementById("add_to_firebase");
      addFirebase.onclick = function(){
        inventoryRef.push({
          Part:document.getElementById("part_input").value,
          Sourcing: {
            "Cost":         document.getElementById("cost_input").value,
            "Quantity":     document.getElementById("quantity_input").value,
            "ReorderLevel": document.getElementById("reorder_input").value,
            "Location":     document.getElementById("location_input").value,
            "Link":         document.getElementById("link_input").value
          }
        })
      }
      break;
    case "orders":
      // -------------------------------------------------------------------------
      // orders
      // -------------------------------------------------------------------------
      // clear the table in case there's anything there
      // get firebase stuff
      var ordersRef = new Firebase(addr.orders);
      // prepare plugin
      var oTableNotYetCalled = true;

      makeTable = function(snapshot) {
        document.getElementById("ordersTable-body").innerHTML = "";
        var table = document.getElementById("ordersTable-body");

        snapshot.forEach(function(data) {
          var newItem = data.val();
          var row = table.insertRow(0);
          var colIndex = 0;

          // first create the status column with defult color circle 
          var col_status = row.insertCell(colIndex++);
          col_status.innerHTML = '<div class ="foo orange"></div>'
          col_status.setAttribute("class", "firstcol")

          // insert following data 
          var col_order_num = row.insertCell(colIndex++);
          col_order_num.innerHTML = newItem.order_num;
          col_order_num.setAttribute("contenteditable", false);
          col_order_num.setAttribute("celltype", "order_num");  
          var col_name = row.insertCell(colIndex++);
          col_name.innerHTML = newItem.name;
          col_name.setAttribute("contenteditable", false);
          col_name.setAttribute("celltype", "name");
          var col_address = row.insertCell(colIndex++);
          col_address.innerHTML = newItem.address;
          col_address.setAttribute("contenteditable", false);
          col_address.setAttribute("celltype", "address");
          var col_items = row.insertCell(colIndex++);
          col_items.innerHTML = newItem.items;
          col_items.setAttribute("contenteditable", false);
          col_items.setAttribute("celltype", "item");
          var col_deadline = row.insertCell(colIndex++);
          col_deadline.innerHTML = newItem.deadline;
          col_deadline.setAttribute("contenteditable", false);
          col_deadline.setAttribute("celltype", "deadline");


          // calculate the days left 
          var sortColindex = colIndex;
          var col_dayLeft = row.insertCell(colIndex++);
          col_dayLeft.setAttribute("style", "font-weight:bold");
          var daysLeft = driver.getTimeLeft(newItem.deadline);
          col_dayLeft.innerHTML = daysLeft;

          // edit
          row.insertCell(colIndex++).innerHTML = '<button class="glyphicon glyphicon-edit btn-sm" onclick="driver.editEntry(event)"></button></button><button class="glyphicon glyphicon-remove btn-sm" onclick="driver.deleteEntry(event)">'

          // hidden key
          var hidden_key = row.insertCell(colIndex++);
          hidden_key.innerHTML = data.key();
          hidden_key.style.display='none';

          // update
          driver.updateStatus(col_status,daysLeft);
        }); // FOR EACH

        // delete the datatable
        if (oTableNotYetCalled) {   
          oTableNotYetCalled = false;
          var oTable = $('#ordersTable').DataTable({
            "lengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]],
            // "order": [[6, 'asc']],
            // "columnDefs": [
            //     {"targets": [0,7], "orderable": false}
            //   ],
            // "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f> '+
            //         '<"clearfix">>>t<"row view-filter"<"pull-left" i><"pull-right" p>>',
            // "pagingType": "full_numbers",
            "bAutoWidth" : false,
            // "scrollX": true,
            // "scrollY": true,
            "initComplete" : function () {
              $('.dataTables_scrollBody thead tr').addClass('hidden');
            },
          });   // otable configuration          
        }
      }
      // if anything happens, reload
      ordersRef.on("value", makeTable);
      ordersRef.on("child_added", makeTable);
      ordersRef.on("child_changed", makeTable);
      ordersRef.on("child_removed", makeTable);
      break;
          
          
    case "shipping":
      // -------------------------------------------------------------------------
      // SHIPPING
      // -------------------------------------------------------------------------
      var ordersRef = new Firebase('https://square1.firebaseio.com/shipping');

      ordersRef.set({
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

      ordersRef.on("value", function(snapshot) {
        var table = document.getElementById("ordersTable-body");
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
          
      case "tasks":
          var tasksRef = new Firebase('https://square1.firebaseio.com/tasks');
          //              tasksRef.set({
          //                "3001" : {
          //                  Order: "3001",
          //                  Item: "Quad Speaker",
          //                  location: "Bin 50/Shelf 50",
          //                  next_task: "Wire switch panel",
          //                  team_member: "Tim"
          //                }
          //              });
 
          tasksRef.on("value", function(snapshot){
              var table = document.getElementById("taskTable");
              snapshot.forEach(function(data){
                  var newItem = data.val();
                  var row = table.insertRow(0);
                  row.insertCell(0).innerHTML = '<div class ="foo orange"></div>'
                  row.insertCell(1).innerHTML = newItem.Order
                  row.insertCell(2).innerHTML = newItem.Item;
                  row.insertCell(3).innerHTML = newItem.location;
                  row.insertCell(4).innerHTML = newItem.next_task;
                  row.insertCell(5).innerHTML = newItem.team_member;
                  row.insertCell(6).innerHTML = ' <button class="btn btn-secondary">Next</button>'
              })
              
              document.getElementById("new_task_entry").style.display='none';
              var buttonID = document.getElementById("add_item");
              buttonID.onclick = function(){
                  document.getElementById("new_task_entry").style.display='block';
              }
              
              var addTask = document.getElementById("add_to_firebase");
                  addTask.onclick = function(){
                    tasksRef.push({
                      Order:document.getElementById("order_input").value,
                      Item:document.getElementById("item_input").value,
                      location:document.getElementById("location_input").value,
                      next_task:document.getElementById("nextTask_input").value,
                      team_member:document.getElementById("member_input").value    
                      
                    })
                  }      
          })
          
          break;
          
          
          
    default:
      console.log("got bad load id");
  }
}

// run bottleneck logic here, called from loadFirebase() in the dash case of that switch
function bottleneckLogic(){
  // bottleneck code here!
  // load all relevant firebase refs, iterate through to detect "bottlenecks"
  // if bottleneck is detected, show user in the appropriate widget
  // console.log("go here");

  // INVENTORY BOTTLENECK CODE ---------------------------------------------------
  var itemsRef = new Firebase('https://square1.firebaseio.com/inventory');
  itemsRef.once("value", function(snapshot){
    // table html
    s = '<div class= "table-responsive" style = "textAlign:left">' +
    '<table class="table">' + 
    '<thead>' +  
    '<tr> ' +
    '<th> Part/Material</th>' + 
    '<th> Quantity</th> ' +
    '</tr> ' +
    '</thead>' + 
    '<tbody>' ;

    snapshot.forEach(function(data) {
      k = data.val();
      // table to show inventory alert data 
      if (k.Sourcing && k.Sourcing.Quantity && k.Sourcing.Quantity < 20){
        s += makeInventoryAlert(k);
      }
    });

    s += '</tbody> </table> </div>';

    document.getElementById("inventory-panel-body").innerHTML = s;
  });

  // orders BOTTLENECK CODE  --------------------------------------------------- 
  var ordersRef = new Firebase(addr.orders);
  // do something
  // modify widget

  // bottleneck functions ----------------------
  // function for generating inventory bottleneck notification html
  function makeInventoryAlert(k){
    a = "";
    a += "<tr> <td> <b>" + String(k.Part) + " </b> </td>" 
    a +=  "<td> <b> <span style='color : red'>" + String(k.Sourcing.Quantity) + "</span> </b> </td> <tr>";
    return a;
  }
}

// global object of driver
driver = {
  updateStatus: function(col_status, daysLeft) {
    if (daysLeft == 0 ) {
      col_status.innerHTML = '<div id = "redFilledCircle"></div>';

    // to do check whether complete or not ------------------------
    }
    else if (daysLeft <= 7){
      col_status.innerHTML = '<div id = "yellowFilledCircle"></div>';
    }
    else if (daysLeft > 7){
      col_status.innerHTML = '<div id = "greenFilledCircle"></div>';
    }
    else {
      col_status.innerHTML = '<div class ="foo orange"></div>';
    }
  },

  getTimeLeft: function(deadline){
    var dateObj = new Date(deadline);  // convert string to date object 

    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var firstDate = dateObj;
    var secondDate = new Date();

    var diffDays = Math.round((firstDate.getTime() - secondDate.getTime())/(oneDay));
    if (diffDays <= 0)
      diffDays = 0;
    return diffDays;
  },  // getTimeLeft

  tempEntry: "",

  editEntry: function(e){
    tempEntry = e.target.parentElement.parentElement.cloneNode(true);
    switch (e.target.innerHTML){
      case "":
        // uneditable -> editable
        // change style
        e.target.parentElement.parentElement.style.backgroundColor = "#ffd480";
        // console.log("testing");
        // make editable
        tdArr = e.target.parentElement.parentElement.children;
        for (var i=0; i<tdArr.length; i++){
          if (tdArr[i].getAttribute("contenteditable") != null){
            tdArr[i].setAttribute("contenteditable", true);
          }
          switch (tdArr[i].getAttribute("celltype")){ 
            case "order_num":
              if (tdArr[i]==""){
                tdArr[i].innerHTML = '<strong>##</strong>';
                tdArr[i].setAttribute("onfocus", '"driver.selectAll(event)"');
              }
              break
            case "name":
              if (tdArr[i]==""){
                tdArr[i].innerHTML = "<strong>first last</strong>";
              }
              break
            case "address":
              if (tdArr[i]==""){
                tdArr[i].innerHTML = "<strong>address</strong>";
              }
              break
            case "item":
              if (tdArr[i]==""){
                tdArr[i].innerHTML = "<strong>item name</strong>";
              }
              break
            case "deadline":
              // make input dom
              var s = '<input contenteditable="true" celltype="deadline" type="date" style="height:100% !important; width:100% !important">'+tdArr[i].html+'</input>'; // HTML string
              var div = document.createElement('div');
              div.innerHTML = s;
              var newDom = div.childNodes[0];

              // replace old dom
              domToReplace = tdArr[i];
              domToReplace.parentElement.insertBefore(newDom, domToReplace);
              domToReplace.parentElement.removeChild(domToReplace);
              tdArr[i].innerHTML = "<strong>mm/dd/yyyy</strong>";
              break 
          }
        }
          
        // change button
        e.target.setAttribute("class", "");
        e.target.innerHTML = "submit";

        // // change deadline to input tag with date type 
        // entry_rowIndex = e.target.parentNode.parentNode.rowIndex - 1;  // Index starts 0
        // var $c = $("#ordersTable-body").find('tr:eq('+ entry_rowIndex + ') td:eq(5)'); // get the deadline column
        // $c.replaceWith('<input type="date" style="height:100% !important; width:100% !important">');



        // change cancel button too
        e.target.parentElement.lastChild.setAttribute("class", "");
        e.target.parentElement.lastChild.innerHTML = "cancel";

        break;

      case "submit":
        // editable -> uneditable
        // send to firebase
        // reload
        // change style
        e.target.parentElement.parentElement.style.backgroundColor = "";
        // console.log("testing");
        // make uneditable
        tdArr = e.target.parentElement.parentElement.children;
        for (var i=0; i<tdArr.length; i++){
          if (tdArr[i].getAttribute("contenteditable") != null){
            tdArr[i].setAttribute("contenteditable", false);
          }
        }
        // change button
        e.target.setAttribute("class", "glyphicon glyphicon-edit btn-sm");
        e.target.innerHTML = "";
        e.target.parentElement.lastChild.setAttribute("class", "glyphicon glyphicon-remove btn-sm");
        e.target.parentElement.lastChild.innerHTML = "";

        // send to firebase 
        entry_key = e.target.parentNode.parentNode.lastChild.innerText;
        entry_rowIndex = e.target.parentNode.parentNode.rowIndex - 1;  // Index starts 0

        // get all data with false contenteditable
        dataToSend = {};
        // row data is an object
        $("#ordersTable-body").find('tr:eq(' + entry_rowIndex +')').each(function() {
          $(this).find('td').each(function() {
            if (this.cellIndex == 5) {
              // this is pointing to daysleft column
              // deadline column update daysLeftColumn
              this.innerText = driver.getTimeLeft(this.previousSibling.value);
              driver.updateStatus(this.parentNode.firstChild, this.innerText);
            }

            if (this.hasAttribute("contenteditable")) {
              colName = $('#ordersTable').find('th').eq(this.cellIndex - 1).text().trim();
              switch (colName){
                case "Order#":
                  headerText="order_num";
                  data = this.innerText;
                  break;
                case "Name": 
                  headerText="name";   
                  data = this.innerText; 
                  break;
                case "Address": 
                  headerText="address"; 
                  data = this.innerText; 
                  break;
                case "Items": 
                  headerText="items";  
                  data = this.innerText; 
                  break;
                default:
                  deadlineCol = $('#ordersTable').find('input').val();
                  if (deadlineCol){
                    headerText = "deadline";
                    data = deadlineCol;
                  }
              }

              dataToSend[headerText] = data;
            }
          });// each td find contenteditable
        }); // find row of the event happens

        // console.log(dataToSend);

        var ordersRef = new Firebase(addr.orders + entry_key);
        ordersRef.update(dataToSend);
        break;
    }
  },
  
  addEmptyItem: function(e){
    // add empty item
    var ordersRef = new Firebase(addr.orders);
    ordersRef.push({
      "order_num":  "",
      "name":       "",
      "address":    "",
      "items":      "",
      "deadline":   "",
    });
    // make sure it's loaded from firebase back to page
    // load("orders");
    // call driver.editEntry with the new item
  },

  reload: function(id){

    loadFirebase(id);
  },

  selectAll: function(e){
    alert("hah you too");
  },

  deleteEntry: function(e){
    switch (e.target.innerHTML){
      case "":
        entry_key = e.target.parentNode.parentNode.lastChild.innerText;
        var remRef = new Firebase(addr.orders + entry_key);
        remRef.remove();
        break
      case "cancel":
        domToReplace = e.target.parentElement.parentElement;
        domToReplace.parentElement.insertBefore(tempEntry, domToReplace);
        domToReplace.parentElement.removeChild(domToReplace);
        break
    }
  },
}

// global refs
addr = {
  orders: "https://square1.firebaseio.com/orders/",
}