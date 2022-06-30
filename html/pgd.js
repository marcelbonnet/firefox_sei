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

function datetime2date(data){
  let a = data
  if((data instanceof Date) == false)
    a = new Date(data)
  return a.toISOString().substring(0,a.toISOString().indexOf('T'))
}

function hojeMinMax(desde, ate){
  desde = desde instanceof Date ? desde : new Date(desde)
  ate =  ate instanceof Date ? ate : new Date(ate)

  desde.setHours(0)
  desde.setMinutes(0)
  desde.setSeconds(0)
  ate.setHours(23)
  ate.setMinutes(59)
  ate.setSeconds(59)
  return {
    desde: desde.toISOString(),
    ate: ate.toISOString()
    }
}

function formatarTempo(minutos, formato){
  if(formato === "hhmm"){
    horas = Math.trunc(minutos/(60))
    minutos = Math.trunc(((minutos/(60))-horas)*60)
    return `${horas<10? '0'+horas : horas}h${minutos<10? '0'+minutos : minutos}`
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

document.getElementById("inicio").addEventListener('change', function(btn_event){ exibirDuracao(); });
document.getElementById("fim").addEventListener('change', function(btn_event){ exibirDuracao(); });

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

    indexedDB.open("pgd",1).onsuccess = function (evt) {
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
  let data_ini = document.getElementById('inicio').value
  let data_fim = document.getElementById('fim').value
  let recorrencia = document.getElementById('recorrente').value
  let encerramento = document.getElementById('encerramento').value
  let atividade = document.getElementById('atividade').value
  let atividade_nome = document.getElementById('atividade').options[document.getElementById('atividade').selectedIndex].text
  let duracao = document.getElementById('duracao').value
  let sub_atividade = document.getElementById('subAtividade').value
  let descricao = document.getElementById('descricao').value
  let num_sei = document.getElementById('numSei').value
  let diario_evento_id = document.getElementById('diario_evento_id').value

  let table_name = ""

  if(recorrencia > 0)
    table_name = "eventos"
  else
    table_name = "diario"

  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction(table_name, 'readwrite');
    const store = tx.objectStore(table_name);

    let obj = { 
      data_ini: data_ini,
      data_fim: data_fim,
      atividade: atividade,
      sub_atividade: sub_atividade,
      duracao: duracao,
      descricao: descricao,
      num_sei: num_sei,
    };

    // if(!novo)
    //   obj.id = diario_evento_id

    if(recorrencia > 0){
      obj.recorrencia = recorrencia
      obj.encerramento= encerramento
    } else {
      let selectedIndex = document.getElementById('duracao').selectedIndex
      obj.duracao_minutos = parseInt(document.getElementById('duracao')[selectedIndex].getAttribute('data-duracao'))
      obj.atividade_nome = atividade_nome
    }

    console.debug(obj)

    let req_add, req_update;
    try {
      // req = store.add(obj);
      if(novo){
        req_add = store.add(obj)
        req_add.onsuccess = function(event){
          var key = event.target.result;
          document.getElementById('flash').textContent = "Inserido com Id #"+key
        }

        req_add.onerror = function() {
          document.getElementById('flash').textContent = this.error
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
          const data = ev.target.result
          console.debug(`get ${diario_evento_id} => ${data}`)
          data.data_ini = data_ini
          data.data_fim = data_fim
          data.atividade= atividade
          data.sub_atividade= sub_atividade
          data.duracao= duracao
          data.descricao= descricao
          data.num_sei= num_sei

          if(recorrencia > 0){
            data.recorrencia = recorrencia
            data.encerramento= encerramento
          } else {
            let selectedIndex = document.getElementById('duracao').selectedIndex
            data.duracao_minutos = parseInt(document.getElementById('duracao')[selectedIndex].getAttribute('data-duracao'))
            data.atividade_nome= atividade_nome
          }

          req_update = store.put(data)
          req_update.onsuccess = function(event){
            var key = event.target.result;
            document.getElementById('flash').textContent = "Atualizei Id #"+key
          }
          req_update.onerror = function() {
            document.getElementById('flash').textContent = this.error
          };
        }
      }
    } catch (e) {
      throw e;
    }

    
  };//indexedDB
}

document.getElementById("tipo_evento").addEventListener('change', function(btn_event){

  let tipo_evento = document.getElementById('tipo_evento')
  let lista = document.getElementById('lista_diario_evento')

  removeOptions(lista)
  lista.add(createOptionSelecione())

  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    let table_name = "eventos"
    
    if(tipo_evento.value === "diario")
      table_name = "diario"
    else if(tipo_evento.value === "evento")
      table_name = "eventos"
    else
      return;

    const tx = idb.transaction(table_name, 'readonly');
    const store = tx.objectStore(table_name);
    let req = store.openCursor();
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;

      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (cur_event) {
          let value = cur_event.target.result;
          opt = document.createElement("option")
          opt.value = value.id
          opt.text = `#${value.id} ${value.data_ini}`
          lista.add(opt)
        };
        cursor.continue();
      }
    };
  };//indexedDB
});


// carrega o form com registro de evento/diário do db
document.getElementById("lista_diario_evento").addEventListener('change', function(btn_event){

  let data_ini = document.getElementById('inicio')
  let data_fim = document.getElementById('fim')
  let recorrencia = document.getElementById('recorrente')
  let encerramento = document.getElementById('encerramento')
  let atividade = document.getElementById('atividade')
  let duracao = document.getElementById('duracao')
  let sub_atividade = document.getElementById('subAtividade')
  let descricao = document.getElementById('descricao')
  let num_sei = document.getElementById('numSei')
  let diario_evento_id = document.getElementById('diario_evento_id')
  let btn_editar_diario = document.getElementById('btn_editar_diario')

  btn_editar_diario.removeAttribute('disabled')

  let tipo_evento = document.getElementById('tipo_evento')
  let lista = document.getElementById('lista_diario_evento')

  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    let table_name = "eventos"

    if(tipo_evento.value === "diario")
      table_name = "diario"
    else if(tipo_evento.value === "evento")
      table_name = "eventos"
    else
      return;

    const tx = idb.transaction(table_name, 'readonly');
    const store = tx.objectStore(table_name);
    let req = store.openCursor();
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;

      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (cur_event) {
          let value = cur_event.target.result;
          if(value.id == lista.value){
            diario_evento_id.value = value.id
            data_ini.value = value.data_ini
            data_fim.value = value.data_fim
            recorrencia.value = value.recorrencia
            encerramento.value = value.encerramento
            atividade.value = value.atividade
            descricao.value = value.descricao
            num_sei.value = value.num_sei
            atividade.dispatchEvent(new Event('change'))
            setTimeout(()=>{
              duracao.value = value.duracao
              sub_atividade.value = value.sub_atividade

              exibirDuracao()
            }, 600)  
          }
        };
        cursor.continue();
      }
    };
  };//indexedDB
  
});

document.getElementById("btn_incluir_diario").addEventListener('click', function(btn_event){
  putEventoDiario(true)
});

document.getElementById("btn_editar_diario").addEventListener('click', function(btn_event){
  let btn_editar_diario = document.getElementById('btn_editar_diario')
  btn_editar_diario.setAttribute('disabled','')
  putEventoDiario(false)
});


// exportar
document.getElementById("btn_exportar").addEventListener('click', function(btn_event){

  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("eventos", 'readonly');
    const store = tx.objectStore("eventos");
    let req = store.openCursor();
    let dados = []
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (cur_event) {
          let value = cur_event.target.result;
          dados.push({
            data_ini: value.data_ini,
            data_fim: value.data_fim,
            atividade: value.atividade,
            sub_atividade: value.sub_atividade,
            duracao: value.duracao,
            descricao: value.descricao,
            num_sei: value.num_sei,
            recorrencia: value.recorrencia,
            encerramento: value.encerramento,
            });
        };
        cursor.continue();
      }
    };
  };//indexedDB

});

// procurar para calcular horas no período
document.getElementById("btn_procurar").addEventListener('click', function(btn_event){

  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readonly');
    const store = tx.objectStore("diario");
    let req = store.openCursor();
      let total = 0
      let horas = 0
      let minutos = 0
      let total_pgd = 0
      let horas_pgd = 0
      let minutos_pgd = 0
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (cur_event) {
          let value = cur_event.target.result;
          let fim = (new Date(value.data_fim)).getTime()
          let ini = (new Date(value.data_ini)).getTime()
          total+= (fim-ini)
          total_pgd+=value.duracao_minutos
        };
        cursor.continue();
      }
      horas = Math.trunc(total/(1000*60*60))
      minutos = Math.trunc(((total/(1000*60*60))-horas)*60)
      horas_pgd = Math.trunc(total_pgd/60)
      minutos_pgd = Math.trunc((total_pgd/60-horas_pgd)*60)
      document.getElementById("flash").textContent = `No período: ${horas}:${minutos} horas de eventos. Para o SEI são ${horas_pgd}:${minutos_pgd} horas.`
    };
  };//indexedDB


//   let desde = new Date(document.getElementById('pesquisa_ini').value)
//   let ate =   new Date(document.getElementById('pesquisa_fim').value)

//   desde.setHours(0)
//   desde.setMinutes(0)
//   desde.setSeconds(0)
//   ate.setHours(23)
//   ate.setMinutes(59)
//   ate.setSeconds(59)
// //TODO resolver depois como pesquisar por datas no index
//   indexedDB.open("pgd",1).onsuccess = function (evt) {
//     const idb = this.result;
//     const tx = idb.transaction("eventos", 'readonly');
//     const store = tx.objectStore("eventos");
//     // store.index(['data_ini','data_fim'])
//     let storeIndex = store.index('idx_evento')
//     console.debug(`${desde} ${ate}`)
//     let keyRange = IDBKeyRange.bound([desde.getTime(),desde.getTime(),0],[ate.getTime(),ate.getTime(),1000])
//     // let req = store.openCursor(keyRange);
//     let req = store.openCursor(keyRange);
//     req.onsuccess = function(evt) {
//       var cursor = evt.target.result;
//       if (cursor) {
//         console.debug(cursor.value.id)
//         cursor.continue();
//       }
//     };
//   };//indexedDB
});


function navegarEvento(direcao){
  let lista = document.getElementById('lista_diario_evento');
  let selectedIndex = lista.selectedIndex
  if(direcao){
    if(selectedIndex+1 >= lista.length) return;
    lista.selectedIndex = selectedIndex+1
  } else {
    if(selectedIndex-1 < 0) return;
    lista.selectedIndex = selectedIndex-1
  }
  lista.dispatchEvent(new Event('change'))
}

document.getElementById("link_evento_anterior").addEventListener('click', function(btn_event){ navegarEvento(false); });
document.getElementById("link_evento_posterior").addEventListener('click', function(btn_event){ navegarEvento(true); });
document.getElementById("descricao").addEventListener('keyup', function(event){
  let desc = document.getElementById("descricao").value
  let max = document.getElementById("descricao").getAttribute('maxlength')
  document.getElementById("descricao_count").textContent = max - desc.length
});



document.getElementById("btn_sei_triagem").addEventListener('click', function(btn_event){

  // browser.tabs
  // .executeScript({file: "/js/main.js"}) //só deve importar uma vez
  // .then(function(){

  //   browser.tabs
  //   .query({active: true, currentWindow: true})
  //   .then((tabs)=>{

  //     browser.tabs.sendMessage(tabs[0].id, {
  //       command: "sei_triar",
  //       valor: "foo"

  //     });
  //   });

  // }).catch(reportExecuteScriptError);

  let ini = document.getElementById('pesquisa_ini').value
  let fim = document.getElementById('pesquisa_fim').value
  let datas = hojeMinMax(ini,fim)

  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readonly');
    let store = tx.objectStore("diario");
    store = store.index('data_ini_diario')
    const keyRange = IDBKeyRange.bound(datas.desde, datas.ate)
    let req = store.openCursor(keyRange, "next");
    let dadosTriagem = []
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (cur_event) {
          let value = cur_event.target.result;
          dadosTriagem.push({
            codigo: value.duracao,
            texto: value.atividade_nome
          })
        };
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

document.getElementById("btn_sei_analise").addEventListener('click', function(btn_event){

  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readonly');
    const store = tx.objectStore("diario");
    // store.index('') // vou precisar usar dois index ini/fim
    // const keyRange = IDBKeyRange.bound()
    // let req = store.openCursor(keyRange);
    let req = store.openCursor();
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      let dadosAnalise = {} //estou enviando um por vez :(
      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (cur_event) {
          let value = cur_event.target.result;
          dadosAnalise = {
            atividade: value.atividade,
            sub_atividade: value.sub_atividade,
            duracao: value.duracao,
            descricao: value.descricao,
            data_ini: value.data_ini,
          }
        };
        cursor.continue();
      } 
      
      browser.tabs
      .executeScript({file: "/js/main.js"}) //só deve importar uma vez
      .then(function(){

        browser.tabs
        .query({active: true, currentWindow: true})
        .then((tabs)=>{

          browser.tabs.sendMessage(tabs[0].id, {
            command: "sei_analisar",
            dados: dadosAnalise
          });
        });

      }).catch(reportExecuteScriptError);
    };
  };//indexedDB
  
});

document.getElementById("tab2").addEventListener('click', function(btn_event){
  let datas = hojeMinMax(new Date(), new Date())
  popularTabelaDiario(datas.desde, datas.ate)
  console.log(`${datas.desde} => ${datas.ate}`)
  document.getElementById('tab_diario_ini').value = datetime2date(datas.desde)
  document.getElementById('tab_diario_fim').value = datetime2date(datas.ate)
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
  });
})

function popularTabelaDiario(desde_iso_str, ate_iso_str){
  
  document.getElementById("table_diario").clearChildren();
  document.getElementById("tab_diario_horas_total").textContent="";

  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readonly');
    let store = tx.objectStore("diario");
    store = store.index('data_ini_diario')
    const keyRange = IDBKeyRange.bound(desde_iso_str, ate_iso_str)
    let req = store.openCursor(keyRange, "next");
    let total_horas = 0;
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (cur_event) {
          let value = cur_event.target.result;
          let tr = document.createElement("tr")
          let p_data_ini = document.createElement("p")
          p_data_ini.textContent=value.data_ini
          let p_data_fim = document.createElement("p")
          p_data_fim.textContent=value.data_fim
          let td_data = document.createElement("td")
          td_data.append(p_data_ini)
          td_data.append(p_data_fim)
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

          total_horas+=value.duracao_minutos
        };
        cursor.continue();
      } else {
        document.getElementById("tab_diario_horas_total").textContent = formatarTempo(total_horas, "hhmm");
      }
    };
  };//indexedDB
}