let commentURL = null;
let clickedEl = null;

//Context menu dodge function, after onload
chrome.runtime.sendMessage({ msg: "context_dodge" }, function () { });

// Right click functionality
document.body.addEventListener('mousedown', function (e) {

	var targetID = e.target.getAttribute("data-id")

	// right click to an element and element contains data id for comment
	if (e.button === 2 && targetID !== null) {
		commentURL = "https://org62.lightning.force.com/one/one.app#/sObject/" + targetID + "/view";
		console.log("Comment URL found: " + commentURL);
	}

	var editableTarget = e.target.getAttribute("contenteditable")
	if (e.button === 2 && editableTarget) {
		clickedEl = e.target;
	}

});

// receive message about context menu action
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log("Message recieved in content script")

	if (request.msg === 'getFeedIds') {

		//getting feed item ids
		console.log('returning feeds');

		var i;
		//gather feedItems from DOM
		var doc = document.getElementsByClassName("cuf-feedElement cuf-feedItem");
		//create array
		var postIds=[];

		//for loop and based on the check array length
		for(i=0;i<doc.length;i++) {
			console.log(doc[i].getAttribute("data-id"));
			if (doc[i].getAttribute("data-id") != null) {
				//push values to array
				postIds.push(doc[i].getAttribute("data-Id"));
			}
		}
		console.log('postIds: '+postIds);
		//return postIds;
	}

	if (request.msg === 'generate_login') {

		console.log("Generating login")

		var buttons = document.querySelectorAll('button');
		for (var i = 0, l = buttons.length; i < l; i++) {
			//console.log("Button last child value: "+buttons[i].innerHTML)
			if (buttons[i].innerHTML.includes("Generate Login Access URL")) {
				console.log("Found button")
				buttons[i].click();
			}
		}

	}

	if (request.msg.includes('get_comment_link')) {

		console.log("Received comment link request");

		// Lightning console
		if (commentURL !== null) {

			var oArg = new Object();
			oArg.Document = commentURL;
			prompt("Copy to clipboard: Ctrl/Cmd + c, Enter", oArg.Document);

			commentURL = null;
			oArg.Document = null;
		}
		// New UAC (Possibly needs improvement) 
		else if (request.msg.includes('0D5')) {

			var res = request.msg.match(/0D5.{12}/g);
			commentURL = "https://org62.lightning.force.com/one/one.app#/sObject/" + res + "/view";

			var oArg = new Object();
			oArg.Document = commentURL;
			prompt("Copy to clipboard: Ctrl/Cmd + c, Enter", commentURL);

			commentURL = null;
			oArg.Document = null;


		} else {
			alert("No comment link found here")
		}
	}

	if (request.msg === 'get_case_details') {

		clickedEl.value = request.text;

	}

});