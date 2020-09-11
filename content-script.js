//Context menu dodge function, after onload
chrome.runtime.sendMessage({ msg: "context_dodge" }, function () { });

// receive message about context menu action
// not doing anything with this right now
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log("Message recieved in content script")
});