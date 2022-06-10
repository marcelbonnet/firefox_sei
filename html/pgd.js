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
    else if (e.target.classList.contains("reset")) {
      // browser.tabs.query({active: true, currentWindow: true})
      //   .then(reset)
      //   .catch(reportError);
    }
  });
}


function backgroundListener() {
  console.log("function backgroundListener chamada")
  document.addEventListener("click", (e) => {

    function listarTiposTarefas(tabs) {
      console.log("chamou o listar do content script")
      // browser.tabs.sendMessage(tabs[0].id, {
      //   cmd: "listarTiposTarefas"
      // });
      browser.runtime.sendMessage({greeting: "hello"}, function(response) {
        console.log(response.farewell);
      });

      browser.runtime.sendMessage({cmd: "listarTiposTarefas"}, function(response) {
        // console.log(response.farewell);
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

backgroundListener()
// browser.runtime.getBackgroundPage().then(function(bg){
//   backgroundListener(bg)
// })