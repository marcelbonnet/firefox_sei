
// ===========================================
// BANCO DE DADOS
// ===========================================

const DB_NAME = 'pgd';
const DB_VERSION = 1; // Use a long long for this value (don't use a float)
const DB_TIPOS_TAREFAS = 'tipos_tarefas';
const DB_TAREFAS = 'tarefas';

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
      DB_TIPOS_TAREFAS, { keyPath: 'id', autoIncrement: true });
    store.createIndex('codigo', 'codigo', { unique: false });
    store.createIndex('atividade', 'atividade', { unique: true });
    store.createIndex('descricao', 'descricao', { unique: false });
    store.createIndex('minutos', 'minutos', { unique: false });

    var store = evt.currentTarget.result.createObjectStore(
      DB_TAREFAS, { keyPath: 'id', autoIncrement: true });
    store.createIndex('data', 'data', { unique: false });
    store.createIndex('atividade', 'atividade', { unique: false });
    store.createIndex('minutos', 'minutos', { unique: false });
    store.createIndex('descricao', 'descricao', { unique: false });
    store.createIndex('numerosei', 'numerosei', { unique: false });
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

function addTipoTarefa(atividade, descricao, minutos) {
  var obj = { atividade: atividade, descricao: descricao, minutos: minutos };

  var store = getObjectStore(DB_TIPOS_TAREFAS, 'readwrite');
  var req;
  try {
    req = store.add(obj);
  } catch (e) {
    throw e;
  }
  req.onsuccess = function (evt) {
    console.log("addTipoTarefa OK");
  };
  req.onerror = function() {
    console.error("ERRO addTipoTarefa", this.error);
  };
}

function listarTiposTarefas() {
  store = getObjectStore(DB_TIPOS_TAREFAS, 'readonly');

  var req;
  req = store.count();
  req.onsuccess = function(evt) {
    console.log('Tipos de Tarefas: ' + evt.target.result);
  };
  req.onerror = function(evt) {
    console.error("Error ao listar tipos de tarefas", this.error);
  };

  var i = 0;
  req = store.openCursor();
  req.onsuccess = function(evt) {
    var cursor = evt.target.result;

    // If the cursor is pointing at something, ask for the data
    if (cursor) {
      req = store.get(cursor.key);
      req.onsuccess = function (evt) {
        var value = evt.target.result;

        console.log("SELECT: " + cursor.key + " Cod: " + value.codigo + " Ativ: " + value.atividade + " Minutos: " + value.minutos )
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


// ===========================================
// BACKGROUND EM GERAL
// ===========================================


// CONTEXT MENU

//var dontInvertState = false;

function onCreated() {
  if (browser.runtime.lastError) {
    console.error(`Error: ${browser.runtime.lastError}`);
  }
}

/*
MENU ITENS
*/

browser.contextMenus.create({
  id: "pgd-import",
  title: "PGD - Importar",
  //type: "checkbox",
  contexts: ["all"],
  //checked : dontInvertState
}, onCreated);

browser.contextMenus.create({
  id: "pgd-export",
  title: "PGD - Exportar",
  contexts: ["all"],
}, onCreated);


/*
LISTENER
*/
browser.contextMenus.onClicked.addListener(function(data, tab) {
  switch (data.menuItemId) {
    case "pgd-import":
        addTipoTarefa("995_S_15_Muito Baixa", "Atividades Comuns - Participar de reuniões e similares (Muito Baixa)", "Reuniões bla bla bla", 15)
        addTipoTarefa("996_S_30_Baixa", "Atividades Comuns - Participar de reuniões e similares (Baixa)", "Reuniões bla bla bla", 30)
        break;
    case "pgd-export":
        listarTiposTarefas()
        break;
  }
});

function browserAction(){
    getConfig().then(function(o){
        o.config.estado = !o.config.estado;
        // updateIcon(o.config.estado);
        // browser.storage.local.set(o); inverterCores();
        console.log(o);
    });
}

function onUpdated(){
    browser.storage.local.get("start").then((o) => {
        if(o.state === undefined)
            o.state = false;
        // updateIcon(o.config.estado);
        console.log("onUpdate chamado. Estado é " + o.state);
        // inverterCores(o.state);
    });
}

//browser.tabs.onUpdated.addListener(inverterCores);

// Fired when a browser action icon is clicked. This event will not fire if the browser action has a popup.
// browser.browserAction.onClicked.addListener(function(){
//     console.log("clicou")
// });

console.log("INICIADO")
openDb();
console.log("PASSOU")

browser.runtime.onMessage.addListener((request, sender, sendResponse) => 
{
    if(request.cmd === "listarTiposTarefas"){
        console.log("Pediu para listar os tipos de tarefas no bg")
        listarTiposTarefas()
    }
});


browser.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  }
);


/*
addTipoTarefa("995_S_15_Muito Baixa", "Atividades Comuns - Participar de reuniões e similares (Muito Baixa)", "Reuniões bla bla bla", 15)
addTipoTarefa("996_S_30_Baixa", "Atividades Comuns - Participar de reuniões e similares (Baixa)", "Reuniões bla bla bla", 30)
*/