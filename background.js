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

// Follow All 
//var basequery = 'SELECT Id FROM agf__ADM_Work__c WHERE ';

function followAll(info, tab) {

	chrome.tabs.sendMessage(tab.id, { msg: "getFeedIds" },
		(sendResponse) => {
			if (sendResponse) {
				var type = "followAll";
				var postIds = sendResponse;
				console.log('inside function: '+postIds);

				if (info !== null && info.menuItemId === "workDetailsPage") {

					//need a for loop for the bookmarks depending on returned postIds
					for(var i=0;i<postIds.length; i++){
						console.log(postIds[i]);
						var postId = postIds[i];
						chatterapi(info, tab, type, postId);
					}
				} else {
					alert("No case details found")
				}

			}
		});
}

// Run all soql queries through this function
function soqlapi(info, tab, query, type) {
	console.log("query is: " + query)
	console.log("encoded query is: "+encodeURIComponent(query));

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

// Run all soql queries through this function
function chatterapi(info, tab, type, postId) {
	//console.log("query is: " + query)
	console.log('in chatter: '+postId);

	var url = "https://developmentsp-dev-ed.my.salesforce.com/services/data/v49.0/chatter/";

	if (type == 'followAll') {
		url+="feed-elements/"+postId+"/capabilities/bookmarks";
	}

	console.log('modified url is: '+url);

	var patchExample = {
		"isBookmarkedByCurrentUser" : true
	  };

	$.ajax({
		url: url,
		method: 'PATCH',
		data: JSON.stringify(patchExample),
		contentType: 'application/json;charset=UTF-8',
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Bearer " + sid);
		},
		success: function (result) {
			if (type == 'followAll') {
				if (result) {
					console.log(result);
				} else {
					alert("You are not on a work item or case")
					console.log('You are not on a work item or case');
				}
			} else if (type == 'unfollowAll') {
				if (result) {
					console.log('unfollowing posts');
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


function chatterrestResultHandler(response) {

	console.log("Got chatter response: " + response);


}

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