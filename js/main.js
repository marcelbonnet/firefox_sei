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

  function seiTestar(valor) {
    // removeExistingBeasts();
    // let beastImage = document.createElement("img");
    // beastImage.setAttribute("src", beastURL);
    // beastImage.style.height = "100vh";
    // beastImage.className = "beastify-image";
    // document.body.appendChild(beastImage);
    var div = document.querySelector("div")
    var btn = document.createElement("button")
    btn.appendChild(document.createTextNode(valor))
    div.appendChild(btn)
  }


  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === "testar") {
      // seiTestar(message.valor);
      console.debug("TESTE")
      console.debug(message.valor)
    } else if (message.command === "incluir_evento") {
      console.debug("TESTE de incluir " + message.valor)
      var getting = browser.runtime.getBackgroundPage();
      
    }
  });

})();
