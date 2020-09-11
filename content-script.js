//Context menu dodge function, after onload
chrome.runtime.sendMessage({ msg: "context_dodge" }, function () { });


//function for getting DOM details for button placement, have to wait for it to be available. 
function checkingForButtonNodeLocation() {
    var target = document.querySelectorAll('.slds-grid.forceActionsContainer')[0];
    if(!target) {
        //The node we need does not exist yet.
        //Wait 500ms and try again
        window.setTimeout(checkingForButtonNodeLocation,500);
        return;
	}
	console.log('target: '+target);
	
	//initial button create
	var button = document.createElement("button");

	var port = chrome.runtime.connect({name: "followAll"});
	var info = {"menuItemId":"getFeeds"};
	port.postMessage({request: "getFeeds", info: info});
	port.onMessage.addListener(function(msg) {
		console.log('msg response: '+msg.response);
		if(msg.response == 'false'){
			button.innerHTML = "UnFollow All";
		} else {
			button.innerHTML = "Follow All";
		}
	});
	button.setAttribute("id","followAllButton");
	button.setAttribute("class","slds-button slds-button--neutral not-selected slds-not-selected uiButton");
	button.addEventListener('click', followAll);

	target.appendChild(button); 
}

//firing the button creation function
checkingForButtonNodeLocation();

//follow all method for communicating with background script
function followAll() {
	console.log('followAll in content script');
	var button = document.getElementById('followAllButton');
	if (button.innerHTML == "Follow All") {
	var info = {"menuItemId":"followAll"};
	} else {
		var info = {"menuItemId":"unfollowAll"};
	}
	var port = chrome.runtime.connect({name: "followAll"});
	port.postMessage({request: "followAll", info: info});
	//updating button
	
	if (button.classList.contains("not-selected")) {
		button.classList.replace("not-selected","is-selected");
		button.classList.replace("slds-not-selected","slds-is-selected");
		button.innerHTML = "UnFollow All";
	} else {
		button.classList.replace("is-selected","not-selected");
		button.classList.replace("slds-is-selected","slds-not-selected");
		button.innerHTML = "Follow All";
	}
}

// receive message about context menu action
// not doing anything with this right now
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log("Message recieved in content script")
});