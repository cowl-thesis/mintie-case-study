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
      tmplClone.querySelector('.category-title').innerText = category.title;

      if (!category.transactions) {
        tmplClone.querySelector('.category-spending').innerText = "$0";
      } else {
        var transactions = category.transactions;
        // calculate sum etc
        var sum = 0;

        var transEl = tmplClone.querySelector('.category-transactions');

        transactions.forEach(function(trans) {
          sum += parseInt(trans.amount);

          var li = document.createElement('li');
          li.innerText = trans.date + ' - Account: ' + trans.account_id + ' - $' + trans.amount;
          transEl.appendChild(li);
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


document.getElementById("categories").addEventListener("click",function(e) {
  if (e.target && e.target.matches("li.category")) {
    var el = e.target;
    var transEl = el.querySelector('.category-transactions');
    if (transEl.style.display == 'block') {
      transEl.style.display = 'none';
    } else {
      transEl.style.display = 'block';
    }
    // toggle list...
  }
});

