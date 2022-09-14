// Adiciona elementos na página do Marval




/* ********************************
*	Mantém a conexão
***********************************/
// MarvalSoftware.UI.Controls.ScriptManager.getInstance().getControl("ctl00_cph_service")._selectedValue.value

// MarvalSoftware.UI.Controls.ScriptManager.getInstance().getControl("ctl00_keepAlive")
setInterval(async function(){
	// document.querySelector("button[identifier]").dispatchEvent(new Event('click'))
	await fetch("https://visao.anatel.gov.br/MSM/ScriptHandler.ashx?method=GetWorklist&classPath=%2FMSM%2FAjax%2FAjaxService.asmx&classMode=undefined", {
	    "credentials": "include",
	    "headers": {
	        "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:102.0) Gecko/20100101 Firefox/102.0",
	        "Accept": "application/json, text/javascript, */*",
	        "Accept-Language": "en-US,en;q=0.5",
	        "Content-Type": "application/x-www-form-urlencoded",
	        "X-Requested-With": "XMLHttpRequest",
	        "Sec-Fetch-Dest": "empty",
	        "Sec-Fetch-Mode": "cors",
	        "Sec-Fetch-Site": "same-origin"
	    },
	    "referrer": "https://visao.anatel.gov.br/MSM/default.aspx",
	    "body": "numberOfRequests=5",
	    "method": "POST",
	    "mode": "cors"
	});
}, 60000)


/* ********************************
*	Tela de login
***********************************/
let txt_mfa = document.getElementById('txtSecurityCode')
console.debug(txt_mfa)
if (txt_mfa !== null) txt_mfa.focus()


/* ********************************
*	Consulta do chamado
***********************************/
let txt_chamado = document.getElementById('ctl00_cph_requestNumber')

if (txt_chamado !== null ){
	let btn_chamado_add = document.createElement('a')
	btn_chamado_add.setAttribute('title','Adicionar ao PGD')
	// btn_chamado_add.setAttribute('value','PGD')
	// btn_chamado_add.textContent = 'PGD'
	// btn_chamado_add.setAttribute('type','button')
	btn_chamado_add.setAttribute('href','#')
	btn_chamado_add.setAttribute("class", "icon icon-add")
	// btn_chamado_add.setAttribute("style", "width:auto; height:30px")
	txt_chamado.parentElement.append(btn_chamado_add)

	btn_chamado_add.addEventListener('click', function(){
		browser.runtime.sendMessage({
        	command: "marval_adicionar_chamado_pgd",
        	numero: txt_chamado.value,
        	contato: document.getElementById('ctl00_cph_contact_name').value,
        	assunto: document.getElementById('ctl00_cph_description').value,
      	}
      );
	})
}