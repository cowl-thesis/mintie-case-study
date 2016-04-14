var express = require('express');
var app = express();

// can require json files
var accounts = require('./accounts.json');
var categories = require('./categories.json');

// allow CORS
app.use(function(req, res, next) {
  next();
});

app.get('/', function (req, res) {
  res.sendfile('index.html');
});

app.get('/overview', function (req, res) {
  res.sendfile('overview.html');
});

app.get('/data', function (req, res) {
  // read json
  res.set('Content-Type', 'application/labeled-json');

  var labeledObj = {
    confidentiality: "'self'",
    integrity: "'self'",
    object: {
      categories: categories,
      accounts: accounts
    }
  };

  res.send(JSON.stringify(labeledObj));
});

app.use(express.static('public'));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
