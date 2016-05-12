var express = require('express');
var app = express();

// var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database('mintie.db', createTables);

// function createTables() {
//   db.run("CREATE TABLE IF NOT EXISTS categories (info TEXT)");

// }

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

app.get('/categorize', function(req, res) {
  res.sendfile('categorize.html');
});

app.get('/data', function (req, res) {
  // read json
  res.set('Content-Type', 'application/labeled-json');

  console.log('Accounts', accounts);

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

app.get('/move/:account/:list', function(req, res) {
  var account = req.params.account;
  var list = req.params.list;

  // change account
  accounts[account].category = list;

  console.log('Accounts', accounts);

  console.log('Account', account);
  console.log('List', list);

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
