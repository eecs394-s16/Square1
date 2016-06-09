// ui stuff ------------------------------------------------------------------------------------

// refs
addr = function(feature){
  return "https://square1.firebaseio.com/" + String(UID) + "/" + feature + "/";
}

// globalref for user authentication
var globalref = new Firebase("https://square1.firebaseio.com/");
// Register the callback to be fired every time auth state changes
globalref.onAuth(authDataCallback);
// Create a callback which logs the current auth state
var UID = -1;
function authDataCallback(authData) {
  if (authData) {
    // logged in, already in index so stay here
    // get uid
    UID = authData.uid;
    load("dash");
    // load("shipping");
  }
  else {
    // not logged in, go to splash to log in
    window.location = "splash.html";
  }
}
// also check manually at page load
authDataCallback(globalref.getAuth());

// loads pages by redrawing page-wrapper DOM
function load(id) {
  switch(id) {
    case "dash":
      $("#page-wrapper").load('pages/dash.html', function(data) {
        $('#inventory-panel').load('pages/inventory-widget.html', function(){
          $('#orders-panel').load('pages/orders-widget.html', function(){
            $('#shipping-panel').load('pages/shipping-widget.html', function(){
              $('#tasks-panel').load('pages/tasks-widget.html', function(){
                loadFirebase(id);
              });
            });
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

// sick and tired of defining these things
// keeping this stuff here
// props.feature contains array of key strings
// these are the keys for writing/reading objects for that feature
// TODO change orders code to this
var props = {
  "inventory": ["part", "quantity", "reorder_level", "cost", "location", "order_link"],
  "orders": [],
  "shipping": ["order_num", "name", "address", "item", "weight", "length", "height", "width", "deadline"],
}

// loads firebase databases (multiple, one for each feature)
// creates listeners for rendering data, adding data, etc
// automatically runs on page load
// call again every time page is drawn (in function "load")
// read about js switches: http://www.w3schools.com/js/js_switch.asp
function loadFirebase(id){
  // only return the code for that page being loaded
  switch(id) {
    case "dash":
      // display bottlenecked stuff in widgets
      inventory_bottleneckLogic();
      orders_bottleneckLogic();
      shipping_bottleneckLogic();
      tools_bottleneckLogic();
      break;
    case "inventory":
      var inventoryRef = new Firebase(addr("inventory"));

      makeTable = function(snapshot) {
        var table = document.getElementById("myTable-body");
        table.innerHTML = "";

        snapshot.forEach(function(data) {
          var newItem = data.val();
          var row = table.insertRow(0);
          var colIndex = 0;

          // first create the status column with defult color circle 
          var col_status = row.insertCell(colIndex++);
          col_status.innerHTML = '<div class ="foo grey"></div>'
          col_status.setAttribute("class", "firstcol")

          // insert following data 
          for (i in props.inventory){
            key = props.inventory[i];
            if (key=="order_link"){
              cell = row.insertCell(colIndex++);
              cell.innerHTML = '<a href =\"'+newItem[key]+'\"" style="text-decoration:none"> <button class="btn btn-secondary">Order</button></a>';
              cell.setAttribute("contenteditable", false);
              cell.setAttribute("celltype", key);
              continue;
            }
            cell = row.insertCell(colIndex++);
            cell.innerHTML = newItem[key];
            cell.setAttribute("contenteditable", false);
            cell.setAttribute("celltype", key);
          }

          // edit
          row.insertCell(colIndex++).innerHTML = '<button class="glyphicon glyphicon-edit btn-sm btn-info" onclick="driver.editEntry(event)"></button></button> <button class="glyphicon glyphicon-trash btn-sm btn-danger" onclick="driver.deleteEntry(event)">'


          // hidden key
          var hidden_key = row.insertCell(colIndex++);
          hidden_key.innerHTML = data.key();
          hidden_key.style.display='none';

          // update
          driver.updateStatus(col_status, newItem, "inventory");
        }); // FOR EACH

        tableObject = document.getElementById("myTable");
        sorttable.makeSortable(tableObject);
      } // makeTable
      // if anything happens, reload
      inventoryRef.on("value", makeTable);
      // ordersRef.on("child_added", makeTable);
      // ordersRef.on("child_changed", makeTable);
      // ordersRef.on("child_removed", makeTable);
      break;
    case "orders":
      // -------------------------------------------------------------------------
      // orders
      // -------------------------------------------------------------------------
      // clear the table in case there's anything there
      // get firebase stuff
      var ordersRef = new Firebase(addr("orders"));

      makeTable = function(snapshot) {
        var table = document.getElementById("ordersTable-body");
        table.innerHTML = "";

        snapshot.forEach(function(data) {
          var newItem = data.val();
          var row = table.insertRow(0);
          var colIndex = 0;

          // first create the status column with defult color circle 
          var col_status = row.insertCell(colIndex++);
          col_status.innerHTML = '<div class ="foo grey"></div>'

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
          row.insertCell(colIndex++).innerHTML = '<button class="glyphicon glyphicon-edit btn-sm btn-info" featureSrc="orders" onclick="driver.editEntry(event)"></button></button> <button class="glyphicon glyphicon-trash btn-sm btn-danger" onclick="driver.deleteEntry(event)">'

          // hidden key
          var hidden_key = row.insertCell(colIndex++);
          hidden_key.innerHTML = data.key();
          hidden_key.style.display='none';

          // update
          driver.updateStatus(col_status, daysLeft, "orders");
        }); // FOR EACH

        tableObject = document.getElementById("ordersTable");
        sorttable.makeSortable(tableObject);
      } // makeTable
      // if anything happens, reload
      ordersRef.on("value", makeTable);
      // ordersRef.on("child_added", makeTable);
      // ordersRef.on("child_changed", makeTable);
      // ordersRef.on("child_removed", makeTable);
      break;
    case "shipping":
      // -------------------------------------------------------------------------
      // shipping
      // -------------------------------------------------------------------------
      // clear the table in case there's anything there
      // get firebase stuff
      var shipRef = new Firebase(addr("shipping"));

      makeTable = function(snapshot) {
        document.getElementById("myTable-body").innerHTML = "";
        var table = document.getElementById("myTable-body");

        snapshot.forEach(function(data) {
          var newItem = data.val();
          var row = table.insertRow(0);
          var colIndex = 0;

          // first create the status column with defult color circle 
          var col_status = row.insertCell(colIndex++);
          col_status.innerHTML = '<div class ="foo grey"></div>'

          // col_status.setAttribute("class", "firstcol")
          // insert following data 
          // TODO use props instead of hardcode
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
          col_items.setAttribute("celltype", "items");
          var col_weight = row.insertCell(colIndex++);
          col_weight.innerHTML = newItem.weight;
          col_weight.setAttribute("contenteditable", false);
          col_weight.setAttribute("celltype", "weight");

          var col_length = row.insertCell(colIndex++);
          col_length.innerHTML = newItem.length;
          col_length.setAttribute("contenteditable", false);
          col_length.setAttribute("celltype", "length");

          var col_height = row.insertCell(colIndex++);
          col_height.innerHTML = newItem.height;
          col_height.setAttribute("contenteditable", false);
          col_height.setAttribute("celltype", "height");

          var col_width = row.insertCell(colIndex++);
          col_width.innerHTML = newItem.width;
          col_width.setAttribute("contenteditable", false);
          col_width.setAttribute("celltype", "width");
          var col_deadline = row.insertCell(colIndex++);
          col_deadline.innerHTML = newItem.deadline;
          col_deadline.setAttribute("contenteditable", false);
          col_deadline.setAttribute("celltype", "deadline");



          var col_shippingLabel = row.insertCell(colIndex++);
          //uncomment next line to generate shipping labels
          //var label = driver.makeLabel(newItem.name, newItem.address,newItem.weight,newItem.length,newItem.height, newItem.width );
          //replace this # after href with var label to link to the shipping label
          col_shippingLabel.innerHTML = '<a href="#" "="" style="text-decoration:none"> <button class="btn btn-secondary">Make Label</button></a>';
          // col_shippingLabel.setAttribute("contenteditable", false);
          col_shippingLabel.setAttribute("celltype", "shippingLabel");
          
          var col_productInsert = row.insertCell(colIndex++);
          col_productInsert.innerHTML = '<a href="#" "="" style="text-decoration:none"> <button class="btn btn-secondary">Make Label</button></a>';
          // col_productInsert.setAttribute("contenteditable", false);
          col_productInsert.setAttribute("celltype", "productInsert");
          var col_completion = row.insertCell(colIndex++);
          // col_completion.setAttribute("contenteditable", false);
          col_completion.setAttribute("celltype", "completion");

          // // calculate the days left 
          // var sortColindex = colIndex;
          // var col_dayLeft = row.insertCell(colIndex++);
          // col_dayLeft.setAttribute("style", "font-weight:bold");
          var daysLeft = driver.getTimeLeft(newItem.deadline);
          // col_dayLeft.innerHTML = daysLeft;

          // edit
          row.insertCell(colIndex++).innerHTML = '<button class="glyphicon glyphicon-edit btn-sm btn-info" onclick="driver.editEntry(event)"></button></button> <button class="glyphicon glyphicon-trash btn-sm btn-danger" onclick="driver.deleteEntry(event)">'

          // hidden key
          var hidden_key = row.insertCell(colIndex++);
          hidden_key.innerHTML = data.key();
          hidden_key.style.display='none';

          // update
          driver.updateStatus(col_status, daysLeft, "shipping");

          // TODO; take out this random stuff for demo
          if (Math.round(Math.random()*2)==0){
            col_completion.innerHTML = '<span class="glyphicon glyphicon-ok">';
            col_status.innerHTML = '<div id = "greenFilledCircle"></div>';
          } else {
            col_completion.innerHTML = '<span class="glyphicon glyphicon-remove">';
            col_status.innerHTML = '<div id = "redFilledCircle"></div>';
          }
          // hardcoded just for testing
          if (newItem.order_num=="2203"){
            col_completion.innerHTML = '<span class="glyphicon glyphicon-remove">';
            col_status.innerHTML = '<div id = "redFilledCircle"></div>';
          }
        }); // FOR EACH

        tableObject = document.getElementById("myTable");
        sorttable.makeSortable(tableObject);

      } // makeTable
      // if anything happens, reload
      shipRef.on("value", makeTable);
      // ordersRef.on("child_added", makeTable);
      // ordersRef.on("child_changed", makeTable);
      // ordersRef.on("child_removed", makeTable);
      break;
    case "tasks":
      var tasksRef = new Firebase(addr("orders"));
      tasksRef.on("value", function(snapshot){
        var table = document.getElementById("taskTable-body");
        snapshot.forEach(function(data){
          var newItem = data.val();
          var row = table.insertRow(0);
          var colIndex = 0;
          cell0 = row.insertCell(colIndex++);
          cell0.setAttribute("class","firstcol");
          cell1 = row.insertCell(colIndex++);
          cell1.setAttribute('contenteditable',false);
          cell2 = row.insertCell(colIndex++);
          cell2.setAttribute('contenteditable',false);
          cell3 = row.insertCell(colIndex++);
          cell3.setAttribute('contenteditable',false);
          cell4 = row.insertCell(colIndex++);
          cell4.setAttribute('contenteditable',false);
          cell5 = row.insertCell(colIndex++);
          cell5.setAttribute('contenteditable',false);
          cell6 = row.insertCell(colIndex++);
          cell6.setAttribute('contenteditable',false);
          
          //Default status
          cell0.innerHTML = '<div class ="foo orange"></div>'
          
          cell1.innerHTML = newItem.order_num;
          cell2.innerHTML = newItem.items;
          cell3.innerHTML = newItem.Location;
          cell4.innerHTML = newItem.task.task1.description;
          cell5.innerHTML = newItem.task.task1.team_member;
          cell6.innerHTML = ' <button class="btn btn-secondary" id="next_task">Next</button>';
            
          var daysLeft = driver.getTimeLeft(newItem.deadline);
          driver.updateStatus(cell0,daysLeft,"orders");
          
//          row.insertCell(colIndex++).innerHTML = '<button class="glyphicon glyphicon-edit btn-sm btn-info" featureSrc="orders" onclick="driver.editEntry(event)">'
          document.getElementById("next_task").onclick = displayNextTask;
          
          function displayNextTask(){
              
          }

          
        })
              
      })
      break;
    default:
      console.log("got bad load id");
  }
}

// run bottleneck logic here, called from loadFirebase() in the dash case of that switch
function inventory_bottleneckLogic(){
  // bottleneck code here!
  // load all relevant firebase refs, iterate through to detect "bottlenecks"
  // if bottleneck is detected, show user in the appropriate widget
  // console.log("go here");

  // INVENTORY BOTTLENECK CODE ---------------------------------------------------
  var inventoryRef = new Firebase(addr("inventory"));

  makeTable = function(snapshot) {
    var table = document.getElementById("inventoryTable-body");
    table.innerHTML = "";

    snapshot.forEach(function(data) {
      var newItem = data.val();
      var row = table.insertRow(0);
      var colIndex = 0;

      // first create the status column with defult color circle 
      var col_status = row.insertCell(colIndex++);
      col_status.innerHTML = '<div class ="foo grey"></div>'
      col_status.setAttribute("class", "firstcol")


      key = props.inventory[0];
      cell = row.insertCell(colIndex++);
      cell.innerHTML = newItem[key];

      // hidden key
      var hidden_key = row.insertCell(colIndex++);
      hidden_key.innerHTML = data.key();
      hidden_key.style.display='none';

      // update
      driver.updateStatus(col_status, newItem, "inventory");
    }); // FOR EACH

    document.getElementById("total_inventory_number").innerHTML = snapshot.numChildren();
  } // makeTable
  // if anything happens, reload
  inventoryRef.on("value", makeTable);
}

function orders_bottleneckLogic(){
  var ordersRef = new Firebase(addr("orders"));
  var k=0;
  makeTable = function(snapshot) {
    var table = document.getElementById("ordersTable-body");
    table.innerHTML = "";

    snapshot.forEach(function(data) {
      var newItem = data.val();
      var row = table.insertRow(0);
      var colIndex = 0;

      // first create the status column with defult color circle 
      var col_status = row.insertCell(colIndex++);
      col_status.innerHTML = '<div class ="foo grey"></div>'

      col_status.setAttribute("class", "firstcol")

      // insert following data 
      var col_order_num = row.insertCell(colIndex++);
      col_order_num.innerHTML = newItem.order_num;
      col_order_num.setAttribute("contenteditable", false);
      col_order_num.setAttribute("celltype", "order_num");  



      var daysLeft = driver.getTimeLeft(newItem.deadline);
      if (daysLeft <= 7){
        k++;
      }
      // update
      document.getElementById("active_order_number").innerHTML = String(k);
      driver.updateStatus(col_status, daysLeft, "orders");
    }); // FOR EACH

  } // makeTable
  // if anything happens, reload
  ordersRef.on("value", makeTable);


} // orders_bottleneckLogic

function shipping_bottleneckLogic(){
  var shipRef = new Firebase(addr("shipping"));

  makeTable = function(snapshot) {
    var k=0;
    document.getElementById("shippingTable-body").innerHTML = "";
    var table = document.getElementById("shippingTable-body");

    snapshot.forEach(function(data) {
      var newItem = data.val();
      var row = table.insertRow(0);
      var colIndex = 0;

      // first create the status column with defult color circle 
      var col_status = row.insertCell(colIndex++);
      col_status.innerHTML = '<div class ="foo grey"></div>'

      var col_order_num = row.insertCell(colIndex++);
      col_order_num.innerHTML = newItem.order_num;
      col_order_num.setAttribute("contenteditable", false);
      col_order_num.setAttribute("celltype", "order_num");  
      var daysLeft = driver.getTimeLeft(newItem.deadline);

      // update
      driver.updateStatus(col_status, daysLeft, "shipping");

      // TODO; take out this random stuff for demo
      if (Math.round(Math.random()*2)==0){
        col_status.innerHTML = '<div id = "greenFilledCircle"></div>';
      }
      // hardcoded just for testing
      else if (newItem.order_num=="2203"){
        col_status.innerHTML = '<div id = "redFilledCircle"></div>';
        k++;
        document.getElementById("shipping_write").innerHTML = k;
      }
      else {
        col_status.innerHTML = '<div id = "redFilledCircle"></div>';
        k++;
        document.getElementById("shipping_write").innerHTML = k;
      }
    }); // FOR EACH
  } // makeTable
  // if anything happens, reload
  shipRef.on("value", makeTable);
}

function tools_bottleneckLogic(){


}

// global object of driver
driver = {
  orders_viewMore: function(e){
    // $("#viewMore").click(function(e){
   // orderstable's viewMore button to show details 
    e.preventDefault();

    var hiddenRow = e.target.parentNode.parentNode.nextSibling;

    if (hiddenRow.style.display === 'none') {
      hiddenRow.setAttribute("style", "display:blcok");
    } else {
      hiddenRow.setAttribute("style", "display:none");
    }
  },
  updateStatus: function(col_write, input, src) {
    switch (src){
      case "orders":
        if (input <= 0 ) {
          col_write.innerHTML = '<div id = "redFilledCircle"></div>';
        }
        else if (input <= 7){
          col_write.innerHTML = '<div id = "yellowFilledCircle"></div>';
        }
        else if (input > 7){
          col_write.innerHTML = '<div id = "greenFilledCircle"></div>';
        }
        else {
          col_write.innerHTML = '<div id ="greyFilledCircle"></div>';
        }
        
        break;
      case "shipping":
        if (input <= 0 ) {
          col_write.innerHTML = '<div id = "redFilledCircle"></div>';
        }
        else if (input <= 7){
          col_write.innerHTML = '<div id = "yellowFilledCircle"></div>';
        }
        else if (input > 7){
          col_write.innerHTML = '<div id = "greenFilledCircle"></div>';
        }
        else {
          col_write.innerHTML = '<div id ="greyFilledCircle"></div>';
        }
        
        break;
      case "inventory":
        num = Number(input.quantity);
        rl = Number(input.reorder_level);
        if ((num==NaN)||(rl==NaN)){
          col_write.innerHTML = '<div id ="greyFilledCircle"></div>';
        }
        else if (num<Math.round(rl * 0.8)){
          col_write.innerHTML = '<div id = "redFilledCircle"></div>';
        }
        else if (num<Math.round(rl * 1.2)){
          col_write.innerHTML = '<div id = "yellowFilledCircle"></div>';
        }
        else if (num>Math.round(rl * 1.2)){
          col_write.innerHTML = '<div id = "greenFilledCircle"></div>';
        }
        else {
          col_write.innerHTML = '<div id ="greyFilledCircle"></div>';
        }
        break;
    }
  },
  getTimeLeft: function(deadline){
    var dateObj = new Date(deadline);  // convert string to date object 

    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var firstDate = dateObj;
    var secondDate = new Date();

    var diffDays = Math.round((firstDate.getTime() - secondDate.getTime())/(oneDay));
    return diffDays;
  },  // getTimeLeft
  tempEntry: "",
  editEntry: function(e){
    featureSource = document.getElementById("featureSrc").getAttribute("featureSrc");
    switch (featureSource){
      ////////////////////////////////////////////////////////////////////////////////////
      case "orders":
        switch (e.target.getAttribute("class")){
          case "glyphicon glyphicon-edit btn-sm btn-info":
            // uneditable -> editable

            // console.log("testing");
            // make editable
            this.tempEntry = e.target.parentElement.parentElement.cloneNode(true);
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
                  newDom.style.backgroundColor = "#D5F5E3";

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
            e.target.setAttribute("class", "glyphicon glyphicon-ok btn-sm btn-success");
            // change cancel button too
            e.target.parentElement.lastChild.setAttribute("class", "glyphicon glyphicon-remove btn-sm btn-danger");
            e.target.parentElement.lastChild.setAttribute("onclick", "driver.unselectEntry(event)");


            // change style
            e.target.parentElement.parentElement.style.backgroundColor = "#D5F5E3";

            break;
          case "glyphicon glyphicon-ok btn-sm btn-success":
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
            e.target.parentElement.lastChild.setAttribute("onclick", "driver.deleteEntry(event)");

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

            // replace entry with original data
            // if no modifications, then this will be what's seen because table refresh is not triggered
            // if modifications, this will be overwritten with proper data on table refresh callback
            domToReplace = e.target.parentElement.parentElement;
            domToReplace.parentElement.insertBefore(this.tempEntry, domToReplace);
            domToReplace.parentElement.removeChild(domToReplace);

            // send to database
            var ordersRef = new Firebase(addr("orders") + entry_key);
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
        }
        break;
      case "shipping":
        switch (e.target.getAttribute("class")){
          case "glyphicon glyphicon-edit btn-sm btn-info":
            // uneditable -> editable

            // make editable
            this.tempEntry = e.target.parentElement.parentElement.cloneNode(true);
            tdArr = e.target.parentElement.parentElement.children;
            for (var i=0; i<tdArr.length; i++){
              if (tdArr[i].getAttribute("contenteditable") != null){
                tdArr[i].setAttribute("contenteditable", true);
              }
              // TODO change a few types here
              switch (tdArr[i].getAttribute("cellType")){
                case "deadline":
                  // make input dom
                  var s = '<input contenteditable="true" celltype="deadline" type="date" style="height:100% !important; width:100% !important">'+tdArr[i].html+'</input>'; // HTML string
                  var div = document.createElement('div');
                  div.innerHTML = s;
                  var newDom = div.childNodes[0];
                  newDom.style.backgroundColor = "#D5F5E3";

                  // replace old dom
                  domToReplace = tdArr[i];
                  domToReplace.parentElement.insertBefore(newDom, domToReplace);
                  domToReplace.parentElement.removeChild(domToReplace);
                  tdArr[i].innerHTML = "<strong>mm/dd/yyyy</strong>";
                  break
              }
            }
              
            // change button
            e.target.setAttribute("class", "glyphicon glyphicon-ok btn-sm btn-success");
            // change cancel button too
            e.target.parentElement.lastChild.setAttribute("class", "glyphicon glyphicon-remove btn-sm btn-danger");
            e.target.parentElement.lastChild.setAttribute("onclick", "driver.unselectEntry(event)");


            // change style
            e.target.parentElement.parentElement.style.backgroundColor = "#D5F5E3";

            break;
          case "glyphicon glyphicon-ok btn-sm btn-success":
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
            e.target.parentElement.lastChild.setAttribute("onclick", "driver.deleteEntry(event)");

            // send to firebase 
            entry_key = e.target.parentNode.parentNode.lastChild.innerText;
            entry_rowIndex = e.target.parentNode.parentNode.rowIndex - 1;  // Index starts 0

            // get all data with false contenteditable
            dataToSend = {};
            // row data is an object
            $("#myTable-body").find('tr:eq(' + entry_rowIndex +')').each(function() {
              $(this).find('td').each(function() {
                if (this.hasAttribute("cellType")) {
                  headerText = this.getAttribute("cellType");
                  data = this.innerText;
                  dataToSend[headerText] = data;
                }

                deadlineCol = $('#myTable').find('input').val();
                if (deadlineCol){
                  headerText = "deadline";
                  data = deadlineCol;
                  dataToSend[headerText] = data;
                }
              });// each td find contenteditable
            }); // find row of the event happens

            // replace entry with original data
            // if no modifications, then this will be what's seen because table refresh is not triggered
            // if modifications, this will be overwritten with proper data on table refresh callback
            domToReplace = e.target.parentElement.parentElement;
            domToReplace.parentElement.insertBefore(this.tempEntry, domToReplace);
            domToReplace.parentElement.removeChild(domToReplace);

            // send to database
            var ordersRef = new Firebase(addr(featureSource) + entry_key);
            ordersRef.update(dataToSend);

            // change style
            e.target.parentElement.parentElement.style.backgroundColor = "";
            tdArr = e.target.parentElement.parentElement.children;
            for (i in tdArr){
              if (tdArr[i].getAttribute){
                if (tdArr[i].getAttribute("celltype")=="deadline"){
                  tdArr[i].style.backgroundColor = "";
                }            
              }
            }
        }
        break;
      case "inventory":
        switch (e.target.getAttribute("class")){
          case "glyphicon glyphicon-edit btn-sm btn-info":
            // uneditable -> editable

            // make editable
            this.tempEntry = e.target.parentElement.parentElement.cloneNode(true);
            tdArr = e.target.parentElement.parentElement.children;
            for (var i=0; i<tdArr.length; i++){
              if (tdArr[i].getAttribute("contenteditable") != null){
                tdArr[i].setAttribute("contenteditable", true);
              }
              // TODO change a few types here
              switch (tdArr[i].getAttribute("cellType")){
                case "order_link":
                  tdArr[i].innerHTML = "";
                  break;
              }
            }
              
            // change button
            e.target.setAttribute("class", "glyphicon glyphicon-ok btn-sm btn-success");
            // change cancel button too
            e.target.parentElement.lastChild.setAttribute("class", "glyphicon glyphicon-remove btn-sm btn-danger");
            e.target.parentElement.lastChild.setAttribute("onclick", "driver.unselectEntry(event)");


            // change style
            e.target.parentElement.parentElement.style.backgroundColor = "#D5F5E3";

            break;
          case "glyphicon glyphicon-ok btn-sm btn-success":
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
            e.target.parentElement.lastChild.setAttribute("onclick", "driver.deleteEntry(event)");

            // send to firebase 
            entry_key = e.target.parentNode.parentNode.lastChild.innerText;
            entry_rowIndex = e.target.parentNode.parentNode.rowIndex - 1;  // Index starts 0

            // get all data with false contenteditable
            dataToSend = {};
            // row data is an object
            $("#myTable-body").find('tr:eq(' + entry_rowIndex +')').each(function() {
              $(this).find('td').each(function() {
                if (this.hasAttribute("cellType")) {
                  headerText = this.getAttribute("cellType");
                  data = this.innerText;
                  dataToSend[headerText] = data;
                }
              });// each td find contenteditable
            }); // find row of the event happens

            // replace entry with original data
            // if no modifications, then this will be what's seen because table refresh is not triggered
            // if modifications, this will be overwritten with proper data on table refresh callback
            domToReplace = e.target.parentElement.parentElement;
            domToReplace.parentElement.insertBefore(this.tempEntry, domToReplace);
            domToReplace.parentElement.removeChild(domToReplace);

            // send to database
            var ordersRef = new Firebase(addr(featureSource) + entry_key);
            ordersRef.update(dataToSend);

            // change style
            e.target.parentElement.parentElement.style.backgroundColor = "";
        }
        break;
    }
  },
  unselectEntry: function(e){
    // alert("unselecting entry");
    domToReplace = e.target.parentElement.parentElement;
    domToReplace.parentElement.insertBefore(this.tempEntry, domToReplace);
    domToReplace.parentElement.removeChild(domToReplace);
  },
  addEmptyItem: function(e){
    featureSource = document.getElementById("featureSrc").getAttribute("featureSrc");
    switch(featureSource){
      case "orders"://TODO use global props object instead of hardcode
        addEmptyItemRef = new Firebase(addr(featureSource));
        objToPush = {
          "order_num":  "",
          "name":       "",
          "address":    "",
          "items":      "",
          "deadline":   "",
          "weight":     "",
          "height":     "",
          "width":      "",
          "length":      "",          
        }
        break;
      case "shipping":
        // same as orders, uses same database //TODO dynamically get weight, height, width, length fields from inventory based on item
        addEmptyItemRef = new Firebase(addr(featureSource));
        objToPush = {
          "order_num":  "",
          "name":       "",
          "address":    "",
          "items":      "",
          "deadline":   "",
          "weight":     "",
          "height":     "",
          "width":      "",
          "length":      "",          
        }
        break;
      case "inventory":
        addEmptyItemRef = new Firebase(addr(featureSource));
        objToPush = {};
        for (i in props["inventory"]){
          objToPush[props.inventory[i]] = "";
        }
      case "schedule":
        addEmptyItemRef = new Firebase(addr(featureSource));
        objToPush = {};
        for (i in props["inventory"]){
          objToPush[props.inventory[i]] = "";
        }
    }
    addEmptyItemRef.push(objToPush);
  },
  reload: function(id){

    loadFirebase(id);
  },
  deleteEntry: function(e){
    featureSource = document.getElementById("featureSrc").getAttribute("featureSrc");
    entry_key = e.target.parentNode.parentNode.lastChild.innerText;
    switch(featureSource){
      case "orders":
        urlprefix = addr("orders");
        break;      
      case "inventory":
        urlprefix = addr("inventory");
        break; 
      case "shipping":
        urlprefix = addr("shipping");
        break; 
    }
    var remRef = new Firebase(urlprefix + entry_key);
    remRef.remove();
  },
  makeLabel: function(name_i, address_i, weight_i, length_i, height_i, width_i){
    var apiKey = '5NTaCzvLSV1MnYPbNpwxOg';
    var easypost = require('node-easypost')(apiKey);

    // set addresses
    var toAddress = {
      name: name_i,
      address: address_i
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
      weight: weight_i
    }, function(err, response) {
      console.log(err);
    });

    var parcel = {
      length: length_i,
      width: width_i,
      height: height_i,
      weight: weight_i
    };

    var postage_label;

    // create shipment
    easypost.Shipment.create({
      to_address: toAddress,
      from_address: fromAddress,
      parcel: parcel,
      customs_info: customsInfo
    }, function(err, shipment) {
      // buy postage label with one of the rate objects
      shipment.buy({rate: shipment.lowestRate(['USPS', 'ups']), insurance: 100.00}, function(err, shipment) {
        console.log(shipment.tracking_code);
        console.log(shipment.postage_label.label_url);
        postage_label = shipment.postage_label.label_url;
      });
    });
  return postage_label
  },
  logout: function(e){

    globalref.unauth();
  },
}