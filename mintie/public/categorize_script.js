function getCategories() {
  var req = new XMLHttpRequest()
    req.open("GET", "http://mintie.com:3000/data");
  req.responseType = "labeled-json";
  req.onload = function (e) {
    var labeledObject = req.response;
    displayCategories(labeledObject.protectedObject);
  };

  req.send();
}

function displayCategories(data) {
  var categories = data.categories;
  var accounts = data.accounts;

  var categoriesEl = document.getElementById('categories');
  var tmpl = document.getElementById('category-template');
  console.log('Display Categories', categories);
  console.log('Display Acco', accounts);

  var categoriesObj = {};

  categories.forEach(function(data) {
    categoriesObj[data.id] = {};
    categoriesObj[data.id]['title'] = data.title;
    categoriesObj[data.id]['budget'] = data.budget;
    categoriesObj[data.id]['accounts'] = [];
  });

  Object.keys(accounts).forEach(function(key) {
    var account = accounts[key];
    if (categoriesObj[account.category]) {
      var cat = categoriesObj[account.category];
      cat.accounts.push(account.account_id);
    }
  });

  Object.keys(categoriesObj).forEach(function(key) {
    var category = categoriesObj[key];
    var tmplClone = tmpl.content.cloneNode(true);
    tmplClone.querySelector('.category-title').innerText = category.title;

    var list = tmplClone.querySelector('.accounts');
    list.setAttribute('data-id', key);

    category.accounts.forEach(function(account) {
      var item = document.createElement('li');
      item.setAttribute('data-id', account);
      item.appendChild(document.createTextNode('Account: ' + account));
      list.appendChild(item);
    });

    categoriesEl.appendChild(tmplClone);
    var sortable = Sortable.create(list, {
      group: 'shared',
      onAdd: function(evt) {
        var draggedAccountEl = evt.item;
        var newList = evt.target;

        moveAccount(draggedAccountEl.dataset.id, newList.dataset.id);

        console.log('This', evt);
        console.log('Adding', evt.item);
      }
    });
  });

}

getCategories();

function moveAccount(accountId, listId) {
  // send data to server
  // get labeled response and send to server?
  var url = "http://mintie.com:3000/move/" + accountId + '/' + listId;
  var req = new XMLHttpRequest()
    req.open("GET", url);
  req.responseType = "labeled-json";
  req.onload = function (e) {
    console.log('Received data move account');
    var labeledObject = req.response;
    window.parent.postMessage(labeledObject, '*');
  };

  req.send();
}

