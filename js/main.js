(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  function formatarData(data){
    let meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    date = new Date(`${data}T00:00`)
    console.debug(`${data} => ${date}`)
    return `${date.getDate()}/${meses[date.getMonth()]}`
  }

  function fazerTriagem(dados){
    console.debug("RECEBI: "+ dados.length)
    let frame = document.querySelector("iframe#ifrVisualizacao").contentWindow.document.body
    let div = frame.querySelector("#divInfraBarraComandosSuperior")
    
    // FIXME não continuou depois do dispatch
    // frame.querySelector("#btnIniciarTriagem").dispatchEvent(new Event('click'));

    //trocar por interval e fazer ele parar quando executar tudo
    setTimeout(function(){
      let combo = frame.querySelector("#selAtividade")
      if(combo == undefined || combo == null){
        alert('SEI demorou demais para responder. Repita a operação.')
        history.back()
        return;
      }
      for(i=0;i<dados.length;i++){
        console.debug(dados[i].codigo)
        let opt = document.createElement("option")
        opt.value = dados[i].codigo
        opt.text = dados[i].texto
        combo.add(opt)
        frame.querySelector("#btnAdicionar").dispatchEvent(new Event('click'));
      }

      // FIXME está causando erro de que faltou uma coluna ao submeter:
      // frame.querySelector("#btnSalvar").dispatchEvent(new Event('click'));
      // frame.querySelectorAll("form")[0].submit();
    },0); // FIXME incrementar se conseguir navegar automaticamente


  }// function de triagem

  //recebendo um registro por vez
  // function fazerTriagem(dados){
  //   let frame = document.querySelector("iframe#ifrVisualizacao").contentWindow.document.body
  //   let combo = frame.querySelector("#selAtividade")
  //   for(i=0;i<dados.length;i++){
  //     console.debug(dados[i].codigo)
  //     let opt = document.createElement("option")
  //     opt.value = dados[i].codigo
  //     opt.text = dados[i].texto
  //     combo.add(opt)
  //   }

  // }// function de triagem


  // var invocado = false
  function fazerAnalise(dados, prefixarTextoComData, infoComplementares, analiseEncaminhamento, analiseFila){
    console.debug(`Analisar ${dados.length} dados.`)
    console.debug(dados)
    console.debug(`analiseEncaminhamento=${analiseEncaminhamento}. Fila=${analiseFila}`)
    let frame = document.querySelector("iframe#ifrVisualizacao").contentWindow.document.body

    //Vodoo: marcar e desmarcar todas as checkboxes SÓ UMA VEZ PARA NÃO APAGAR AS DESCRIÇÕES.
    // if(!invocado){
      // invocado = true
      frame.querySelector("#lnkInfraCheck").dispatchEvent(new MouseEvent('click'));
      frame.querySelector("#lnkInfraCheck").dispatchEvent(new MouseEvent('click'));
    // }

    // let sAtiv = "Atividades Comuns - Participar de reuniões e similares"
    // let sDur = "1h"
    // let sSub = "Participação em Reunião ou similares"
    let analisados = []
    let trs = frame.querySelector("#tbAnalise").querySelectorAll("tr")

    let td_grupos = [] //index de cada novo grupo de atividade
    for(i=0; i<trs.length; i++){
      if(trs[i].classList.contains("table-success"))
        td_grupos.push(i)
    }

    console.debug(td_grupos)

    for (di=0; di<dados.length; di++){
      console.debug(`=> ${di} : ${dados[di]}`)
      
      for (trGrupo=0; trGrupo < td_grupos.length; trGrupo++){
        let proximo_index = td_grupos[trGrupo+1];
        // if (td_grupos == td_grupos.length-1){
        //   proximo_index = trs.length
        // } else {
        //   proximo_index = td_grupos[trGrupo+1]
        // }

        if(proximo_index === undefined)
          proximo_index = trs.length        

        bAtiv = trs[td_grupos[trGrupo]].querySelectorAll("td")[0].textContent.indexOf(` ${dados[di].atividade} `) == 0 //string exata
        console.debug(proximo_index)
        for (trIndex=td_grupos[trGrupo]+1; trIndex < proximo_index; trIndex++){
          bDur = (trs[trIndex].querySelectorAll("td")[1].textContent.match(new RegExp(`${dados[di].duracao_minutos}$`)) != null)
          bSub = trs[trIndex].querySelectorAll("td")[2].textContent == dados[di].sub_atividade
          bVazio = trs[trIndex].querySelectorAll("td")[4].querySelector("textarea").value.length == 0

          triagem_id = trs[trIndex].querySelectorAll("td")[5].querySelector("input").value

          // if(bAtiv){
          //   console.debug(`=> TR${trIndex} Atividade: ${bAtiv}`)
          //   console.debug(`=> TR${trIndex} Duração (${dados[di].duracao_minutos}): ${bDur}`)
          //   console.debug(`=> TR${trIndex} Sub : ${bSub}`)
          //   console.debug(`=> TR${trIndex} Vazio: ${bVazio}`)
          // }

          if(bAtiv && bSub && bDur && bVazio && !analisados.includes(triagem_id) ){
            trs[trIndex].querySelectorAll("td")[0].querySelector("input[type='checkbox']").dispatchEvent(new MouseEvent('click'))
            trs[trIndex].querySelectorAll("td")[4].querySelector("textarea").value = (prefixarTextoComData)? `${formatarData(dados[di].data)} ${dados[di].descricao}` : `${dados[di].descricao}`
            analisados.push(triagem_id)
            // console.debug(analisados)
            // console.debug(triagem_id)
            di++; 
            break;
          }

        } // fim for trIndex

      } // fim for trGrupo
    }

    // frame = document.querySelector("iframe#ifrVisualizacao").contentWindow.document.body.querySelector("#tbAnalise").querySelectorAll("tr")[1].textContent.indexOf('vidades')
    frame.querySelector('#txaInformacaoComplementar').value = infoComplementares
    frame.querySelector('#selEncaminhamentoAnl').value = analiseEncaminhamento
    frame.querySelector('#selFila').value = analiseFila

  }


  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "sei_triar") {
      fazerTriagem(message.dados);
    } else if (message.command === "sei_analisar") {
      fazerAnalise(message.dados, message.prefixarTextoComData, message.infoComplementares, message.analiseEncaminhamento, message.analiseFila);
    } else if (message.command === "incluir_evento") {
      console.debug("TESTE de incluir " + message.valor)
      var getting = browser.runtime.getBackgroundPage();
    }
  });

})();
