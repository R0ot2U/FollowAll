///// Case Details /////

chrome.contextMenus.create({
	title: "Follow All",
	contexts: ["page"],
	onclick: followAll,
	id: "followAll"
});

chrome.contextMenus.create({
	title: "UnFollow All",
	contexts: ["page"],
	onclick: followAll,
	id: "unfollowAll"
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

function followAll(info, tab) {

	chrome.tabs.sendMessage(tab.id, { msg: "getFeedIds" },
		(sendResponse) => {
			if (sendResponse) {
				var type = "followAll";
				var postIds = sendResponse;

				if (info !== null && (info.menuItemId === "followAll" || info.menuItemId === "unfollowAll")) {

					//need a for loop for the bookmarks depending on returned postIds
					for(var i=0;i<postIds.length; i++){
						var postId = postIds[i];
						chatterapi(info, tab, type, postId);
					}
				} else {
					alert("ERROR check the console log")
				}

			}
		});
}

// Run all soql queries through this function
// Not usef at the moment
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
					//console.log(result.records[0]);
				} else {
					alert("You are not on a work item or case");
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
	console.log('Chatter API called');
	
	// variables for later
	var patchData
	var bookmarkJson = {"isBookmarkedByCurrentUser" : true};
	var url = "https://developmentsp-dev-ed.my.salesforce.com/services/data/v49.0/chatter/";
	
	//formatting the url for bookmarks and appending postId
	//doesn't look like we can bulk request this
	//adding more chatter functions here will need to look at other check
	if (type == 'followAll') {
		url+="feed-elements/"+postId+"/capabilities/bookmarks";
		if (info.menuItemId === "followAll") {
			bookmarkJson.isBookmarkedByCurrentUser = true;
		}
			else if(info.menuItemId === "unfollowAll") {
				bookmarkJson.isBookmarkedByCurrentUser = false;
			}
			else {
				alert('Error check console log');
			}
		patchData = bookmarkJson;
		console.log('Chatter URL: '+url);
	}

	$.ajax({
		url: url,
		method: 'PATCH',
		data: JSON.stringify(patchData),
		contentType: 'application/json;charset=UTF-8',
		dataType: 'json',
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Bearer " + sid);
		},
		success: function (result) {
			if (type == 'followAll' && info.menuItemId === "unfollowAll") {
				if (result) {
					console.log('Unfollowing All Posts');
				} else {
					console.log('Error please check console log');
				}
			} else if (type == 'followAll' && info.menuItemId === "unfollowAll") {
				if (result) {
					console.log('Following All Posts');
				} else {
					alert("Error please check console log");
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