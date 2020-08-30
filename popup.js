// Set focus on the input text box to allow for quick actions
window.onload = function () {
  console.log("Attempting to set focus");
  document.getElementById("input_textbox").focus();
  console.log("Input textbox is: " + document.getElementById("input_textbox").id);
};

// Allow clicking of documentation link to open in new tab
document.addEventListener('DOMContentLoaded', function () {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
      (function () {
          var ln = links[i];
          var location = ln.href;
          ln.onclick = function () {
              chrome.tabs.create({ active: true, url: location });
          };
      })();
  }
});

// Input box actions
document.addEventListener('DOMContentLoaded', documentEvents, false);

function quickAction(input) {
  console.log("input value is : " + input.value);

  var str = input.value.toLowerCase();

  if (str === "h") {
      chrome.runtime.sendMessage({ msg: "open_case_history" })
  } else if (str === "r") {
      chrome.runtime.sendMessage({ msg: "open_related_cases" })
  } else if (str === "c") {
      chrome.runtime.sendMessage({ msg: "open_comments" })
  } else if (str === "a") {
      chrome.runtime.sendMessage({ msg: "open_activities" })
  } else if (str === "f") {
      chrome.runtime.sendMessage({ msg: "open_files" })
  } else if (str === "g") {
      chrome.runtime.sendMessage({ msg: "open_gus_inv" })
  } else {
      alert("Command not found")
  }

}

function search(input, option) {
  console.log("Search value is : " + input.value);
  console.log("Picklist value is : " + option.value);

  if (input.value !== '') {
      chrome.runtime.sendMessage({ msg: option.value + " " + input.value })
  }

}

function searchcasedetails(input) {
  console.log("Search case details for: " + input.value);

  if (input.value !== '') {
      chrome.runtime.sendMessage({ msg: "casedetails " + input.value })
  }

}


function opencasedetailsconfigpage() {

  chrome.tabs.create({ 'url': chrome.extension.getURL('casedetailsconfig.html') }, function (tab) {
      // Tab opened.
  });

}

function openinsertpage() {

  chrome.tabs.create({ 'url': chrome.extension.getURL('templates.html') }, function (tab) {
      // Tab opened.
  });

}


function documentEvents() {
  document.getElementById('ok_btn').addEventListener('click',
      function () {
          quickAction(document.getElementById('input_textbox'));
      });

  document.getElementById("input_textbox")
      .addEventListener("keyup", function (event) {
          event.preventDefault();
          if (event.keyCode === 13) {
              document.getElementById("ok_btn").click();
          }
      });

  document.getElementById('search_btn').addEventListener('click',
      function () {
          search(document.getElementById('search_textbox'), document.getElementById('search_options'));
      });

  document.getElementById('case_details_search_btn').addEventListener('click',
      function () {
          searchcasedetails(document.getElementById('case_details_search_textbox'));
      });

  document.getElementById('current_case_details_btn').addEventListener('click',
      function () {
          chrome.runtime.sendMessage({ msg: "current_case_details"})
      });


  document.getElementById('open_case_details_config_btn').addEventListener('click',
      function () {
          opencasedetailsconfigpage();
      });

  document.getElementById('open_insert_btn').addEventListener('click',
      function () {
          openinsertpage();
      });
}