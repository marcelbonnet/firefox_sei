
/*
Compila o relatório dos devedores
*/
function compilar(){
	let lista = []
	let limite = 80
	let nodes = document.querySelector("#b17-Content > div").querySelectorAll(".list-item")
	for(i=0; i<nodes.length; i++){
		nome = nodes[i].querySelector(".list-item-content-title").textContent
		percentual = nodes[i].querySelector(".OSFillParent").textContent.replace(",",".").replace("%","")
		if(percentual < limite){
			lista.push({
				nome:nome,
				feito:percentual,
				limite:`${limite}`
			})
		}

	}
	console.debug(lista)
	return lista
}


// substring( triggerOutputs()?['body/body'] , indexOf( triggerOutputs()?['body/body'] ,'['), length( triggerOutputs()?['body/body'] ) - indexOf( triggerOutputs()?['body/body'] ,'['))

// substring( triggerBody() , indexOf( triggerBody() ,'\['), length( triggerBody() ) - indexOf( triggerBody() ,'\['))

// substring( triggerBody() , indexOf( triggerBody() ,'\[') )

// substring( string(triggerBody()) , indexOf( string(triggerBody()) ,'__INI__'), length(triggerBody()?['body'])-indexOf( string(triggerBody()) ,'__FIM__') )

// substring(string(triggerBody()?['body']),indexOf(string(triggerBody()?['body']),'__INI__'),length(triggerBody()?['body'])-lastIndexOf(string(triggerBody()?['body']),'__FIM__'))
// substring(string(triggerBody()?['body']),indexOf(string(triggerBody()?['body']),'__INI__'), 514 )

// substring(string(triggerBody()?['body']),indexOf(string(triggerBody()?['body']),'__INI__'),length(triggerBody()?['body'])-lastIndexOf(string(triggerBody()?['body']),'__FIM__'))

// split(triggerBody()?['body'],'__SEPARADOR__')?[1]


// Aguarda um tempo para a montagem do DOM se concretizar.
setTimeout(function(){
	console.debug("====> PLUGIN NOTIFICAÇÃO DE DEVEDORES DOS POSTOS DE TRABALHO INICIADO.")
	let div = document.getElementById("b17-Title")
	console.debug(`postos ${div.textContent}`)

	if (div !== null){
		console.debug("Preparando o link dos devedores...")
		let link_notificar = document.createElement('a')
		link_notificar.textContent = "Notificar Devedores"
		
		console.debug(`Relatório ${compilar()}`)
		// let corpo = encodeURI(JSON.stringify(compilar()))
		let corpo = encodeURI('__SEPARADOR__'+JSON.stringify(compilar())+'__SEPARADOR__')
		console.debug(corpo)
		let assunto = encodeURI("#diariomatic")
		console.debug(assunto)
		link_notificar.setAttribute('href',`mailto:marcelbonnet@anatel.gov.br?subject=${assunto}&body=${corpo}` )
		
		let par = document.createElement("p")
		par.setAttribute("style", "background-color: yellow")
		par.append(link_notificar)
		div.append(par)
		console.debug(`teste ${div.textContent}`)
	}
}, 5000);


