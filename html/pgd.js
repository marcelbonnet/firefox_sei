/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {

    
    function testar(tabs) {
      browser.tabs.sendMessage(tabs[0].id, {
        command: "testar",
        valor: "Foo Bar"
      });
    }

    function incluirEvento(tabs){
      document.querySelector("#recorrente").value=4
      document.querySelector("#flash").textContent = "OK pgd.js"

      browser.tabs.sendMessage(tabs[0].id, {
        command: "incluir_evento",
        valor: "incluir"
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Deu ruim: ${error}`);
    }

    if (e.target.classList.contains("teste")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(testar)
        .catch(reportError);
    }
    else if (e.target.classList.contains("incluir_evento")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(incluirEvento)
        .catch(reportError);
    }
  });
}


function backgroundListener() {
  document.addEventListener("click", (e) => {

    function listarTiposTarefas(tabs) {
      // tem que fazer isso no Inspector do about:debugging
      // debugger
      browser.runtime.sendMessage({
        cmd: "listarTiposTarefas"
      });
    }

    function reportError(error) {
      console.error(`Deu ruim: ${error}`);
    }

    if (e.target.classList.contains("listar")) {
      browser.tabs.query({active: true, currentWindow: true})
        .then(listarTiposTarefas)
        .catch(reportError);
    }

  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  // document.querySelector("#popup-content").classList.add("hidden");
  // document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Falhou: ${error.message}`);
}


// Listen to the runtime.onInstalled event to initialize an extension on installation. Use this event to set a state or for one-time initialization, such as a context menu.
// browser.runtime.onInstalled.addListener(function() {
//   chrome.contextMenus.create({
//     "id": "sampleContextMenu",
//     "title": "Sample Context Menu",
//     "contexts": ["selection"]
//   });
// });



/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({file: "/js/main.js"})
.then(function(){
  listenForClicks();
})
.catch(reportExecuteScriptError);

backgroundListener() // Funciona mas lança esse erro no console: Uncaught TypeError: backgroundListener() is not a function

// browser.runtime.getBackgroundPage().then(function(bg){
//   // backgroundListener(bg)
//   bg.listarTiposTarefas()
// })


function removeOptions(selectElement) {
   var i, L = selectElement.options.length - 1;
   for(i = L; i >= 0; i--) {
      selectElement.remove(i);
   }
}

function createOptionSelecione(){
  opt = document.createElement("option")
  opt.value = ""
  opt.text = "Selecione"
  return opt
}


document.addEventListener("DOMContentLoaded", function(event) { 
  var sel_atividade = document.getElementById('atividade')
  var sel_subAtividade = document.getElementById('subAtividade')
  var sel_duracao = document.getElementById('duracao')
  
  sel_atividade.add(createOptionSelecione())
  sel_subAtividade.add(createOptionSelecione())
  sel_duracao.add(createOptionSelecione())


  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("pgd_atividades", 'readonly');
    const store = tx.objectStore("pgd_atividades");
    let req = store.openCursor();
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      var res = []

      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (evt) {
          value = evt.target.result;
          opt = document.createElement("option")
          opt.value = value.id
          opt.text = value.atividade
          sel_atividade.add(opt)
        };
        cursor.continue();
      }
    };
  };

  sel_atividade.addEventListener('change', function(sel_event){
    removeOptions(sel_subAtividade)
    removeOptions(sel_duracao)
    sel_subAtividade.add(createOptionSelecione())
    sel_duracao.add(createOptionSelecione())

    indexedDB.open("pgd",1).onsuccess = function (evt) {
      const idb = this.result;
      const tx = idb.transaction("pgd_sub_atividades", 'readonly');
      const store = tx.objectStore("pgd_sub_atividades");
      let req = store.openCursor();
      req.onsuccess = function(evt) {
        var cursor = evt.target.result;
        var res = []

        if (cursor) {
          req = store.get(cursor.key);
          req.onsuccess = function (evt) {
            let value = evt.target.result;
            if(value.atividade_id == sel_atividade.options[sel_atividade.selectedIndex].value ){
              opt = document.createElement("option")
              opt.value = value.sub_atividade
              opt.text = value.sub_atividade
              sel_subAtividade.add(opt)
            }
          };
          cursor.continue();
        }
      };
    };//indexedDB

    indexedDB.open("pgd",1).onsuccess = function (evt) {
      const idb = this.result;
      const tx = idb.transaction("pgd_duracao", 'readonly');
      const store = tx.objectStore("pgd_duracao");
      let req = store.openCursor();
      req.onsuccess = function(evt) {
        var cursor = evt.target.result;
        var res = []

        if (cursor) {
          req = store.get(cursor.key);
          req.onsuccess = function (evt) {
            let value = evt.target.result;
            if(value.atividade_id == sel_atividade.options[sel_atividade.selectedIndex].value ){
              opt = document.createElement("option")
              opt.value = value.codigo
              opt.text = (value.duracao < 60)? value.duracao+" min" : value.duracao/60.0 + " h"
              sel_duracao.add(opt)
            }
          };
          cursor.continue();
        }
      };
    };//indexedDB
  });






  // let sending = browser.runtime.sendMessage({ cmd: "db_select", table:"pgd_atividades" });
  // sending.then((res) => {
  //   console.debug("RES " + res)
  // });

  // var opt = document.createElement("option")
  // opt.value = ""
  // opt.text = "Selecione"
  // sel_atividade.add(opt)

  // //unique por atividade
  // var lista = [];
  // for(i=0; i<matriz.length; i++){
  //   var b = false;
  //   if(lista[0] === undefined)
  //       lista.push(matriz[i].atividade)

  //   for(k=0; k<lista.length; k++){
  //     if(lista[k] == matriz[i].atividade){
  //       b = true
  //       break
  //     }
  //   }

  //   if(!b)
  //     lista.push(matriz[i].atividade)
  // }  

  // // popula com atividades únicas
  // for(i=0; i<lista.length; i++){
  //   var opt = document.createElement("option")
  //   opt.value = lista[i] //igual ao texto
  //   opt.text = lista[i]
  //   sel_atividade.add(opt)
  // }

  // sel_atividade.addEventListener('change', function(event){
  //   // pesquisar as durações existentes
  //   // depois de selecionada a duração é que saberei pesquisar qual código 
  //   // será usado para a atividade + duração
  //   var sel_duracao = document.getElementById('duracao')
  //   var item_selecionado = event.target.value
  //   var lista = []
  //   for(i=0; i<matriz.length; i++){
  //     if(atividade === item_selecionado){
  //       var opt = document.createElement("option")
  //       for(k=1; k<=6; k++){
  //         // opt.value = matriz[i]['duracao0'+k].codigo
  //         // opt.text = matriz[i]['duracao0'+k].
  //         // sel_duracao.add(opt)
  //       }
  //     }
  //   }

  // });//listener de atividade para popular duração

});

// debugger
  // var div = document.querySelector("#divInfraBarraLocalizacao")
  //   var btn = document.createElement("button")
  //   btn.setAttribute("type", "button")
  //   btn.setAttribute("click", "importarAtividades()")
  //   btn.appendChild(document.createTextNode("Importar Atividades"))
  //   // btn.addEventListener("click", importarAtividades, false)
  //   div.appendChild(btn)
