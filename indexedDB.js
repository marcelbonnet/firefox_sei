//exemplo https://github.com/mdn/dom-examples/blob/master/indexeddb-api/main.js


const DB_NAME = 'pgd';
const DB_VERSION = 1; // Use a long long for this value (don't use a float)
const DB_STORE_NAME = 'tarefas';

var db;

function openDb() {
  console.log("openDb ...");
  var req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onsuccess = function (evt) {
    // Equal to: db = req.result;
    db = this.result;
    console.log("openDb DONE");
  };
  req.onerror = function (evt) {
    console.error("openDb:", evt.target.errorCode);
  };

  req.onupgradeneeded = function (evt) {
    console.log("openDb.onupgradeneeded");
    var store = evt.currentTarget.result.createObjectStore(
      DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });

    store.createIndex('biblioid', 'biblioid', { unique: true });
    store.createIndex('title', 'title', { unique: false });
    store.createIndex('year', 'year', { unique: false });
  };
}

/**
 * @param {string} store_name
 * @param {string} mode either "readonly" or "readwrite"
 */
function getObjectStore(store_name, mode) {
  var tx = db.transaction(store_name, mode);
  return tx.objectStore(store_name);
}

function clearObjectStore() {
  var store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var req = store.clear();
  req.onsuccess = function(evt) {
    displayActionSuccess("Store cleared");
    displayPubList(store);
  };
  req.onerror = function (evt) {
    console.error("clearObjectStore:", evt.target.errorCode);
    displayActionFailure(this.error);
  };
}

function displayActionSuccess(msg) {
  console.error("Erro " + msg)
}

function displayActionFailure(msg) {
  console.error("Erro " + msg)
}

/**
 * @param {IDBObjectStore=} store
 */
function displayPubList(store) {
  console.log("displayPubList");

  if (typeof store == 'undefined')
    store = getObjectStore(DB_STORE_NAME, 'readonly');

  var req;
  req = store.count();
  // Requests are executed in the order in which they were made against the
  // transaction, and their results are returned in the same order.
  // Thus the count text below will be displayed before the actual pub list
  // (not that it is algorithmically important in this case).
  req.onsuccess = function(evt) {
    console.log('Resultados ' + evt.target.result);
  };
  req.onerror = function(evt) {
    console.error("add error", this.error);
    displayActionFailure(this.error);
  };

  var i = 0;
  req = store.openCursor();
  req.onsuccess = function(evt) {
    var cursor = evt.target.result;

    // If the cursor is pointing at something, ask for the data
    if (cursor) {
      console.log("displayPubList cursor:", cursor);
      req = store.get(cursor.key);
      req.onsuccess = function (evt) {
        var value = evt.target.result;

        console.log("SELECT: " + cursor.key + " " + value.biblioid + " " + value.title )
        
      };

      // Move on to the next object in store
      cursor.continue();

      // This counter serves only to create distinct ids
      i++;
    } else {
      console.log("No more entries");
    }
  };
}

 /**
 * @param {string} biblioid
 * @param {string} title
 * @param {number} year
 * @param {Blob=} blob
 */
function addPublication(biblioid, title, year, blob) {
  console.log("addPublication arguments:", arguments);
  var obj = { biblioid: biblioid, title: title, year: year };
  if (typeof blob != 'undefined')
    obj.blob = blob;

  var store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var req;
  try {
    req = store.add(obj);
  } catch (e) {
    if (e.name == 'DataCloneError')
      displayActionFailure("This engine doesn't know how to clone a Blob, " +
                           "use Firefox");
    throw e;
  }
  req.onsuccess = function (evt) {
    console.log("Insertion in DB successful");
    displayActionSuccess();
    displayPubList(store);
  };
  req.onerror = function() {
    console.error("addPublication error", this.error);
    displayActionFailure(this.error);
  };
}

/**
 * @param {string} biblioid
 */
function deletePublicationFromBib(biblioid) {
  console.log("deletePublication:", arguments);
  var store = getObjectStore(DB_STORE_NAME, 'readwrite');
  var req = store.index('biblioid');
  req.get(biblioid).onsuccess = function(evt) {
    if (typeof evt.target.result == 'undefined') {
      displayActionFailure("No matching record found");
      return;
    }
    deletePublication(evt.target.result.id, store);
  };
  req.onerror = function (evt) {
    console.error("deletePublicationFromBib:", evt.target.errorCode);
  };
}


openDb();