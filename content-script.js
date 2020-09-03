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

//loading all feed posts
function jumpDown() {
	console.log('Jumping down');

	var scrollingElement = (document.scrollingElement || document.body);
	scrollingElement.scrollTop = scrollingElement.scrollHeight;

	console.log('finished jumping down');
}

function jumpUp() {
	console.log('Jumping up');

	var scrollingElement = (document.scrollingElement || document.body);
	setTimeout(function(){ 
		scrollingElement.scrollTop = 0; 
		console.log('in function');
	}, 50);

	console.log('finished jumping up');

}

// receive message about context menu action
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log("Message recieved in content script")

	jumpDown();
	jumpUp();

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
			if (doc[i].getAttribute("data-id") != null && doc[i].getAttribute("data-type") == "TextPost" ) {
				//push values to array
				postIds.push(doc[i].getAttribute("data-Id"));
			}
		}
		console.log('postIds: '+postIds);
		//return postIds;
		sendResponse(postIds);
	}

	
});