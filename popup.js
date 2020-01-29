document.addEventListener('DOMContentLoaded', function() {
    var checkPageButton = document.getElementById('checkPage');
    checkPageButton.addEventListener('click', function() {
  
    // Displays in popup    
    console.log("Hello World");

    //displays in background page
    var bkg = chrome.extension.getBackgroundPage();
    bkg.console.log('foo');

    }, false);
  }, false);

