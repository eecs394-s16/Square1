1
2szivnalioef2

https://square1.firebaseio.com
https://square1.firebaseio.com/orders
https://square1.firebaseio.com/inventory

https://square1.firebaseio.com/2szivnalioef2
https://square1.firebaseio.com/2szivnalioef2/orders
https://square1.firebaseio.com/2szivnalioef2/inventory

uid = 2szivnalioef2

"https://square1.firebaseio.com/" + String(uid) + "/orders"
"https://square1.firebaseio.com/" + String(uid) + "/inventory"

// create users
// log in users
// page load order
// 	if logged in, redirect splash -> index
// 	if not logged in, redirect index -> splash
// log out user
change refs in index.js
	move all refs to "addr" object
	find out how to get uid (make sure it's ALWAYS accessible. If im in index.html, i can see uid)
	format all urls in addr object to include uid
