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
	//console.log('OnLoad Fired');
}

let sid = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	// Don't confuse this with the context dodge listener
	if (typeof request.msg !== 'undefined') {
		console.log('request msg: '+request.msg);
      if (request.msg === "context_dodge") {
			console.log("Context Menu Dodge Received!");
			//need to make this work for ANY salesforce org
			chrome.cookies.get({ "url": "https://developmentsp-dev-ed.my.salesforce.com", "name": "sid" }, function (f) {
				sid = f.value;
	  		});
		}
		else {
			console.log('We\'ve got an error over here');
		}
  }
});

chrome.runtime.onConnect.addListener(function(port) {
	console.assert(port.name === "followAll");
	port.onMessage.addListener(function(msg,extra){
		if (msg.request === "followAll") {
			followAll(msg.info, extra.sender.tab,null);
		} else if (msg.request === "getFeeds") {
			// right now this is always returning undefined and then false so while we are checking everything fine
			// because the result is async we are just continuing without caring about it. Need to find a way
			// to wait or make it async wait - haven't done this yet so going to have to learn.
			/*var alreadyFollowed = getFeeds(msg.info, extra.sender.tab);
				if (alreadyFollowed === false) {
				port.postMessage({response: 'false'});
				} else {
					port.postMessage({response: 'true'});
				} */
		}
	});
});
function followAll(info, tab) {
	if (info !== null && (info.menuItemId === "followAll" || info.menuItemId === "unfollowAll")) {
		var type = 'follow';
		chatterapi(info, tab, type, null);
	}
}

function getFeeds(info, tab) {
	if (info !== null && info.menuItemId === "getFeeds") {
		var type = 'getFeeds';
		console.log('getFeeds function');
		var alreadyFollowed = chatterapi(info, tab, type, null);
		return alreadyFollowed;
	}
}

// Run all chatterAPI queries through this function
function chatterapi(info, tab, type, postId) {
	//console.log('Chatter API called');
	
	// variables for later
	var patchData;
	var method;
	var recordUrl = tab.url;
	var recordIdentifier = null;
	var bookmarkJson = {"isBookmarkedByCurrentUser" : null};
	var url = "https://developmentsp-dev-ed.my.salesforce.com/services/data/v49.0/chatter/";
	
	//formatting the url for bookmarks and appending postId
	//doesn't look like we can bulk request this
	//adding more chatter functions here will need to look at other checks
	if (type == 'followAll' && postId!=null) {
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
		method = 'PATCH'
		//console.log('Chatter URL: '+url);
	} else if ((type == 'follow' || type == 'getFeeds') && postId==null && recordUrl != null) {
		recordIdentifier = recordUrl.match(/\b[0-9a-zA-Z]{18}\b/g);
		//console.log("recordId: "+recordIdentifier);
		url+="feeds/record/"+recordIdentifier+"/feed-elements"; 
	}

	$.ajax({
		url: url,
		method: method,
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
			} else if (type == 'followAll' && info.menuItemId === "followAll") {
				if (result) {
					console.log('Following All Posts');
				} else {
					alert("Error please check console log");
				}
			} else if(type == 'follow' && result.elements[0]) {
				for(var i =0; i<Object.keys(result.elements).length;i++) {
					// if it's aleady bookmarked don't do anything
					// this point we should maybe check type on the element if bookmarks are supported
					if(info.menuItemId === "followAll" 
					&& result.elements[i].capabilities.bookmarks.isBookmarkedByCurrentUser == false) {
						postId = result.elements[i].id;
						type = 'followAll';
						chatterapi(info, tab, type, postId);
					} else if (info.menuItemId === "unfollowAll" 
					&& result.elements[i].capabilities.bookmarks.isBookmarkedByCurrentUser == true) {
						postId = result.elements[i].id;
						type = 'followAll';
						chatterapi(info, tab, type, postId);
					}
				}
			} else if(type == 'getFeeds' && result.elements[0]) {
				console.log('getting feeds');
				var allFollowed;
				for(var i=0; i<Object.keys(result.elements).length;i++) {
					if(result.elements[i].capabilities.bookmarks.isBookmarkedByCurrentUser == false) {
						console.log('outputing false');
						allFollowed = false;
					} else {
						allFollowed = true;
						console.log('outputing true');
					}
				}
				console.log('allFollowed1: '+allFollowed);
				return allFollowed;
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