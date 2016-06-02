// ui stuff ------------------------------------------------------------------------------------

// onload, load in the dashboard
$( document ).ready(function() {
  // load("orders");
  load("dash");
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
      jQuery.get('pages/shipping.html', function(data) {
        document.getElementById("page-wrapper").innerHTML = data;
        loadFirebase(id);
      });
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
        $("#dataTable tr").remove(); //Clear table to prevent duplicates appending
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
            
          var hiddenKey=row.insertCell(8);
          hiddenKey.innerHTML=data.key();
          hiddenKey.style.display='none';
            

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
//          cell6.innerHTML = '<a href ='+newItem.Sourcing.Link+' style="text-decoration:none"> <button class="btn btn-secondary">Order</button></a>';
          cell6.innerHTML =newItem.Sourcing.Link;


            
            

          cell7.innerHTML = '<button class="glyphicon glyphicon-edit btn-sm glyphic-cadetblue" id="edit_button"></button><button class="glyphicon glyphicon-trash btn-sm glyphic-red" id="remove_button"></button></div>';
          
          document.getElementById("remove_button").onclick = deleteRow;

          //Deletes a row if the remove icon is clicked  
          function deleteRow(){
              removed_tr = $(this).closest('tr').remove();
              var fb_key = $(removed_tr).children('td:last').text();
              inventoryRef.child(fb_key).remove();                        
          }
            
          //Edits a certain table entry when the edit icon is clicked
          $(document.getElementById("edit_button")).on('click',function() {

              //Highlight row to edit
              var currentRow = $(this).closest('tr');
              currentRow.css('background-color','#a8cb17');
              var currentTD = currentRow.children('td');
              for (var i=1; i<currentTD.length-2; ++i){
                  currentTD[i].setAttribute('contenteditable',true);
              }
    
              for (var i=1; i<currentTD.length; ++i){

                  if(i==7){
                      currentTD[i].innerHTML='<button class ="glyphicon glyphicon-ok btn-sm glyphic-green" id="edit_confirm"></button>';
                      document.getElementById("edit_confirm").onclick =confirmEdit;
                      function confirmEdit(){
                          var currRow =$(this).closest('tr');
                          currRow.css('background-color','#FFFFFF');
                          currentTD[7].innerHTML ='<button class="glyphicon glyphicon-edit btn-sm glyphic-cadetblue" id="edit_button"></button><button class="glyphicon glyphicon-trash btn-sm glyphic-red" id="remove_button"></button></div>';
                          for(var i=0; i<currentTD.length;++i){
                              currentTD[i].setAttribute('contenteditable',false);
                              var fb_key = currentRow.children('td:last').text();
                              inventoryRef.child(fb_key).update({
                                  Part:currentTD[1].innerHTML,
                                  Sourcing:{
                                      "Cost":currentTD[4].innerHTML,
                                      "Quantity":currentTD[2].innerHTML,
                                      "ReorderLevel":currentTD[3].innerHTML,
                                      "Location":currentTD[5].innerHTML,
                                      "Link":currentTD[6].innerHTML
                                  }
                              })
                          }
                      }

                  }
                  
                  
              }
              
          });          
            
        })
      })

      document.getElementById("new_inventory_entry").style.display='none';
      var buttonID = document.getElementById("add_item");
      buttonID.onclick = function(){
        document.getElementById("new_inventory_entry").style.display='block';
        var buttonPush = document.getElementById("add_item");
        buttonPush.onclick =function(){
            inventoryRef.push({
                Part:document.getElementById("part_input").value,
                Sourcing: {
                    "Cost":document.getElementById("cost_input").value,
                    "Quantity":document.getElementById("quantity_input").value,
                    "ReorderLevel":document.getElementById("reorder_input").value,
                    "Location":document.getElementById("location_input").value,
                    "Link":document.getElementById("link_input").value
                }
                
            })
            
            document.getElementById("new_inventory_entry").style.display='none';
        }
      }
      


//      var addFirebase = document.getElementById("add_to_firebase");
//      addFirebase.onclick = function(){
//        inventoryRef.push({
//          Part:document.getElementById("part_input").value,
//          Sourcing: {
//            "Cost":         document.getElementById("cost_input").value,
//            "Quantity":     document.getElementById("quantity_input").value,
//            "ReorderLevel": document.getElementById("reorder_input").value,
//            "Location":     document.getElementById("location_input").value,
//            "Link":         document.getElementById("link_input").value
//          }
//        })
//      }
      break;
    case "orders":
      // -------------------------------------------------------------------------
      // orders
      // -------------------------------------------------------------------------
      // clear the table in case there's anything there
      // get firebase stuff
      var ordersRef = new Firebase(addr.orders);

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
          row.insertCell(colIndex++).innerHTML = '<button class="glyphicon glyphicon-edit btn-sm" id="orders" onclick="driver.editEntry(event)"></button></button><button class="glyphicon glyphicon-remove btn-sm" onclick="driver.deleteEntry(event)">'

          // hidden key
          var hidden_key = row.insertCell(colIndex++);
          hidden_key.innerHTML = data.key();
          hidden_key.style.display='none';

          // update
          driver.updateStatus(col_status,daysLeft);
        }); // FOR EACH
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
    var ordersRef = new Firebase(addr.orders);

      makeTable = function(snapshot) {
        document.getElementById("shippingTable-body").innerHTML = "";
        var table = document.getElementById("shippingTable-body");

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
          var col_weight = row.insertCell(colIndex++);
          col_weight.innerHTML = newItem.weight;
          col_weight.setAttribute("contenteditable", false);
          col_weight.setAttribute("celltype", "weight");
          var col_length = row.insertCell(colIndex++);
          col_length.innerHTML = newItem.flength;
          col_length.setAttribute("contenteditable", false);
          col_length.setAttribute("celltype", "length");
          var col_height = row.insertCell(colIndex++);
          col_height.innerHTML = newItem.fheight;
          col_height.setAttribute("contenteditable", false);
          col_height.setAttribute("celltype", "height");
          var col_width = row.insertCell(colIndex++);
          col_width.innerHTML = newItem.fwidth;
          col_width.setAttribute("contenteditable", false);
          col_width.setAttribute("celltype", "width");
          var col_deadline = row.insertCell(colIndex++);
          col_deadline.innerHTML = newItem.deadline;
          col_deadline.setAttribute("contenteditable", false);
          col_deadline.setAttribute("celltype", "deadline");
          

          //insert shipping button
          row.insertCell(colIndex++).innerHTML = '<button type="button" class="btn btn-info"' +
          'class="viewMore_btn" data-toggle="collapse" data-target="#demo" onclick="genLabel()"}>Shipping Label </button>';

          // insert pullout page button
          row.insertCell(colIndex++).innerHTML = '<button type="button" class="btn btn-info"' +
          'class="viewMore_btn" data-toggle="collapse" data-target="#demo" onclick="genSlip()"}>Insert Slip </button>';

          // edit
          row.insertCell(colIndex++).innerHTML = '<button class="glyphicon glyphicon-edit btn-sm" id="shipping" onclick="driver.editEntry(event)"></button></button><button class="glyphicon glyphicon-remove btn-sm" onclick="driver.deleteEntry(event)">'

          // hidden key
          var hidden_key = row.insertCell(colIndex++);
          hidden_key.innerHTML = data.key();
          hidden_key.style.display='none';

          // update
          driver.updateStatus(col_status,daysLeft);
        }); // FOR EACH
      }
      // if anything happens, reload
      ordersRef.on("value", makeTable);
      ordersRef.on("child_added", makeTable);
      ordersRef.on("child_changed", makeTable);
      ordersRef.on("child_removed", makeTable);
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
      col_status.innerHTML = '<div id ="orangeFilledCircle"></div>';
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
    switch (e.target.getAttribute("class")){
      case "glyphicon glyphicon-edit btn-sm":
        // uneditable -> editable

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
              newDom.style.backgroundColor = "#ffd480";

              // replace old dom
              domToReplace = tdArr[i];
              domToReplace.parentElement.insertBefore(newDom, domToReplace);
              domToReplace.parentElement.removeChild(domToReplace);
              tdArr[i].innerHTML = "<strong>mm/dd/yyyy</strong>";
              break
            case "weight":
              if (tdArr[i]==""){
                tdArr[i].innerHTML = "<strong>weight</strong>";
              }
              break 
            case "length":
              if (tdArr[i]==""){
                tdArr[i].innerHTML = "<strong>length</strong>";
              }
              break 
            case "height":
              if (tdArr[i]==""){
                tdArr[i].innerHTML = "<strong>height</strong>";
              }
              break 
            case "width":
              if (tdArr[i]==""){
                tdArr[i].innerHTML = "<strong>width</strong>";
              }
              break 
          }
        }
          
        // change button
        e.target.setAttribute("class", "glyphicon glyphicon-ok btn-sm");
        // change cancel button too
        e.target.parentElement.lastChild.setAttribute("class", "glyphicon glyphicon-remove btn-sm");

        // change style
        e.target.parentElement.parentElement.style.backgroundColor = "#ffd480";

        break;

      case "glyphicon glyphicon-ok btn-sm":
         switch (e.target.getAttribute("id")){
          case "orders":
            // editable -> uneditable
            // send to firebase
            // reload

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
            e.target.parentElement.lastChild.setAttribute("class", "glyphicon glyphicon-remove btn-sm");

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
                  colName = $('#ordersTable').find('th').eq(this.cellIndex).text().trim();
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
                    // default:
                  }


                  dataToSend[headerText] = data;
                }

              deadlineCol = $('#ordersTable').find('input').val();
                if (deadlineCol){
                  headerText = "deadline";
                  data = deadlineCol;

                  dataToSend[headerText] = data;
                }
              });// each td find contenteditable
            }); // find row of the event happens

            // console.log(dataToSend);

            var ordersRef = new Firebase(addr.orders + entry_key);
            ordersRef.update(dataToSend);

            // change style
            e.target.parentElement.parentElement.style.backgroundColor = "";
            // change arianas stupid input thing 
            tdArr = e.target.parentElement.parentElement.children;
            for (i in tdArr){
              if (tdArr[i].getAttribute){
                if (tdArr[i].getAttribute("celltype")=="deadline"){
                  tdArr[i].style.backgroundColor = "";
                }            
              }
            }
            break;

          case "shipping":
          // editable -> uneditable
            // send to firebase
            // reload

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
            e.target.parentElement.lastChild.setAttribute("class", "glyphicon glyphicon-remove btn-sm");

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
                  colName = $('#ordersTable').find('th').eq(this.cellIndex).text().trim();
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
                    // default:
                  }


                  dataToSend[headerText] = data;
                }

              deadlineCol = $('#ordersTable').find('input').val();
                if (deadlineCol){
                  headerText = "deadline";
                  data = deadlineCol;

                  dataToSend[headerText] = data;
                }
              });// each td find contenteditable
            }); // find row of the event happens

            // console.log(dataToSend);

            var ordersRef = new Firebase(addr.orders + entry_key);
            ordersRef.update(dataToSend);

            // change style
            e.target.parentElement.parentElement.style.backgroundColor = "";
            // change arianas stupid input thing 
            tdArr = e.target.parentElement.parentElement.children;
            for (i in tdArr){
              if (tdArr[i].getAttribute){
                if (tdArr[i].getAttribute("celltype")=="deadline"){
                  tdArr[i].style.backgroundColor = "";
                }            
              }
            }
            break;

      }
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
      "weight":     "",
      "height":     "",
      "width":      "",
      "length":      "",
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

  makeLabel: function(e){
      // if 
      var path    = require("path");
      console.log(__dirname);

      app.get('/',function(req,res){
        res.sendFile(path.join(__dirname+'/shipping.html'));
        console.log(__dirname);
        //__dirname : It will resolve to your project folder.
      });


      app.listen(3000);

      console.log("Running at Port 3000");

      var apiKey = '5NTaCzvLSV1MnYPbNpwxOg';
      var easypost = require('node-easypost')(apiKey);

      // set addresses
      var toAddress = {
          name: document.getElementById("name_input").value,
          street1: document.getElementById("address_input").value,
          city: "Redondo Beach",
          state: "CA",
          zip: "90277",
          country: "US",
          phone: "310-808-5243"
      };
      var fromAddress = {
          name: "Square1",
          street1: "The Garage",
          street2: "4th Floor",
          city: "Evanston",
          state: "Il",
          zip: "60201",
          phone: "415-123-4567"
      };

      // verify address
      easypost.Address.create(fromAddress, function(err, fromAddress) {
          fromAddress.verify(function(err, response) {
              if (err) {
                  console.log('Address is invalid.');
              } else if (response.message !== undefined && response.message !== null) {
                  console.log('Address is valid but has an issue: ', response.message);
                  var verifiedAddress = response.address;
              } else {
                  var verifiedAddress = response;
              }
          });
      });

      // set parcel
      easypost.Parcel.create({
          predefined_package: "InvalidPackageName",
          weight: 21.2
      }, function(err, response) {
          console.log(err);
      });

      var parcel = {
          length: 10.2,
          width: 7.8,
          height: 4.3,
          weight: 21.2
      };

      // // create customs_info form for intl shipping
      // var customsItem = {
      //     description: "Audiovert Speaker",
      //     hs_tariff_number: 123456,
      //     origin_country: "US",
      //     quantity: 2,
      //     value: 96.27,
      //     weight: 21.1
      // };

      // var customsInfo = {
      //     customs_certify: 1,
      //     customs_signer: "Hector Hammerfall",
      //     contents_type: "gift",
      //     contents_explanation: "",
      //     eel_pfc: "NOEEI 30.37(a)",
      //     non_delivery_option: "return",
      //     restriction_type: "none",
      //     restriction_comments: "",
      //     customs_items: [customsItem]
      // };
      var postage_label;

      // create shipment
      easypost.Shipment.create({
          to_address: toAddress,
          from_address: fromAddress,
          parcel: parcel,
          customs_info: customsInfo
      }, function(err, shipment) {
          // buy postage label with one of the rate objects
          shipment.buy({rate: shipment.lowestRate(['USPS', 'ups', 'Fedex']), insurance: 100.00}, function(err, shipment) {
              console.log(shipment.tracking_code);
              console.log(shipment.postage_label.label_url);
              postage_label = shipment.postage_label.label_url;

          });
      });
   
  },
}

// global refs
addr = {
  orders: "https://square1.firebaseio.com/orders/",
}
