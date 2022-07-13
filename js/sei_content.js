console.log("SEI CONTENT")

// tem que colocar no content do plugin, pq a função não será injetada
// usado ao menos para obter os códigos e colocar na planilha que gera o JSON de atividades no meu formulário de inclusão do plugin.
function importarAtividades(){
    $("div#divInfraAreaTabela.infraAreaTabela table.infraTable tbody tr.infraTrClara, div#divInfraAreaTabela.infraAreaTabela table.infraTable tbody  tr.infraTrEscura").each(function(i,e){
        
        var codigo = e.querySelector("td input[type='checkbox']").value
        var atividade = e.querySelectorAll("td")[1].textContent
        var desc = e.querySelectorAll("td")[2].textContent
        var duracao = e.querySelectorAll("td")[4].textContent
        
        console.log(codigo+";"+atividade)
    });
}

// document.body.style.border = "5px solid red";

// let frame = document.querySelector("iframe#ifrVisualizacao").contentWindow.document.body
// let div = frame.querySelector("#divInfraBarraComandosSuperior")
// frame.querySelector("#btnIniciarTriagem").textContent="TESTE!!"


// var div = document.querySelector("#divInfraBarraComandosSuperior")
// var btn = document.createElement("button")
// btn.setAttribute("type", "button")
// btn.appendChild(document.createTextNode("TESTE"))
// div.appendChild(btn)

// setTimeout(function(){
//     console.debug("testando timeout")
//     document.querySelector("#btnIniciarTriagem").textContent="TESTE yeah"
//     console.debug("testando " + document.querySelector("#btnIniciarTriagem"))
// }, 700)

document.querySelector("iframe#ifrVisualizacao")

document.addEventListener("DOMContentLoaded", function(event) { 

    

    // if (document.querySelector("#divInfraBarraLocalizacao").textContent.indexOf("Atividades") > 0){
    //     console.log("Página das atividades")

    //     var div = document.querySelector("#divInfraBarraLocalizacao")
    //     var btn = document.createElement("button")
    //     btn.setAttribute("type", "button")
    //     btn.setAttribute("click", "importarAtividades()")
    //     btn.appendChild(document.createTextNode("Importar Atividades"))
    //     // btn.addEventListener("click", importarAtividades, false)
    //     div.appendChild(btn)
    // }
});
