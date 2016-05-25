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
          
          cell0 = row.insertCell(0);
          cell0.setAttribute('contenteditable',false);
          
          cell1 = row.insertCell(1);
          cell1.setAttribute('contenteditable',false);  
          cell2 = row.insertCell(2);
          
          cell2.setAttribute('contenteditable',false);  
          cell3 = row.insertCell(3);
          cell3.setAttribute('contenteditable',false);
          
          cell4 = row.insertCell(4);
          cell4.setAttribute('contenteditable',false);
            
          cell5 = row.insertCell(5);
          cell5.setAttribute('contenteditable',false);
            
          cell6 = row.insertCell(6);
          cell6.setAttribute('contenteditable',false);
            
          cell7 = row.insertCell(7);
          cell7.setAttribute('contenteditable',false);

          if (remainingInventory == 0) {
            cell0.innerHTML = '<div class ="foo wine"></div>'
          }
          else if (remainingInventory > reorder_level){
            cell0.innerHTML = '<div class ="foo green"></div>'
          }
          else if (remainingInventory <= 5 || remainingInventory <= reorder_threshold){
            cell0.innerHTML = '<div class ="foo yellow"></div>'
          }
          else {
            cell0.innerHTML = '<div class ="foo orange"></div>'
          }

          cell1.innerHTML = newItem.Part;
          cell2.innerHTML = newItem.Sourcing.Quantity;
          cell3.innerHTML = newItem.Sourcing.ReorderLevel;
          cell4.innerHTML = newItem.Sourcing.Cost;
          cell5.innerHTML = newItem.Sourcing.Location;
          cell6.innerHTML = '<a href ='+newItem.Sourcing.Link+' style="text-decoration:none"> <button class="btn btn-secondary">Order</button></a>';
          cell7.innerHTML = '<button class="glyphicon glyphicon-edit btn-sm" id="edit_button"></button><button class="glyphicon glyphicon-remove btn-sm" id="remove_button"></button></div>';
          
          document.getElementById("edit_button").onclick=editRow;
          document.getElementById("remove_button").onclick = deleteRow;
          
          function deleteRow(){
              $(this).closest('tr').remove();
          }
              
           
          function editRow(){
              cell7.innerHTML='<button class ="glyphicon glyphicon-ok btn-sm" id="edit_confirm"></button>'
              cell1.setAttribute('contenteditable',true);
              cell2.setAttribute('contenteditable',true);
              cell3.setAttribute('contenteditable',true);
              cell4.setAttribute('contenteditable',true);
              cell5.setAttribute('contenteditable',true);
              cell6.setAttribute('contenteditable',true); 
              
              document.getElementById("edit_confirm").onclick =confirmEdit;
              function confirmEdit(){
                  cell7.innerHTML ='<button class="glyphicon glyphicon-edit btn-sm" id="edit_button"></button><button class="glyphicon glyphicon-remove btn-sm" id="remove_button"></button></div>';
              }
              
          }
            
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
      var ordersRef = new Firebase('https://square1.firebaseio.com/orders');
      ordersRef.once("value", function(snapshot) {
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
          col_order_num.setAttribute("contenteditable", true);
          var col_name = row.insertCell(colIndex++);
          col_name.innerHTML = newItem.name;
          col_name.setAttribute("contenteditable", true);
          var col_address = row.insertCell(colIndex++);
          col_address.innerHTML = newItem.address;
          col_address.setAttribute("contenteditable", true);
          var col_items = row.insertCell(colIndex++);
          col_items.innerHTML = newItem.items;
          col_items.setAttribute("contenteditable", true);
          var col_deadline = row.insertCell(colIndex++);
          col_deadline.innerHTML = newItem.deadline;
          col_deadline.setAttribute("contenteditable", true);

          // calculate the days left 
          var sortColindex = colIndex;
          var col_dayLeft = row.insertCell(colIndex++);
          col_dayLeft.setAttribute("style", "font-weight:bold");
          var daysLeft = getTimeLeft(newItem.deadline);
          col_dayLeft.innerHTML = daysLeft;


          // insert view button
          row.insertCell(colIndex++).innerHTML = '<button type="button" class="btn btn-info"' +
          'class="viewMore_btn" data-toggle="collapse" data-target="#demo"}>View</button>';

          // hidden key
          var hidden_key = row.insertCell(colIndex++);
          hidden_key.innerHTML = data.key();
          hidden_key.style.display='none';

          // according to daysleft to change the color of the circle in status columns
          // but without completion check 
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
          // 
        }); // FOR EACH

        var oTable = $('#ordersTable').DataTable({
          "lengthMenu": [[20, 50, 100, -1], [20, 50, 100, "All"]],
          "order": [[6, 'asc']],
          "columnDefs": [
              {"targets": [0,7], "orderable": false}
            ],
          "sDom": '<"row view-filter"<"col-sm-12"<"pull-left"l><"pull-right"f> '+
                  '<"clearfix">>>t<"row view-filter"<"pull-left" i><"pull-right" p>>',
          "pagingType": "full_numbers",
          "bAutoWidth" : false,
          "scrollX": true,
          "scrollY": true,
          "initComplete" : function () {
            $('.dataTables_scrollBody thead tr').addClass('hidden');
          },
          // "aoColumnDefs": [
          //   { "sWidth": "10%", "aTargets": [ -1 ] }
          // ]
        });  // dataTable config  

        // driver for editing datatable
        var changeDataHashTable = [];
        var editableArray = document.querySelector('#ordersTable');
        editableArray.addEventListener('keydown', function(e){
          if (e.code=="Enter"){
            // enter key is pressed, send data
            // get text, index, index name, and firebase ID
            var newData = e.target.innerText;
            var FBKey = e.target.parentNode.lastChild.innerText;
            var IndexCol = e.target.cellIndex;
            var firebaseCol = document.querySelectorAll('#ordersTable thead tr th')[IndexCol].innerText;
            switch (firebaseCol){
              case "Order#":
                firebaseCol="order_num";
                break;
              case "Name": 
                firebaseCol="name";    
                break;
              case "Address": 
                firebaseCol="address"; 
                break;
              case "Items": 
                firebaseCol="items";   
                break;
              case "Deadline":
                firebaseCol="deadline";
                break;
            }
            // send query
            // create the object to send
            objToSend = {};
            objToSend[firebaseCol] = newData;
            new Firebase('https://square1.firebaseio.com/orders/'+ FBKey).update(objToSend);
            //move focus down
            try {
              // down
              e.target.parentNode.nextSibling.children[IndexCol].focus();
            }
            catch(err) {
              // can't move down
              e.target.blur();
            }
          }  // if (enter)
        }, false);  // keydown eventlistener

        // editable stuff
        // when a cell loses focus, edit it/send to firebase
        // $('td[contenteditable="true"]').bind("blur", function(){alert("lost focus");});

        // show more details--------------------------------------------------------
        function details(d){
          return '<h4> Need more details for ' + d[2] + ' ! </h4>';
        }

        // Add event listener for opening and closing details
        $('#ordersTable-body').on('click', 'td .btn', function () {
          var tr = $(this).closest('tr');
          var row = oTable.row(tr);
   
          if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
          }
          else {
            // Open this row
            row.child(details(row.data())).show();
            tr.addClass('shown');
          }
        });
      });  //end orderRef.once  
      

      // add item functionality -----------------------------------------
      document.getElementById("new_orders_entry").style.display='none';
      var buttonID = document.getElementById("add_item");
      var ifAddEntryBool = false;
      buttonID.onclick = toggleAddEntryButton;

      var addFirebase = document.getElementById("add_to_firebase");
      addFirebase.onclick = function(){
        ordersRef.push({
          "order_num":    document.getElementById("order_num_input").value,
          "name":         document.getElementById("name_input").value,
          "address":      document.getElementById("address_input").value,
          "items":        document.getElementById("items_input").value,
          "deadline":     document.getElementById("deadline_input").value,
        });
        // showNewItem();;
        toggleAddEntryButton();
        clearFormInputs();
        // $('#page-wrapper').load('pages/orders.html');
        load("orders");
      } // addFirebase
      //----------------------------function -------------------------------

      function toggleAddEntryButton(){
        if (ifAddEntryBool){
          document.getElementById("new_orders_entry").style.display='none';
          document.getElementById("add_item").innerHTML = "Add Item to Inventory";
          ifAddEntryBool = false; 
        }
        else {
          document.getElementById("new_orders_entry").style.display='block';
          document.getElementById("add_item").innerHTML = "Cancel";
          ifAddEntryBool = true;
        }
      }

      function clearFormInputs(){
        document.getElementById("order_num_input").value = "";
        document.getElementById("name_input").value = "";
        document.getElementById("address_input").value = "";
        document.getElementById("items_input").value = "";
        document.getElementById("deadline_input").value = "";
      }

      function getTimeLeft(deadline){
        var dateObj = new Date(deadline);  // convert string to date object 

        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        var firstDate = dateObj;
        var secondDate = new Date();

        var diffDays = Math.round((firstDate.getTime() - secondDate.getTime())/(oneDay));
        if (diffDays <= 0)
          diffDays = 0;

        return diffDays;
      }

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
                  cell0 = row.insertCell(0);
                  cell0.setAttribute('contenteditable',false);
                  cell1 = row.insertCell(1);
                  cell1.setAttribute('contenteditable',false);
                  cell2 = row.insertCell(2);
                  cell2.setAttribute('contenteditable',false);
                  cell3 = row.insertCell(3);
                  cell3.setAttribute('contenteditable',false);
                  cell4 = row.insertCell(4);
                  cell4.setAttribute('contenteditable',false);
                  cell5 = row.insertCell(5);
                  cell4.setAttribute('contenteditable',false);
                  cell6 = row.insertCell(6);
                  
                  cell0.innerHTML = '<div class ="foo orange"></div>'
                  cell1.innerHTML = newItem.Order
                  cell2.innerHTML = newItem.Item;
                  cell3.innerHTML = newItem.location;
                  cell4.innerHTML = newItem.next_task;
                  cell5.innerHTML = newItem.team_member;
                  cell6.innerHTML = ' <button class="btn btn-secondary">Next</button>'
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

// run bottleneck logic here, called from loadfirebase() in the dash case of that switch
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
  var ordersRef = new Firebase('https://square1.firebaseio.com/orders');
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
