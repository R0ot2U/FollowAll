//Context menu dodge function, after onload
chrome.runtime.sendMessage({ msg: "context_dodge" }, function () { });

function checkingForButtonNodeLocation() {
    var target = document.querySelectorAll('.slds-grid.forceActionsContainer')[0];
    if(!target) {
        //The node we need does not exist yet.
        //Wait 500ms and try again
        window.setTimeout(checkingForButtonNodeLocation,500);
        return;
	}
	console.log('target: '+target);
	
	var button = document.createElement("button");
	button.innerHTML = "Follow All";
	button.setAttribute("id","followAllButton");
	button.setAttribute("class","slds-button slds-button--neutral not-selected slds-not-selected uiButton");
	button.addEventListener('click', followAll);

	target.appendChild(button); 
}

checkingForButtonNodeLocation();



function followAll() {
	console.log('followAll in content script');
	var info = {"menuItemId":"followAll"};
	var port = chrome.runtime.connect({name: "followAll"});
	port.postMessage({request: "followAll", info: info});
}

// Right click functionality
document.body.addEventListener('mousedown', function (e) {
	console.log('Right click function')
});

// receive message about context menu action
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log("Message recieved in content script")
});