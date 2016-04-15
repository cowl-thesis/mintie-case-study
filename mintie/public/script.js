var overviewWin = document.getElementById('overview').contentWindow;

// Should use fetch when patched
// http://www.html5rocks.com/en/tutorials/es6/promises/
function get(url) {
  return new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest()
    req.open("GET", url);
    req.responseType = "labeled-json";
    req.onload = function (e) {
      var labeledObject = req.response;
      resolve(labeledObject);
    };

    req.onerror = function() {
      reject(Error("An error"));
    };

    req.send();
  });
}

function getMintieData() {
}

// getMintieData();
// COWL.enable();

window.addEventListener('message', overviewReady, false);
function overviewReady() {
  console.log('Overview should be ready');
  // fetch and pass data...
 get("http://mintie.com:3000/data").then(function(labeledObj) {
   console.log('Mintie response');
   // send to iframe...
   overviewWin.postMessage(labeledObj, '*'); // TODO be specific.
  get("http://alicebank.com:4000/data").then(function(labeledObj) {
    // send to iframe...
    console.log('Maybe response?');
    overviewWin.postMessage(labeledObj, '*'); // TODO be specific.
  });
 });


}

function getAliceBankData() {

}

function getBobBankData() {

}
