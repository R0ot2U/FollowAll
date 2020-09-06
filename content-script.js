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
});