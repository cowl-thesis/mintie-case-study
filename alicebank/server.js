var express = require('express');
var app = express();

// can require json files
var transactions = require('./transactions.json');

// allow CORS
app.use(function(req, res, next) {
  // TODO more specific...
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

  next();
});

app.get('/data', function (req, res) {
  // read json
  res.set('Content-Type', 'application/labeled-json');

  var labeledObj = {
    confidentiality: "'self'",
    integrity: "'self'",
    object: {
      transactions: transactions
    }
  };

  res.send(JSON.stringify(labeledObj));
});

app.listen(4000, function () {
  console.log('Alicebank app listening on port 4000!');
});
