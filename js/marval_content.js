// Adiciona elementos na página do Marval

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