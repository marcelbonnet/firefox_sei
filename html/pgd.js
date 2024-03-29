
var SUCCESS = 0;
var WARN = 1;
var ERROR = 2;

const DB_VERSAO = 3


if( typeof Element.prototype.clearChildren === 'undefined' ) {
    Object.defineProperty(Element.prototype, 'clearChildren', {
      configurable: true,
      enumerable: false,
      value: function() {
        while(this.firstChild) this.removeChild(this.lastChild);
      }
    });
}

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
// browser.tabs.executeScript({file: "/js/main.js"})
// .then(function(){
//   listenForClicks();
// })
// .catch(reportExecuteScriptError);

backgroundListener() // Funciona mas lança esse erro no console: Uncaught TypeError: backgroundListener() is not a function

// browser.runtime.getBackgroundPage().then(function(bg){
//   // backgroundListener(bg)
//   bg.listarTiposTarefas()
// })

function flash(msg, level, htmlFormat=false){
  let classe = ''
  switch(level){
    case SUCCESS: 
      classe = 'flash-success'
      break;
    case WARN: 
      classe = 'flash-warn'
      break;
    case ERROR: 
      classe = 'flash-error'
      break;
    default:
      classe = 'flash-success'
  }
  console.debug(`class=${level}/${classe}`)
  document.getElementById("flash").setAttribute('class', classe)
  if(htmlFormat)
    document.getElementById("flash").innerHTML += msg
  else
    document.getElementById("flash").textContent += msg

  setTimeout(function(){
    document.getElementById("flash").setAttribute('class', 'flash-none')
    document.getElementById("flash").textContent = ''    
  }, 7000)
}


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

/* *****************************************************
* Converte a data/hora para formato de data/hora SQL
*******************************************************/
function date2sqldate(d){
  let dia = ( d.getDate() < 10 ) ? `0${d.getDate()}` : d.getDate()
  let mes = ( d.getMonth()+1 < 10 ) ? `0${d.getMonth()+1}` : d.getMonth()+1
  let ano = ( d.getFullYear() < 10 ) ? `0${d.getFullYear()}` : d.getFullYear()
  let hora= ( d.getHours() < 10 ) ? `0${d.getHours()}` : d.getHours()
  let min = ( d.getMinutes() < 10 ) ? `0${d.getMinutes()}` : d.getMinutes()
  let seg = ( d.getSeconds() < 10 ) ? `0${d.getSeconds()}` : d.getSeconds()
  
  return `${ano}-${mes}-${dia}T${hora}:${min}:${seg}Z`
}

/* *****************************************************
* Usar para imprimir a data/hora em português
@param {Date} d um Date()
*******************************************************/
function date2datahoraLocal(d){
  let dia = ( d.getDate() < 10 ) ? `0${d.getDate()}` : d.getDate()
  let mes = ( d.getMonth()+1 < 10 ) ? `0${d.getMonth()+1}` : d.getMonth()+1
  let ano = ( d.getFullYear() < 10 ) ? `0${d.getFullYear()}` : d.getFullYear()
  let hora= ( d.getHours() < 10 ) ? `0${d.getHours()}` : d.getHours()
  let min = ( d.getMinutes() < 10 ) ? `0${d.getMinutes()}` : d.getMinutes()
  let seg = ( d.getSeconds() < 10 ) ? `0${d.getSeconds()}` : d.getSeconds()
  return `${dia}/${mes}/${ano} ${hora}:${min}`
}

function datetime2date(data){
  let a = data
  if((data instanceof Date) == false)
    a = new Date(data)
  return date2sqldate(a).substring(0,date2sqldate(a).indexOf('T'))
}

// params: Date
function hojeMinMax(desde, ate){
  desde = desde instanceof Date ? desde : new Date(desde)
  ate =  ate instanceof Date ? ate : new Date(ate)

  // desde = new Date(`${datetime2date(desde)}T00:00:00`)
  // ate = new Date(`${datetime2date(ate)}T23:59:59`)

  // desde = datetime2date(desde)
  // ate = datetime2date(ate)
  // console.debug(`DATAS: ${desde}/${ate} `)
  // console.debug(desde.getTimezoneOffset())



  desde.setUTCHours(0)
  desde.setUTCMinutes(0)
  desde.setUTCSeconds(0)
  ate.setUTCHours(23)
  ate.setUTCMinutes(59)
  ate.setUTCSeconds(59)
  return {
    desde: date2sqldate(desde),
    ate: date2sqldate(ate)
    }
}

function formatarTempo(minutos, formato){
  if(formato === "hhmm"){
    horas = Math.trunc(minutos/(60))
    minutos = Math.trunc(((minutos/(60))-horas)*60)
    return `${horas<10? '0'+horas : horas}h${minutos<10? '0'+minutos : minutos}`
  } else if(formato == "h min"){
    //formato usado para a Análise encontrar a duração no texto da tabela do PGD para saber em qual linha da tabela fazer o preenchimento (vide main.js)
    horas = Math.trunc(minutos/(60))
    minutos = Math.trunc(((minutos/(60))-horas)*60)
    texto = ""
    if (horas > 0)
      texto = `${horas}h` //sem "0" na frente quando horas<10
    if (minutos > 0)
      texto += `${horas>0? " " : ""}${minutos<10? '0'+minutos : minutos}min`
    return texto
  } else
    return (minutos < 60)? minutos+" min" : minutos/60.0 + " h"
}


function exibirDuracao(){
  let data_ini = new Date(document.getElementById("inicio").value).getTime()
  let data_fim = new Date(document.getElementById("fim").value).getTime()
  let span = document.getElementById("spanDuracao")
  
  let horas = (data_fim - data_ini)/(1000*60*60)
  if(horas < 1)
    horas = horas*60 + " min"
  else
    horas += " h"

  span.textContent = horas
}


function carregarListaFavoritos(){
  let lista = document.getElementById('lista_favorito')

  removeOptions(lista)
  lista.add(createOptionSelecione())

  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readonly');
    const store = tx.objectStore("diario");
    // store = store.index('diario_favorito')
    // const keyRange = IDBKeyRange.lowerBound(1)
    let req = store.openCursor();
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (cur_event) {
          let value = cur_event.target.result;
          opt = document.createElement("option")
          opt.value = value.id
          opt.text = `#${value.id} ${value.data} ${value.descricao.substring(0,20)}`
          
          if(value.favorito == 1)
            lista.add(opt)
        };
        cursor.continue();
      }
    };
  };//indexedDB
}

// document.getElementById("inicio").addEventListener('change', function(btn_event){ exibirDuracao(); });
// document.getElementById("fim").addEventListener('change', function(btn_event){ exibirDuracao(); });

document.addEventListener("DOMContentLoaded", function(event) { 
  var sel_atividade = document.getElementById('atividade')
  var sel_subAtividade = document.getElementById('subAtividade')
  var sel_duracao = document.getElementById('duracao')
  
  sel_atividade.add(createOptionSelecione())
  sel_subAtividade.add(createOptionSelecione())
  sel_duracao.add(createOptionSelecione())

  carregarListaFavoritos();

  // Local Storage
  try{
    let storage = window.localStorage
    document.getElementById("configInfoComplementares").value = (storage.infoComplementares != undefined)? storage.infoComplementares : ""
    document.getElementById("configPrefixarTextoComData").value = (storage.prefixarTextoComData != undefined)? storage.prefixarTextoComData : "nao"

    document.getElementById("configAnaliseEncaminhamento").value = (storage.analiseEncaminhamento != undefined)? storage.analiseEncaminhamento : ""
    document.getElementById("configAnaliseFila").value = (storage.analiseFila != undefined)? storage.analiseFila : ""

  } catch(e){
    console.error(e)
  }

  //Carrega a Aba Diário com os dados de hoje
  inicializarAbaDiario(false);
  document.getElementById("tab_diario_ini").dispatchEvent(new Event('change'))


  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("pgd_atividades", 'readonly');
    const store = tx.objectStore("pgd_atividades");
    let req = store.openCursor();
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;

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

    indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
      const idb = this.result;
      const tx = idb.transaction("pgd_atividades", 'readonly');
      const store = tx.objectStore("pgd_atividades");
      let req = store.openCursor();
      req.onsuccess = function(evt) {
        var cursor = evt.target.result;

        if (cursor) {
          req = store.get(cursor.key);
          req.onsuccess = function (evt) {
            let value = evt.target.result;
            if(value.id == sel_atividade.options[sel_atividade.selectedIndex].value ){
              for(i=0; i<value.sub_atividades.length; i++){
                if(value.sub_atividades[i] == undefined || value.sub_atividades[i].length == 0)
                  continue;
                opt = document.createElement("option")
                opt.value = value.sub_atividades[i]
                opt.text = value.sub_atividades[i]
                sel_subAtividade.add(opt)
              }
            }
          };
          cursor.continue();
        }
      };
    };//indexedDB

    indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
      const idb = this.result;
      const tx = idb.transaction("pgd_atividades", 'readonly');
      const store = tx.objectStore("pgd_atividades");
      let req = store.openCursor();
      req.onsuccess = function(evt) {
        var cursor = evt.target.result;

        if (cursor) {
          req = store.get(cursor.key);
          req.onsuccess = function (evt) {
            let value = evt.target.result;
            if(value.id == sel_atividade.options[sel_atividade.selectedIndex].value ){
              for(i=0; i<value.duracao.length; i++){
                opt = document.createElement("option")
                opt.value = value.duracao[i][0]
                opt.text = (value.duracao[i][1] < 60)? value.duracao[i][1]+" min" : value.duracao[i][1]/60.0 + " h"
                opt.setAttribute('data-duracao', value.duracao[i][1])
                sel_duracao.add(opt)
              }
            }
          };
          cursor.continue();
        }
      };
    };//indexedDB
  });
});



function putEventoDiario(novo){
  let data = document.getElementById('data').value
  // let recorrencia = document.getElementById('recorrente').value
  // let encerramento = document.getElementById('encerramento').value
  let atividade = document.getElementById('atividade').value
  let atividade_nome = document.getElementById('atividade').options[document.getElementById('atividade').selectedIndex].text
  let duracao = document.getElementById('duracao').value
  let sub_atividade = document.getElementById('subAtividade').value
  let descricao = document.getElementById('descricao').value
  let num_sei = document.getElementById('numSei').value
  let diario_evento_id = document.getElementById('diario_evento_id').value

  let table_name = ""

  // if(recorrencia > 0)
  //   table_name = "eventos"
  // else
    table_name = "diario"

  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction(table_name, 'readwrite');
    const store = tx.objectStore(table_name);

    let obj = { 
      data: data,
      atividade: atividade,
      sub_atividade: sub_atividade,
      duracao: duracao,
      descricao: descricao,
      num_sei: num_sei,
    };

    // if(!novo)
    //   obj.id = diario_evento_id

    // if(recorrencia > 0){
    //   obj.recorrencia = recorrencia
    //   obj.encerramento= encerramento
    // } else {
    //   let selectedIndex = document.getElementById('duracao').selectedIndex
    //   obj.duracao_minutos = parseInt(document.getElementById('duracao')[selectedIndex].getAttribute('data-duracao'))
    //   obj.atividade_nome = atividade_nome
    // }
    let selectedIndex = document.getElementById('duracao').selectedIndex
      obj.duracao_minutos = parseInt(document.getElementById('duracao')[selectedIndex].getAttribute('data-duracao'))
      obj.atividade_nome = atividade_nome

    console.debug(obj)

    let req_add, req_update;
    try {
      // req = store.add(obj);
      if(novo){
        req_add = store.add(obj)
        req_add.onsuccess = function(event){
          var key = event.target.result;
          flash("Inserido com Id #"+key, SUCCESS)
        }

        req_add.onerror = function() {
          flash(this.error, ERROR)
        };
      } else {
        // req_update = store.put(obj, diario_evento_id)
        // req_update.onsuccess = function(event){
        //   var key = event.target.result;
        //   document.getElementById('flash').textContent = "Atualizei Id #"+key
        // }
        // req_update.onerror = function() {
        //   document.getElementById('flash').textContent = this.error
        // };

        const objectStore = store.get(parseInt(diario_evento_id))

        objectStore.onsuccess = function(ev){
          const dados = ev.target.result
          console.debug(`get ${diario_evento_id} => ${dados}`)
          dados.data = data
          dados.atividade= atividade
          dados.sub_atividade= sub_atividade
          dados.duracao= duracao
          dados.descricao= descricao
          dados.num_sei= num_sei

          // if(recorrencia > 0){
          //   data.recorrencia = recorrencia
          //   data.encerramento= encerramento
          // } else {
          //   let selectedIndex = document.getElementById('duracao').selectedIndex
          //   data.duracao_minutos = parseInt(document.getElementById('duracao')[selectedIndex].getAttribute('data-duracao'))
          //   data.atividade_nome= atividade_nome
          // }
          let selectedIndex = document.getElementById('duracao').selectedIndex
            dados.duracao_minutos = parseInt(document.getElementById('duracao')[selectedIndex].getAttribute('data-duracao'))
            dados.atividade_nome= atividade_nome

          req_update = store.put(dados)
          req_update.onsuccess = function(event){
            var key = event.target.result;
            flash("Atualizei Id #"+key, SUCCESS)
          }
          req_update.onerror = function() {
            flash(this.error, ERROR)
          };
        }
      }
    } catch (e) {
      throw e;
    }

    
  };//indexedDB
}

function carregarDiarioParaEdicao(diario_id){
  let data = document.getElementById('data')
  let atividade = document.getElementById('atividade')
  let duracao = document.getElementById('duracao')
  let sub_atividade = document.getElementById('subAtividade')
  let descricao = document.getElementById('descricao')
  let num_sei = document.getElementById('numSei')
  let diario_evento_id = document.getElementById('diario_evento_id')
  let btn_editar_diario = document.getElementById('btn_editar_diario')

  btn_editar_diario.removeAttribute('disabled')

  if(diario_id==""){
    diario_evento_id.value = 0
    data.value = ''
    atividade.value = 0
    descricao.value = ''
    num_sei.value = ''
    duracao.value = 0
    sub_atividade.value = 0
    return
  }

  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readonly');
    const store = tx.objectStore("diario");
    
    const key = IDBKeyRange.only(parseInt(diario_id))

    let req = store.openCursor(key);
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;

      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (cur_event) {
          let value = cur_event.target.result;
            diario_evento_id.value = value.id
            data.value = datetime2date(new Date())
            atividade.value = value.atividade
            descricao.value = value.descricao
            num_sei.value = value.num_sei
            atividade.dispatchEvent(new Event('change'))
            setTimeout(()=>{
              duracao.value = value.duracao
              sub_atividade.value = value.sub_atividade
            }, 600)  
        };
      }
    };
  };//indexedDB
}

// carrega o form com registro de evento/diário do db
document.getElementById("lista_favorito").addEventListener('change', function(btn_event){
  let lista = document.getElementById('lista_favorito')
  carregarDiarioParaEdicao(lista.value)
});

document.getElementById("btn_incluir_diario").addEventListener('click', function(btn_event){
  putEventoDiario(true)
  carregarListaFavoritos();
});

document.getElementById("btn_editar_diario").addEventListener('click', function(btn_event){
  let btn_editar_diario = document.getElementById('btn_editar_diario')
  btn_editar_diario.setAttribute('disabled','')
  putEventoDiario(false)
  carregarListaFavoritos();
});


document.getElementById("btn_exportar_cancelar").addEventListener('click', function(btn_event){
  let div = document.getElementById('divExportacao')
  div.style.display='none'
});

document.getElementById("btn_exportar").addEventListener('click', function(btn_event){

  let div = document.getElementById('divExportacao')
  div.style.display='block'

  invocar_exportar_db()

});

async function invocar_exportar_db(){
  let dump = {}
  dump.chamados = await exportar_db_chamados()
  dump.diario = await exportar_db_diario()
  console.debug(`Dump: diario=${dump.diario.length} chamados=${dump.chamados.length}`)
  let saida = document.getElementById('txtJsonExportacao')
  saida.value = ''
  saida.value = JSON.stringify(dump)
}

function exportar_db_diario(){
  return new Promise((resolve, reject) => {
    let result;
    indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
      const idb = this.result;
      const tx = idb.transaction("diario", 'readonly');
      tx.oncomplete = _ => resolve(result);
      tx.onerror = event => reject(event.target.error);
      const store = tx.objectStore("diario");
      let req = store.openCursor();
      let dados = []
      req.onsuccess = function(evt) {
        var cursor = evt.target.result;
        if (cursor) {
          req = store.get(cursor.key);
          req.onsuccess = function (cur_event) {
            let value = cur_event.target.result;
            dados.push(value);
          };
          cursor.continue();
        } else {
          result = dados;
        }
      };
    };//indexedDB
  });//Promise
}

function exportar_db_chamados(){
  return new Promise((resolve, reject) => {
    let result;
    indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
      const idb = this.result;
      const tx = idb.transaction("chamados", 'readonly');
      tx.oncomplete = _ => resolve(result);
      tx.onerror = event => reject(event.target.error);
      const store = tx.objectStore("chamados");
      let req = store.openCursor();
      let dados = []
      req.onsuccess = function(evt) {
        var cursor = evt.target.result;
        if (cursor) {
          req = store.get(cursor.key);
          req.onsuccess = function (cur_event) {
            let value = cur_event.target.result;
            dados.push(value);
          };
          cursor.continue();
        } else {
          result = dados;
        }
      };
    };//indexedDB
  });//Promise
}


function navegarEvento(direcao){
  let lista = document.getElementById('lista_favorito');
  let selectedIndex = lista.selectedIndex
  if(direcao){
    if(selectedIndex+1 >= lista.length)
      lista.selectedIndex = 0;
    else
      lista.selectedIndex = selectedIndex+1
  } else {
    if(selectedIndex-1 < 0)
      lista.selectedIndex = lista.length-1;
    else
      lista.selectedIndex = selectedIndex-1
  }
  lista.dispatchEvent(new Event('change'))
}

document.getElementById("link_evento_anterior").addEventListener('click', function(btn_event){ navegarEvento(false); });
document.getElementById("link_evento_posterior").addEventListener('click', function(btn_event){ navegarEvento(true); });
document.getElementById("link_evento_favorito").addEventListener('click', function(btn_event){
  let id = document.getElementById("lista_favorito").value
  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readwrite');
    const store = tx.objectStore("diario");
    const req = store.get(parseInt(id))
    req.onsuccess = function(event){
      let dados = event.target.result
      dados.favorito = 0
      store.put(dados).onsuccess = function(event){
        flash(`ID #${id} deixou de ser um favorito.`, SUCCESS)
        carregarListaFavoritos();
      }
    }
  };//indexedDB
});
document.getElementById("descricao").addEventListener('keyup', function(event){
  let desc = document.getElementById("descricao").value
  let max = document.getElementById("descricao").getAttribute('maxlength')
  document.getElementById("descricao_count").textContent = desc.length
});



document.getElementById("btn_sei_triagem").addEventListener('click', function(btn_event){

  let ini = document.getElementById('tab_diario_ini').value
  let fim = document.getElementById('tab_diario_fim').value

  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readonly');
    let store = tx.objectStore("diario");
    store = store.index('data_diario')
    const keyRange = IDBKeyRange.bound(ini, fim)
    let req = store.openCursor(keyRange, "next");
    let dadosTriagem = []
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        req = store.get(cursor.key);
          let value = cursor.value;
          dadosTriagem.push({
            codigo: value.duracao,
            texto: value.atividade_nome
          })
        console.debug("triagem de " + value.duracao)
        cursor.continue();
      } else {
        console.debug("===> todos os dados para triagem " + dadosTriagem.length)
        browser.tabs
        .executeScript({file: "/js/main.js"}) //só deve importar uma vez
        .then(function(){

          browser.tabs
          .query({active: true, currentWindow: true})
          .then((tabs)=>{

            browser.tabs.sendMessage(tabs[0].id, {
              command: "sei_triar",
              dados: dadosTriagem
            });
          });

        }).catch(reportExecuteScriptError);
      }

    };
  };//indexedDB


});

document.getElementById("diario_set_hoje").addEventListener('click', function(btn_event){
  document.getElementById('data').value = datetime2date(new Date())
});


document.getElementById("btn_sei_analise").addEventListener('click', function(btn_event){

  let ini = document.getElementById('tab_diario_ini').value
  let fim = document.getElementById('tab_diario_fim').value

  let prefixarTextoComData = false
  let infoComplementares = ""
  let analiseEncaminhamento = ""
  let analiseFila = ""
  try{ 
    storage = window.localStorage
    prefixarTextoComData = (storage.prefixarTextoComData!=undefined && storage.prefixarTextoComData == 'sim')? true : false
    
    if(storage.prefixarTextoComData!=undefined)
      infoComplementares = storage.infoComplementares
    if(storage.analiseEncaminhamento!=undefined)
      analiseEncaminhamento = storage.analiseEncaminhamento
    if(storage.analiseFila!=undefined)
      analiseFila = storage.analiseFila

  } catch(e){
    console.error(e)
  }

  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readonly');
    let store = tx.objectStore("diario");
    store = store.index('data_diario')
    const keyRange = IDBKeyRange.bound(ini, fim)
    let req = store.openCursor(keyRange, "next");
    let dadosTriagem = []
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        req = store.get(cursor.key);
          let value = cursor.value;
          dadosTriagem.push({
            atividade: value.atividade_nome,
            sub_atividade: value.sub_atividade,
            descricao: value.descricao,
            codigo: value.duracao,
            duracao_minutos: formatarTempo(value.duracao_minutos, "h min"),
            num_sei: value.num_sei,
            data: value.data,
          })
        console.debug("análise de " + value.duracao)
        cursor.continue();
      } else {
        console.debug("===> todos os dados para análise " + dadosTriagem.length)
        browser.tabs
        .executeScript({file: "/js/main.js"}) //só deve importar uma vez
        .then(function(){

          browser.tabs
          .query({active: true, currentWindow: true})
          .then((tabs)=>{

            browser.tabs.sendMessage(tabs[0].id, {
              command: "sei_analisar",
              dados: dadosTriagem,
              prefixarTextoComData: prefixarTextoComData,
              infoComplementares: infoComplementares,
              analiseEncaminhamento: analiseEncaminhamento,
              analiseFila: analiseFila
            });
          });

        }).catch(reportExecuteScriptError);
      }

    };
  };//indexedDB
  
});

function inicializarAbaDiario(dispararEvento=false){
  popularTabelaDiario(date2sqldate(new Date()), date2sqldate(new Date()))
  popularTabelaChamados(date2sqldate(new Date()), date2sqldate(new Date()))
  document.getElementById('tab_diario_ini').value = datetime2date(new Date())
  document.getElementById('tab_diario_fim').value = datetime2date(new Date())
  if(dispararEvento){
    document.getElementById("tab_diario_ini").dispatchEvent(new Event('change'))
  }
}

document.getElementById("tab2").addEventListener('click', function(btn_event){
  inicializarAbaDiario(true);
});

document.getElementById("tab3").addEventListener('click', function(btn_event){
  popularOrigemChamados();
});

document.querySelectorAll("input[name='tab_diario_pesquisa']").forEach(function(elem,index){
    elem.addEventListener('change', function(btn_event){
    let ini = document.getElementById('tab_diario_ini').value
    let fim = document.getElementById('tab_diario_fim').value
    let datas;
    if(ini !== "" && fim !== "")
      datas = hojeMinMax(ini, fim)
    else if(ini !== "")
      datas = hojeMinMax(ini, ini)
    else
      return
    popularTabelaDiario(datas.desde, datas.ate)
    popularTabelaChamados(datas.desde, datas.ate)
  });
})

function editarDiario(event){
  let id = event.target.getAttribute('data-id')
  console.debug(`editar ${id}`)
  carregarDiarioParaEdicao(id)
  document.getElementById("tab3").checked = true
}

function favoritarDiario(event){
  let id = event.target.getAttribute('data-id')
  console.debug(`favoritar ${id}`)

  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readwrite');
    const store = tx.objectStore("diario");
    const req = store.get(parseInt(id))
    req.onsuccess = function(event){
      let dados = event.target.result
      dados.favorito = (dados.favorito==undefined || dados.favorito==0)? 1 : 0
      console.debug(`${dados.id} virou um favorito? ${dados.favorito==1}`)
      store.put(dados).onsuccess = function(event){
        flash(`ID #${id} ${(dados.favorito==1)? 'é um favorito.':'deixou de ser um favorito.'}`, SUCCESS)
        document.getElementById("tab_diario_ini").dispatchEvent(new Event('change'))
        carregarListaFavoritos();
      }
    }
  };//indexedDB
}

function removerDiario(event){
  let id = event.target.getAttribute('data-id')
  console.debug(`remover ${id}`)

  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readwrite');
    const store = tx.objectStore("diario");

    
    const key = IDBKeyRange.only(parseInt(id))
    const req = store.delete(key)

    req.onsuccess = function(){
      flash(`ID #${id} foi removido.`, SUCCESS)
      document.getElementById("tab_diario_ini").dispatchEvent(new Event('change'))
    }
    
  };//indexedDB
}


function popularTabelaDiario(desde_iso_str, ate_iso_str){
  
  document.getElementById("table_diario").clearChildren();
  document.getElementById("tab_diario_horas_total").textContent="";

  //agrupamento por código da duração (atividade/duração)
  let grupos = [
    {
      codigo: null, //código da duração da atividade
      qtde: null,   //qtde de registros com esse código
      atividade: null,
      duracao_minutos: null,
    }
    ] 

  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readonly');
    let store = tx.objectStore("diario");
    store = store.index('data_diario')
    const keyRange = IDBKeyRange.bound(desde_iso_str, ate_iso_str)
    let req = store.openCursor(keyRange);
    let total_horas = 0;
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        // req = store.get(cursor.key);
        // req.onsuccess = function (cur_event) {
        let value = cursor.value;
        let tr = document.createElement("tr")
        let p_data = document.createElement("p")
        p_data.textContent=value.data
        let td_data = document.createElement("td")
        td_data.append(p_data)
          let a_edit = document.createElement("a")
          a_edit.setAttribute("class", "icon icon-edit")
          a_edit.setAttribute("data-id", value.id)
          a_edit.setAttribute('href','#')
          a_edit.setAttribute('title','Editar')
          a_edit.addEventListener('click', function(e){editarDiario(e)})
        td_data.append(a_edit)
          let a_fav = document.createElement("a")
          if(value.favorito==undefined || value.favorito==0){
            a_fav.setAttribute("class", "icon icon-fav")
          } else {
            a_fav.setAttribute("class", "icon icon-fav-true")
          }
          a_fav.setAttribute("data-id", value.id)
          a_fav.setAttribute('href','#')
          a_fav.setAttribute('title','Favoritar')
          a_fav.addEventListener('click', function(e){favoritarDiario(e)})
        td_data.append(a_fav)
          let a_delete = document.createElement("a")
          a_delete.setAttribute("class", "icon icon-delete")
          a_delete.setAttribute("data-id", value.id)
          a_delete.setAttribute('href','#')
          a_delete.setAttribute('title','Remover')
          a_delete.addEventListener('click', function(e){removerDiario(e)})
        td_data.append(a_delete)
        tr.append(td_data)

        let td_duracao = document.createElement("td")
        td_duracao.textContent = formatarTempo(value.duracao_minutos)

        tr.append(td_duracao)
        let p_ativ = document.createElement("p")
        p_ativ.textContent = value.atividade_nome
        let p_desc = document.createElement("small")
        p_desc.textContent = value.descricao
        let td_desc = document.createElement("td")
        td_desc.append(p_ativ)
        td_desc.append(p_desc)
        tr.append(td_desc)
        document.getElementById("table_diario").append(tr)

        // verificando se há "duração código" duplicado no período
        // let isAgrupado = false
        // for(let gi=0; gi<grupos.length; gi++){
        //   if(grupos[gi].codigo == value.duracao || grupos[gi].codigo == null){
        //     grupos[gi].codigo = value.duracao
        //     grupos[gi].qtde+=1
        //     grupos[gi].atividade=value.atividade_nome
        //     grupos[gi].duracao_minutos=value.duracao_minutos
        //     isAgrupado = true
        //     break
        //   } 
        // }
        // if(!isAgrupado){
        //   grupos.push({
        //       codigo: value.duracao,
        //       qtde: 1,
        //       atividade: value.atividade_nome,
        //       duracao_minutos: value.duracao_minutos
        //     })
        // }

        total_horas+=value.duracao_minutos
        cursor.continue();
      // };
      } else {
        document.getElementById("tab_diario_horas_total").textContent = formatarTempo(total_horas, "hhmm");

        // let avisar = false
        // let msg = "<strong>Atividade de mesma duração repetida!</strong><br>"
        // for(let i=0; i<grupos.length; i++){
        //   if(grupos[i].qtde > 1){
        //     avisar = true
        //     msg += `${grupos[i].qtde} registros ${grupos[i].duracao_minutos}min/${grupos[i].atividade}<br>`
        //     console.debug(msg)
        //   }
        // }
        // msg += "<small>O SEI vai descartar essas horas!</small>"
        // if(avisar)
        //   flash(`${msg}`, ERROR, true)
        
      }
    };
  };//indexedDB
}


function popularTabelaChamados(iniSqlDate, fimSqlDate){
  let tabela = document.getElementById("table_chamados")
  
  tabela.clearChildren();

  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("chamados", 'readonly');
    let store = tx.objectStore("chamados");
    store = store.index('ch_data')
    console.debug(`popularTabelaChamados de ${iniSqlDate} até ${fimSqlDate}`)
    const keyRange = IDBKeyRange.bound(iniSqlDate, fimSqlDate)
    let req = store.openCursor(keyRange, "next");
    
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        req = store.get(cursor.key);
        let value = cursor.value;
        console.debug(`chamado ${value}`)
        console.debug(`chamado ${value.id}`)
        console.debug(`chamado ${value.data}`)
        console.debug(`chamado ${value.numero}`)
        console.debug(`chamado ${value.contato}`)
        console.debug(`chamado ${value.assunto}`)
        let tr = document.createElement("tr")
        let p_data = document.createElement("p")
        p_data.textContent= date2datahoraLocal(new Date(value.data))
        let td_data = document.createElement("td")
        td_data.append(p_data)
        //   let a_edit = document.createElement("a")
        //   a_edit.setAttribute("class", "icon icon-edit")
        //   a_edit.setAttribute("data-id", value.id)
        //   a_edit.setAttribute('href','#')
        //   a_edit.setAttribute('title','Editar')
        //   a_edit.addEventListener('click', function(e){editarDiario(e)})
        // td_data.append(a_edit)
        //   let a_fav = document.createElement("a")
        //   if(value.favorito==undefined || value.favorito==0){
        //     a_fav.setAttribute("class", "icon icon-fav")
        //   } else {
        //     a_fav.setAttribute("class", "icon icon-fav-true")
        //   }
        //   a_fav.setAttribute("data-id", value.id)
        //   a_fav.setAttribute('href','#')
        //   a_fav.setAttribute('title','Favoritar')
        //   a_fav.addEventListener('click', function(e){favoritarDiario(e)})
        // td_data.append(a_fav)
        //   let a_delete = document.createElement("a")
        //   a_delete.setAttribute("class", "icon icon-delete")
        //   a_delete.setAttribute("data-id", value.id)
        //   a_delete.setAttribute('href','#')
        //   a_delete.setAttribute('title','Remover')
        //   a_delete.addEventListener('click', function(e){removerDiario(e)})
        // td_data.append(a_delete)
        tr.append(td_data)

        let td_origem = document.createElement("td")
        td_origem.textContent = value.origem
        tr.append(td_origem)

        let td_chamado = document.createElement("td")
        td_chamado.textContent = value.numero
        tr.append(td_chamado)

        let td_assunto = document.createElement("td")
        td_assunto.textContent = value.assunto
        tr.append(td_assunto)

        let td_contato = document.createElement("td")
        td_contato.textContent = value.contato
        tr.append(td_contato)

        tabela.append(tr)
        cursor.continue();
      } 
    };
  };//indexedDB
}

/* ******************************
* Popula a combo com os tipos
* de origem existentes no DB
* *******************************/
function popularOrigemChamados(){
  let combo = document.getElementById('origem_chamados')
  
  let origens = []

  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("chamados", 'readonly');
    let store = tx.objectStore("chamados");
    let req = store.openCursor()
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (cur_event) {
          let value = cur_event.target.result;
          if(!origens.includes(value.origem))
            origens.push(value.origem)
        };
        cursor.continue();
      } else {
        removeOptions(combo)
        combo.add(createOptionSelecione())
        for(i=0; i<origens.length; i++){
          let opt = document.createElement("option")
          opt.value = origens[i]
          opt.text = origens[i]
          combo.add(opt)
        }
      }
    };
  };//indexedDB
  
}






/***********************
  TAB CONFIG
************************/

document.getElementById("btn_importar").addEventListener('click', function(btn_event){
  let entrada = document.getElementById('divImportacao')
  entrada.style.display='block'

  document.getElementById('txtJsonImportacao').value = ''
});

document.getElementById("btn_importar_cancelar").addEventListener('click', function(btn_event){
  let entrada = document.getElementById('divImportacao')
  entrada.style.display='none'
});

document.getElementById("btn_importar_salvar").addEventListener('click', function(btn_event){

  let divImportacao = document.getElementById('divImportacao')
  let txtJsonImportacao = document.getElementById('txtJsonImportacao')
  
  let dados = []
  try {
    dados = JSON.parse(txtJsonImportacao.value)
  } catch(e){
    flash(e, ERROR)
    return
  }

  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readwrite');
    const store = tx.objectStore("diario");
    
    tx.oncomplete = _ => flash(`Inserido ${dados.diario.length} registros de diário. `, SUCCESS)

    for(n in dados.diario){
      let obj = dados.diario[n]
      delete obj.id
      let req = store.add(obj);
      req.onsuccess = function(evt) {
        var key = evt.target.result;
      };
      req.onerror = function() {
        flash('ERR: ' + this.error, ERROR)
      };
    } //fim for
  };//indexedDB


  indexedDB.open("pgd",DB_VERSAO).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("chamados", 'readwrite');
    const store = tx.objectStore("chamados");
    
    tx.oncomplete = _ => flash(`Inserido ${dados.chamados.length} chamados. `, SUCCESS)
    
    for(n in dados.chamados){
      let obj = dados.chamados[n]
      delete obj.id
      let req = store.add(obj);
      req.onsuccess = function(evt) {
        var key = evt.target.result;
      };
      req.onerror = function() {
        flash('ERR: ' + this.error, ERROR)
      };
    } //fim for
  };//indexedDB

  carregarListaFavoritos(); //essa chamada vai tentar abrir uma conexão com o indexedDB

  txtJsonImportacao.value=''
  divImportacao.style.display='none'

});
document.getElementById("configInfoComplementares").addEventListener("change", function(){
  try{
    let storage = window.localStorage
    storage.infoComplementares = this.value
  } catch(e){
    flash(`Seu navegador não tem suporte para salvar a configuração.`,ERROR)
    console.error(e)
  }
})

document.getElementById("configPrefixarTextoComData").addEventListener("change", function(){
  try{
    let storage = window.localStorage
    storage.prefixarTextoComData = this.value
  } catch(e){
    flash(`Seu navegador não tem suporte para salvar a configuração.`, ERROR)
    console.error(e)
  }
})

document.getElementById("configAnaliseEncaminhamento").addEventListener("change", function(){
  try{
    let storage = window.localStorage
    storage.analiseEncaminhamento = this.value
  } catch(e){
    flash(`Seu navegador não tem suporte para salvar a configuração.`,ERROR)
    console.error(e)
  }
})


document.getElementById("configAnaliseFila").addEventListener("change", function(){
  try{
    let storage = window.localStorage
    storage.analiseFila = this.value
  } catch(e){
    flash(`Seu navegador não tem suporte para salvar a configuração.`,ERROR)
    console.error(e)
  }
})


/* ***********************************************
* ESCUTANDO MENSAGENS DE RUNTIME
* Só serão ouvidas quando o HTML do plugin
* for exibido.
************************************************/
browser.runtime.onMessage.addListener((message) => {
  if (message.command === "chamados_mudou") {
    console.debug(`chamados_mudou: ${message}`)
    popularOrigemChamados()
  }
});