///// Case Details /////

chrome.contextMenus.create({
	title: "Query Work",
	contexts: ["page"],
	onclick: followAll,
	id: "workDetailsPage"
});

////////////////////////////

// on load function
window.onload = function () {
	console.log('OnLoad Fired');
}


let sid = null;
let casedetails = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

  console.log("Open view: " + request.msg);
  console.log("request: " + request);

	// Don't confuse this with the context dodge listener
	if (typeof request.msg !== 'undefined') {

      if (request.msg.startsWith("caseDetails")) {

		} else if (request.msg === "current_case_details") {

		} else if (request.msg === "context_dodge") {

			console.log("Context Menu Dodge Received!");

			chrome.cookies.get({ "url": "https://developmentsp-dev-ed.my.salesforce.com", "name": "sid" }, function (f) {
				sid = f.value;
      });
      
      

		}
		else {

		}
  }
});

// Case Details popup
function opencasedetails(info, tab) {

	var w = 400;
	var h = 400;
	var left = (screen.width / 2) - (w / 2);
	var top = (screen.height / 2) - (h / 2);

	chrome.tabs.create({
		url: chrome.extension.getURL('casedetails.html'),
		active: false
	}, function (tab) {
		// After the tab has been created, open a window to inject the tab
		chrome.windows.create({
			tabId: tab.id,
			type: 'popup',
			focused: true,
			height: h,
			width: w,
			'left': left,
			'top': top

		});
	});
}

//loading all feed posts
function jumpDownAndUp() {
	console.log('Jumping');

	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	chrome.tabs.executeScript(tabs[0].id, {code:
			"var scrollingElement = (document.scrollingElement || document.body);" +
			"scrollingElement.scrollTop = scrollingElement.scrollHeight;" +
			"setTimeout(function(){ scrollingElement.scrollTop = 0; }, 100);" 
		})
	})

}


// Case details query
var basequery = 'SELECT Id FROM agf__ADM_Work__c WHERE ';

function followAll(info, tab) {

	jumpDownAndUp();

	chrome.tabs.sendMessage(tab.id, { msg: "getFeedIds" });


	var type = "followAll";
	var workidentifier = null;
	var query = basequery;

	if (info !== null && info.menuItemId === "workDetailsPage") {

		console.log("Getting work details from current page");
		var taburl = "" + tab.url;
		workidentifier = ' id =   \'' + taburl.match(/a1D.{15}/g) + '\'';
		query +=workidentifier;
		soqlapi(info, tab, query, type);

	} else if (info !== null && info.linkUrl !== null && info.menuItemId === "caseDetailsLink") {

	} else if (info !== null && info.selectionText !== null && info.menuItemId === "caseDetailsSelection") {

	} else if (info !== null && info.menuItemId === "caseDetailsSearch") {

	} else {
		alert("No case details found")
	}

}

// Run all soql queries through this function
function soqlapi(info, tab, query, type) {
	console.log("query is: " + query)

	var url = "https://developmentsp-dev-ed.my.salesforce.com/services/data/v49.0/query/?q=" + encodeURIComponent(query);

	$.ajax({
		url: url,
		method: 'GET',
		contentType: 'application/json;charset=UTF-8',
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Bearer " + sid);
		},
		success: function (result) {
			if (type == 'followAll') {
				if (result && result.records[0]) {
					console.log(result.records[0]);
				} else {
					alert("You are not on a work item or case")
					console.log('You are not on a work item or case');
				}
			} else if (type == 'gus_links') {
				if (result && result.records[0]) {

				} else {
					alert("Something went wrong, possibly not on case page");
				}
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert("Error: " + errorThrown)
			console.log(jqXHR.status + ' : ' + errorThrown);
		}
	});
}


function soqlResultHandler(response) {

	console.log("Got soql response: " + response);


}