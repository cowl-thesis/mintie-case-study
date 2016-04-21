  var categories = {};
  var accounts = {};

  function constructCategories(categoriesArray) {

    categoriesArray.forEach(function(data) {
      categories[data.id] = {};
      categories[data.id]['title'] = data.title;
      categories[data.id]['budget'] = data.budget;
      categories[data.id]['transactions'] = [];
    });

    // add category for unknown bank accounts
    categories['unknown'] = {
      title: 'Uncategorized',
      transactions: []
    };

    console.log('Categories', categories);
  }

  function constructAccounts(accountsArray) {
    accountsArray.forEach(function(data) {
      accounts[data.account_id] = data.category;
    });
  }

  function addTransactions(transactions) {
    // go through each transaction, see which categorty it belongs to then add to category
    transactions.forEach(function(data) {
      var cID = accounts[data.account_id];
      if (!cID) {
        cID = 'unknown';
      }

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
    }

    if (protectedObj['transactions']) {
      addTransactions(protectedObj['transactions']);
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
    var tmpl = document.getElementById('category-template');

    // show category
    Object.keys(categories).forEach(function(key) {
      var category = categories[key];
      var tmplClone = tmpl.content.cloneNode(true);
      tmplClone.querySelector('.category').setAttribute('data-category', key);
      tmplClone.querySelector('.category-title').innerText = category.title;

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

