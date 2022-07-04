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

  function seiTestar(valor) {
    // removeExistingBeasts();
    // let beastImage = document.createElement("img");
    // beastImage.setAttribute("src", beastURL);
    // beastImage.style.height = "100vh";
    // beastImage.className = "beastify-image";
    // document.body.appendChild(beastImage);
    // var div = document.querySelector("div")
    // var btn = document.createElement("button")
    // btn.appendChild(document.createTextNode(valor))
    // div.appendChild(btn)

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
      }
      frame.querySelector("#btnAdicionar").dispatchEvent(new Event('click'));

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
  function fazerAnalise(dados){
    console.debug(`Analisar com ${dados.length}`)
    console.debug(dados)
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

    let trs = frame.querySelector("#tbAnalise").querySelectorAll("tr")
    for(di=0; di<dados.length; di++){
      // pular o TH ou vai dar pau de undefined
      for(trIndex=1; trIndex < trs.length; trIndex++){
        bAtiv = trs[trIndex].querySelectorAll("td")[1].textContent.indexOf(dados[di].atividade) == 0 //string exata
        bDur = trs[trIndex].querySelectorAll("td")[1].textContent.indexOf(dados[di].duracao_minutos) > 0 //parte da string
        bSub = trs[trIndex].querySelectorAll("td")[2].textContent == dados[di].sub_atividade
        bVazio = trs[trIndex].querySelectorAll("td")[4].querySelector("textarea").value.length == 0

        if(bAtiv && bSub && bDur && bVazio){
          trs[trIndex].querySelectorAll("td")[0].querySelector("input[type='checkbox']").dispatchEvent(new MouseEvent('click'))
          trs[trIndex].querySelectorAll("td")[4].querySelector("textarea").value = `${formatarData(dados[di].data)} ${dados[di].descricao}`
          break
        }
      }
    }

    // frame = document.querySelector("iframe#ifrVisualizacao").contentWindow.document.body.querySelector("#tbAnalise").querySelectorAll("tr")[1].textContent.indexOf('vidades')
    frame.querySelector('#txaInformacaoComplementar').value = "(PGD de Marcel/GIDS3)"
    frame.querySelector('#selEncaminhamentoAnl').value = 1
    frame.querySelector('#selFila').value = 24

  }


  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "sei_triar") {
      fazerTriagem(message.dados);
    } else if (message.command === "sei_analisar") {
      fazerAnalise(message.dados);
    } else if (message.command === "incluir_evento") {
      console.debug("TESTE de incluir " + message.valor)
      var getting = browser.runtime.getBackgroundPage();
    }
  });

})();
