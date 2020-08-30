//get the feed items from the dom
//var doc = document.getElementsByClassName("cuf-feedElement cuf-feedItem")
//get the attribute Id for the first value in the list
//doc[0].getAttribute("data-id")
//need to loop through the doc var, storing all data-id's in a list for later
//create array
//var postIds=[]
//check array length
//postIds.length
//push values to array
//postIds.push(doc[0].getAttribute("data-Id"))

function jumpDownAndUp() {

    var scrollingElement = (document.scrollingElement || document.body);
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
    setTimeout(function(){ scrollingElement.scrollTop = 0; }, 10);
}

function returnFeedIds() {

    var i;
    //gather feedItems from DOM
    var doc = document.getElementsByClassName("cuf-feedElement cuf-feedItem");
    //create array
    var postIds=[];

    //for loop and based on the check array length
    for(i=0;i<doc.length;i++) {
        console.log(doc[i].getAttribute("data-id"));
        if (doc[i].getAttribute("data-id") != null) {
            //push values to array
            postIds.push(doc[i].getAttribute("data-Id"));
        }
    }

    return postIds;
}