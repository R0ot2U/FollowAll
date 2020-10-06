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

let sid = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	// Don't confuse this with the context dodge listener
	if (typeof request.msg !== 'undefined') {
		console.log('request msg: '+request.msg);
      if (request.msg === "context_dodge") {
			console.log("Context Menu Dodge Received!");
			//need to make this work for ANY salesforce org
			chrome.cookies.get({ "url": "https://gus.my.salesforce.com", "name": "sid" }, function (f) {
				sid = f.value;
	  		});
		}
		else {
			console.log('We\'ve got an error over here');
		}
  }
});

function followAll(info, tab, postId) {
	if (info !== null && (info.menuItemId === "followAll" || info.menuItemId === "unfollowAll")) {
		let type = 'follow';
		chatterapi(info, tab, type, null);
	}
}

// Run all soql queries through this function
function chatterapi(info, tab, type, postId) {
	//console.log('Chatter API called');
	
	// variables for later
	let patchData;
	let method;
	let recordUrl = tab.url;
	let recordIdentifier = null;
	let bookmarkJson = {"isBookmarkedByCurrentUser" : null};
	let url = "https://gus.my.salesforce.com/services/data/v49.0/chatter/";
	
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
			} else {
				console.log('nope');
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