
// ===========================================
// BANCO DE DADOS
// ===========================================

const DB_NAME = 'pgd';
const DB_VERSION = 1; // Use a long long for this value (don't use a float)

var db;

function openDb() {
  console.log("openDb ...");
  var req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onsuccess = function (evt) {
    // Equal to: db = req.result;
    db = this.result;
    console.log("openDb DONE");
  };
  req.onerror = function (evt) {
    console.error("openDb:", evt.target.errorCode);
  };

  req.onupgradeneeded = function (evt) {
    console.log("openDb.onupgradeneeded");

    var store = evt.currentTarget.result.createObjectStore(
      "pgd_atividades", { keyPath: 'id', autoIncrement: true });
    store.createIndex('ativ_area', ['area', 'atividade'], { unique: true });
    store.createIndex('ativ_descricao', 'descricao', { unique: false });
    store.createIndex('ativ_sub_atividades', 'sub_atividades', { unique: false });
    store.createIndex('ativ_duracao', 'duracao', { unique: false });
    

    var store = evt.currentTarget.result.createObjectStore(
      "eventos", { keyPath: 'id', autoIncrement: true });
    store.createIndex('data_ini', 'data_ini', { unique: false });
    store.createIndex('data_fim', 'data_fim', { unique: false });
    store.createIndex('recorrencia', 'recorrencia', { unique: false });
    store.createIndex('encerramento', 'encerramento', { unique: false });
    store.createIndex('atividade', 'atividade', { unique: false });
    store.createIndex('sub_atividade', 'sub_atividade', { unique: false });
    store.createIndex('duracao_evento', 'duracao', { unique: false });
    store.createIndex('duracao_minutos_evento', 'duracao_minutos', { unique: false });
    store.createIndex('descricao', 'descricao', { unique: false });
    store.createIndex('num_sei', 'num_sei', { unique: false });

    var store = evt.currentTarget.result.createObjectStore(
      "diario", { keyPath: 'id', autoIncrement: true });
    store.createIndex('data_ini_diario', 'data_ini', { unique: false });
    store.createIndex('data_fim_diario', 'data_fim', { unique: false });
    store.createIndex('atividade_diario', 'atividade', { unique: false });
    store.createIndex('atividade_nome_diario', 'atividade_nome', { unique: false });
    store.createIndex('sub_atividade_diario', 'sub_atividade', { unique: false });
    store.createIndex('duracao_diario', 'duracao', { unique: false });
    store.createIndex('duracao_minutos_diario', 'duracao_minutos', { unique: false });
    store.createIndex('descricao_diario', 'descricao', { unique: false });
    store.createIndex('num_sei_diario', 'num_sei', { unique: false });

  };//req

  // var reqv2 = indexedDB.open("pgd", 2);
  // reqv2.onsuccess = function (evt) {
  //   console.log("Abrindo versão 2");
  // };
  // reqv2.onerror = function (evt) {
  //   console.error("versão 2:", evt.target.errorCode);
  // };
  // reqv2.onupgradeneeded = function (evt) {
  //   console.log("Versão 2: onupgradeneeded");

  //   var store = evt.target.transaction.objectStore("diario")
  //   if(!store.indexNames.contains('atividade_nome_diario')){
  //     store.createIndex('atividade_nome_diario', 'atividade_nome', {unique:false})
  //   }
    
  // };//reqv2


}

/**
 * @param {string} store_name
 * @param {string} mode either "readonly" or "readwrite"
 */
function getObjectStore(store_name, mode) {
  var tx = db.transaction(store_name, mode);
  return tx.objectStore(store_name);
}



// TODO fazer um select genérico + equivalente do SQL WHERE
// essa função está uma bosta, com lixo para remover
function dbSelect(table/*, callback*/) {
  store = getObjectStore(table, 'readonly');

  var req;
  req = store.count();
  req.onsuccess = function(evt) {
    console.log('count: ' + evt.target.result);
  };
  req.onerror = function(evt) {
    console.error("", this.error);
  };

  var i = 0;
  req = store.openCursor();

  req.onsuccess = function(evt) {
  // var resultado = function(evt) {
    var cursor = evt.target.result;
    var res = []

    // If the cursor is pointing at something, ask for the data
    if (cursor) {
      req = store.get(cursor.key);
      req.onsuccess = function (evt) {
        var value = evt.target.result;
        // console.log(value)
        res.push(value)
      };

      // Move on to the next object in store
      cursor.continue();

      // This counter serves only to create distinct ids
      i++;
    } else {
      console.log("No more entries");
    }
    // callback(res)
    // return res;
  };
  // return await req;
}



function listarTiposTarefas() {
  console.log("listarTiposTarefas...")
  store = getObjectStore(DB_TIPOS_TAREFAS, 'readonly');

  var req;
  req = store.count();
  req.onsuccess = function(evt) {
    console.log('Tipos de Tarefas: ' + evt.target.result);
  };
  req.onerror = function(evt) {
    console.error("Error ao listar tipos de tarefas", this.error);
  };

  var i = 0;
  req = store.openCursor();
  req.onsuccess = function(evt) {
    var cursor = evt.target.result;

    // If the cursor is pointing at something, ask for the data
    if (cursor) {
      req = store.get(cursor.key);
      req.onsuccess = function (evt) {
        var value = evt.target.result;

        console.log("SELECT: " + cursor.key + " Cod: " + value.codigo + " Ativ: " + value.atividade + " Minutos: " + value.minutos )
      };

      // Move on to the next object in store
      cursor.continue();

      // This counter serves only to create distinct ids
      i++;
    } else {
      console.log("No more entries");
    }
  };
}


// ===========================================
// BACKGROUND EM GERAL
// ===========================================


// CONTEXT MENU

//var dontInvertState = false;

function onCreated() {
  if (browser.runtime.lastError) {
    console.error(`Error: ${browser.runtime.lastError}`);
  }
}

/*
MENU ITENS
*/

browser.contextMenus.create({
  id: "pgd-import",
  title: "Incluir Matriz SGI",
  //type: "checkbox",
  contexts: ["all"],
  //checked : dontInvertState
}, onCreated);

browser.contextMenus.create({
  id: "pgd-carga-teste",
  title: "Incluir recorrentes de teste",
  contexts: ["all"],
}, onCreated);

browser.contextMenus.create({
  id: "pgd-carga-diario-teste",
  title: "Incluir diário de teste",
  contexts: ["all"],
}, onCreated);



/*
LISTENER
*/
browser.contextMenus.onClicked.addListener(function(data, tab) {
  switch (data.menuItemId) {
    case "pgd-import":
        // addTipoTarefa("995_S_15_Muito Baixa", "Atividades Comuns - Participar de reuniões e similares (Muito Baixa)", "Reuniões bla bla bla", 15)
        // addTipoTarefa("996_S_30_Baixa", "Atividades Comuns - Participar de reuniões e similares (Baixa)", "Reuniões bla bla bla", 30)
        inserirPgdGIDS()
        break;
    case "pgd-carga-teste":
        inserirDadosRecorrentesDeTeste()
        break;
    case "pgd-carga-diario-teste":
        inserirDiarioDeTeste()
        break;
  }
});

function browserAction(){
    getConfig().then(function(o){
        o.config.estado = !o.config.estado;
        // updateIcon(o.config.estado);
        // browser.storage.local.set(o); inverterCores();
        console.log(o);
    });
}

function onUpdated(){
    browser.storage.local.get("start").then((o) => {
        if(o.state === undefined)
            o.state = false;
        // updateIcon(o.config.estado);
        console.log("onUpdate chamado. Estado é " + o.state);
        // inverterCores(o.state);
    });
}

//browser.tabs.onUpdated.addListener(inverterCores);

// Fired when a browser action icon is clicked. This event will not fire if the browser action has a popup.
// browser.browserAction.onClicked.addListener(function(){
//     console.log("clicou")
// });

console.log("INICIADO")
openDb();
console.log("PASSOU")

browser.runtime.onMessage.addListener( async(request, sender, sendResponse) => 
{
    if(request.cmd === "listarTiposTarefas"){
        // debugger
        listarTiposTarefas()
    }
    if (request.cmd === "db_select"){
      // myPromise = new Promise((resolve, reject) => {
        var cursor = dbSelect(request.table, (res)=>{console.debug("CAZZO res2 " + res.length )})
        // var cursor = dbSelect(request.table)
        // cursor.then((a)=>{
        //   console.debug(a)
        //   console.debug("A " + a.length)
        // });
        
      //   resolve(cursor)
      // });
      // return myPromise
      return Promise.resolve("caralho")
      // return await cursor;
      // sendResponse({cursor: cursor })
    }
});


function inserirPgdGIDS(){
  var atividades = [
    ["Atividades Comuns - Atuar como Product Owner/Gestor de Solução de TI", "Administrar, conceber, planejar, discutir, acompanhar, avaliar, testar, homologar e demandar desenvolvimento."],
    ["Atividades Comuns - Atuar na proposição e aprovação de políticas, normativos e processos", "Planejar, elaborar, apresentar e obter aprovação de políticas, diretrizes, normativos e processos relacionados à Governança de TI, SIC, Sistemas, dados e Biblioteca."],
    ["Atividades Comuns - Elaborar, analisar e revisar arquivos, documentos ou demandas", "Elaborar, atualizar, analisar, revisar, ajustar conteúdo de processos, arquivos, estudos, projetos, planilhas (preços, custos, memórias de cálculo, etc), documentos (Memo, Ofício,etc), material (apresentações, dashboards, imagens e texto)."],
    ["Atividades Comuns - Elaborar, analisar, revisar ou levantar informações para planejamento", "Elaborar, analisar, revisar ou levantar informações para planejamento (ex. ações de governança, capacitação, pessoal, material, orçamento, contratações, metas, outros)"],
    ["Atividades Comuns - Gerir e Fiscalizar Contratos", "Demandar, acompanhar, inspecionar, avaliar, reportar, notificar, pagar, atestar, receber, planejar, prorrogar e autuar sanção."],
    ["Atividades Comuns - Gerir Solução e Ferramenta de TI", "Gerir, manter, operar, configurar e executar ações em ativos, solução, ferramentas, ambiente computacional ou Telefonia."],
    ["Atividades Comuns - Levantar informações e subsídios", "Elaborar levantamento de necessidades/dados, compilação de informações e fornecer subsídios para respostas."],
    ["Atividades Comuns - Participar de reuniões e similares", "Participar de reuniões e similares (reuniões, audiências, eventos, sessão pública, orientações, etc.)"],
    ["Atividades Comuns - Pesquisar ou estudar assunto", "Realizar pesquisas, estudos ou capacitação (de preço, sobre legislação e normativos, manuais, documentos técnicos ou bibliografia especializada, assuntos diversos...)"],
    ["Atividades Comuns - Realizar Contratação e Prorrogação", "Elaborar/revisar documentos de contratação/prorrogação de contratos, responder Pareceres da PFE, analisar/responder questionamentos relacionados à contratação."],
    ["Atividades Comuns - Receber, distribuir e acompanhar demandas", "Receber, analisar, distribuir processos/documentos/e-mails. Conferir documentos e itens necessários a outros encaminhamentos."],
    ["Atividades Comuns - Tratar demandas gerais", "Tratar demandas por e-mail, telefone, whatsapp, teams, tratativas online ou presenciais, etc. Cadastrar dados em sistemas e outros formulários eletrônicos."],
    ["Dados - Apoiar Governança de Dados", "Suportar, discutir, facilitar, garantir, acompanhar e executar o atendimento de demandas das áreas, das Curadorias de Dados e do Fórum Permanente de Dados."],
    ["Dados - Atender Demanda de Solução de Dados", "Planejar, discutir, desenvolver, testar, implantar, atualizar, evoluir e acompanhar ações de desenvolvimento, atualização, evolução e teste de solução de dados."],
    ["Dados - Garantir Conformidade e Demanda Externa", "Atender, acompanhar, suportar, pesquisar, discutir e implantar demandas relativas à Lei de Acesso à Informação, Lei Geral de Proteção de Dados e outras normas afetas a dados."],
    ["Documento - Reclassificar Arquivo e Destinação Documental", "Tratar arquivo e realizar destinação, especialmente eliminação de documentos e processos em suporte físico cujo tempo de guarda tenha expirado e cuja destinação final seja a eliminação."],
    ["Infraestrutura de TI - Atender ou acompanhar atendimento de demandas", "Atender ou acompanhar atendimento de demanda de infraestrutura de TI / Telefonia"],
    ["Infraestrutura de TI - Desativar ou acompanhar desativação de solução", "Desativar ou acompanhar desativação de ativo, solução ou ambiente computacional de TI / Telefonia"],
    ["Infraestrutura de TI - Investigar ou apoiar investigação de incidente", "Investigar ou apoiar investigação de incidente de TI / Telefonia"],
    ["Infraestrutura de TI - Planejar, implantar ou acompanhar implantação de solução", "Planejar, implantar, atualizar, evoluir, testar, acompanhar ações de implantação, atualização, evolução e teste de ativo, solução ou ambiente computacional de TI / Telefonia"],
    ["Ocorrência - Atestado de Comparecimento", "Registro de atestado de comparecimento em atendimento ao disposto na Nota Técnica SEI nº 11710/2021/ME."],
    ["Ocorrência - Participar de Capacitação", "Participar de capacitações previamente acordada com a chefia"],
    ["Protocolo - Autenticar Documentos Digitalizados", "Autenticar administrativamente digitalizações de documentos, por meio dos documentos originais apresentados no Protocolo Sede."],
    ["Protocolo - Interagir com responsáveis pelos Protocolos nos Estados", "Interagir com os responsáveis pelos Protocolos da Anatel nos Estados na resolução de dúvidas e questões que envolvam a protocolização de documentos na Anatel."],
    ["Sistemas - Atender demandas de sistema", "Realizar e/ou acompanhar atendimento de demandas no Visão, SGDTI, ou outra ferramenta de gestão de demandas de sistemas"],
    ["Sistemas - Desativar Sistemas", "Realizar procedimentos administrativos (atualizar ferramentas: Visão, SGDTI, lista de PO e sistemas) e operacionais (desativar links, versionar códigos no GIT, etc) para desativação de sistema"],
    ["Sistemas - Desenvolver Solução", "Desenvolver nova solução / serviço, manter solução / serviço, gerar e/ou executar scripts de banco de dados, etc."],
    ["Sistemas - Gerir operações e arquitetura", "Configurar, publicar e acompanhar o ciclo de vida dos serviços na ferramenta de gestão, deploy (ambiente HM, lojas de APP,etc), conceder acesso às ferramentas de desenvolvimento, etc"],
    ["Sistemas - Investigar Erro", "Investigar ou apoiar a investigação de erro de sistema, de bug de aplicação"]
  ];

  var sub_atividades = [
    ["Solicitação de Manutenção de Sistema de TI (SMTI)","Solicitação de Solução de TI (SSTI)","Chamado aberto","Solicitação de Solução de Dados (SS-Dados)","Termo de Cancelamento de Documento","Gestão de Solução ou Ativo de TI realizada","Gestão de Estória de Usuário realizada","Participação em Reunião ou similares","",,,,,,,,,,,,,,,,,,,],
    ["Memorando","Arquivo","Participação em Reunião ou similares","Atendimento ou tratativas realizadas","Dashboard","Manual, Procedimento, Metodologia ou Processo","Ofício","Despacho Decisório","Despacho Ordinatório","Matéria para Apreciação do Conselho Diretor","Minuta de Resolução Interna","Minuta de Portaria","Portaria","Informe","Memorando-Circular","Anexo","Termo de Cancelamento de Documento","",,,,,,,,,,],
    ["Memorando","Ofício","Parecer","Despacho Ordinatório","Informe","Relatório de Atividades","Registro de Reunião","Memorando-Circular","Anexo","Relatório de Viagem a Serviço","Comunicado","Termo de Cancelamento de Documento","Arquivo","Dashboard","Relato de Atividade","Manual, Procedimento, Metodologia ou Processo","Atendimento ou tratativas realizadas","Acompanhamento realizado","Folha de Ponto Mensal","",,,,,,,,],
    ["Memorando","Memorando-Circular","Informe","Despacho Decisório","Despacho Ordinatório","Anexo","Termo de Cancelamento de Documento","Arquivo","Relato de Atividade","Manual, Procedimento, Metodologia ou Processo","Atendimento ou tratativas realizadas","Participação em Reunião ou similares","",,,,,,,,,,,,,,,],
    ["Arquivo","Chamado aberto","Relato de Atividade","Atendimento ou tratativas realizadas","Participação em Reunião ou similares","Informe","Despacho Ordinatório","Ofício","Memorando","Registro de Reunião","Anexo","Atesto de Documento de Cobrança","Relatório de Acompanhamento da Execução Contratual","Relatório Fiscalização de Mão de Obra","Comunicado","Termo de Cancelamento de Documento","Requisição","Parecer","Dossiê","",,,,,,,,],
    ["Gestão de Solução ou Ativo de TI realizada","Gestão de Acesso realizada","Chamado aberto","Acompanhamento realizado","Atendimento ou tratativas realizadas","Participação em Reunião ou similares","",,,,,,,,,,,,,,,,,,,,,],
    ["Arquivo","Relato de Atividade","Atendimento ou tratativas realizadas","Participação em Reunião ou similares","",,,,,,,,,,,,,,,,,,,,,,,],
    ["Participação em Reunião ou similares","",,,,,,,,,,,,,,,,,,,,,,,,,,],
    ["Pesquisa ou Estudo realizado","Participação em Reunião ou similares","",,,,,,,,,,,,,,,,,,,,,,,,,],
    ["Arquivo","Atendimento ou tratativas realizadas","Participação em Reunião ou similares","Acompanhamento realizado","Documento de Oficialização de Demanda de TI (DOD)","Estudo Técnico Preliminar da Contratação de TI","Minuta de Termo de Referência","Termo de Referência","Informe","Mapa de Riscos da Contratação","Requisição","Despacho Ordinatório","Despacho Decisório","Memorando","Ofício","Termo de Recebimento Provisório","Termo de Recebimento Definitivo","Registro de Reunião","Minuta de Portaria de Pessoal","Portaria de Pessoal","Projeto Básico","Termo de Comprom. Manutenção de Sigilo em Contrato","Termo de Ciência de Manutenção de Sigilo","Termo de Responsabilidade para Acesso à TI-Anatel","Minuta de Ordem de Serviço/Fornecimento de Bens","Termo de Cancelamento de Documento","Dossiê","Planilha"],
    ["Demanda recebida, analisada ou distribuída","Acompanhamento realizado","Relato de Atividade","Atendimento ou tratativas realizadas","",,,,,,,,,,,,,,,,,,,,,,,],
    ["Cadastro realizado","Atendimento ou tratativas realizadas","",,,,,,,,,,,,,,,,,,,,,,,,,],
    ["Acompanhamento realizado","Arquivo","Atendimento ou tratativas realizadas","Cadastro realizado","Chamado aberto","Dashboard","Demanda recebida, analisada ou distribuída","Deploy realizado","Gestão de Acesso realizada","Gestão de Estória de Usuário realizada","Gestão de Solução ou Ativo de TI realizada","Manual, Procedimento, Metodologia ou Processo","Participação em Reunião ou similares","Pesquisa ou Estudo realizado","Relato de Atividade","Memorando","Memorando-Circular","Informe","Despacho Ordinatório","Despacho Decisório","Registro de Reunião","Termo de Cancelamento de Documento","Ofício","Solicitação de Manutenção de Sistema de TI (SMTI)","Solicitação de Solução de TI (SSTI)","Solicitação de Solução de Dados (SS-Dados)","",],
    ["Acompanhamento realizado","Arquivo","Atendimento ou tratativas realizadas","Cadastro realizado","Chamado aberto","Dashboard","Demanda recebida, analisada ou distribuída","Deploy realizado","Gestão de Acesso realizada","Gestão de Estória de Usuário realizada","Gestão de Solução ou Ativo de TI realizada","Manual, Procedimento, Metodologia ou Processo","Participação em Reunião ou similares","Pesquisa ou Estudo realizado","Relato de Atividade","Memorando","Memorando-Circular","Informe","Despacho Ordinatório","Despacho Decisório","Registro de Reunião","Termo de Cancelamento de Documento","Ofício","Solicitação de Manutenção de Sistema de TI (SMTI)","Solicitação de Solução de TI (SSTI)","Solicitação de Solução de Dados (SS-Dados)","",],
    ["Acompanhamento realizado","Arquivo","Atendimento ou tratativas realizadas","Cadastro realizado","Chamado aberto","Dashboard","Demanda recebida, analisada ou distribuída","Deploy realizado","Gestão de Acesso realizada","Gestão de Estória de Usuário realizada","Gestão de Solução ou Ativo de TI realizada","Manual, Procedimento, Metodologia ou Processo","Participação em Reunião ou similares","Pesquisa ou Estudo realizado","Relato de Atividade","Memorando","Memorando-Circular","Informe","Despacho Ordinatório","Despacho Decisório","Registro de Reunião","Termo de Cancelamento de Documento","Ofício","Solicitação de Manutenção de Sistema de TI (SMTI)","Solicitação de Solução de TI (SSTI)","Solicitação de Solução de Dados (SS-Dados)","",],
    ["Acompanhamento realizado","Arquivo","Atendimento ou tratativas realizadas","Cadastro realizado","Chamado aberto","Dashboard","Demanda recebida, analisada ou distribuída","Deploy realizado","Gestão de Acesso realizada","Gestão de Estória de Usuário realizada","Gestão de Solução ou Ativo de TI realizada","Manual, Procedimento, Metodologia ou Processo","Participação em Reunião ou similares","Pesquisa ou Estudo realizado","Relato de Atividade","Memorando","Memorando-Circular","Informe","Despacho Ordinatório","Despacho Decisório","Registro de Reunião","Termo de Cancelamento de Documento","Ofício","Listagem de Eliminação de Documentos","Edital de Ciência de Eliminação de Documentos","Termo de Eliminação de Documentos","Lista","Planilha"],
    ["Atendimento ou tratativas realizadas","Acompanhamento realizado","Arquivo","Relato de Atividade","Chamado aberto","Cadastro realizado","Gestão de Acesso realizada","Gestão de Solução ou Ativo de TI realizada","Participação em Reunião ou similares","Deploy realizado","Dashboard","Demanda recebida, analisada ou distribuída","Comunicado","Informe","Memorando","Memorando-Circular","Ofício","Termo de Cancelamento de Documento","Correspondência Eletrônica","",,,,,,,,],
    ["Atendimento ou tratativas realizadas","Acompanhamento realizado","Arquivo","Relato de Atividade","Chamado aberto","Cadastro realizado","Gestão de Acesso realizada","Gestão de Solução ou Ativo de TI realizada","Participação em Reunião ou similares","Deploy realizado","Dashboard","Demanda recebida, analisada ou distribuída","Comunicado","Informe","Memorando","Memorando-Circular","Ofício","Termo de Cancelamento de Documento","",,,,,,,,,],
    ["Atendimento ou tratativas realizadas","Acompanhamento realizado","Arquivo","Relato de Atividade","Chamado aberto","Cadastro realizado","Gestão de Acesso realizada","Gestão de Solução ou Ativo de TI realizada","Participação em Reunião ou similares","Deploy realizado","Dashboard","Demanda recebida, analisada ou distribuída","Comunicado","Informe","Memorando","Memorando-Circular","Ofício","Termo de Cancelamento de Documento","",,,,,,,,,],
    ["Atendimento ou tratativas realizadas","Acompanhamento realizado","Arquivo","Relato de Atividade","Chamado aberto","Cadastro realizado","Gestão de Acesso realizada","Gestão de Solução ou Ativo de TI realizada","Participação em Reunião ou similares","Deploy realizado","Dashboard","Demanda recebida, analisada ou distribuída","Comunicado","Memorando","Memorando-Circular","Informe","Ofício","Termo de Cancelamento de Documento","",,,,,,,,,],
    [,,,,,,,,,,,,,,,,,,,,,,,,,,,],
    ["Capacitação Realizada","",,,,,,,,,,,,,,,,,,,,,,,,,,],
    ["Acompanhamento realizado","Arquivo","Atendimento ou tratativas realizadas","Cadastro realizado","Chamado aberto","Dashboard","Demanda recebida, analisada ou distribuída","Deploy realizado","Gestão de Acesso realizada","Gestão de Estória de Usuário realizada","Gestão de Solução ou Ativo de TI realizada","Manual, Procedimento, Metodologia ou Processo","Participação em Reunião ou similares","Pesquisa ou Estudo realizado","Relato de Atividade","Memorando","Memorando-Circular","Informe","Despacho Ordinatório","Despacho Decisório","Registro de Reunião","Termo de Cancelamento de Documento","Ofício","Dossiê","",,,],
    ["Acompanhamento realizado","Arquivo","Atendimento ou tratativas realizadas","Cadastro realizado","Chamado aberto","Dashboard","Demanda recebida, analisada ou distribuída","Deploy realizado","Gestão de Acesso realizada","Gestão de Estória de Usuário realizada","Gestão de Solução ou Ativo de TI realizada","Manual, Procedimento, Metodologia ou Processo","Participação em Reunião ou similares","Pesquisa ou Estudo realizado","Relato de Atividade","Memorando","Memorando-Circular","Informe","Despacho Ordinatório","Despacho Decisório","Registro de Reunião","Termo de Cancelamento de Documento","",,,,,],
    ["Acompanhamento realizado","Atendimento ou tratativas realizadas","Gestão de Estória de Usuário realizada","Gestão de Solução ou Ativo de TI realizada","Gestão de Acesso realizada","Chamado aberto","Cadastro realizado","Arquivo","Deploy realizado","Relato de Atividade","Dashboard",,"",,,,,,,,,,,,,,,],
    ["Atendimento ou tratativas realizadas","Acompanhamento realizado","Gestão de Solução ou Ativo de TI realizada","Chamado aberto","Gestão de Acesso realizada","Cadastro realizado","Arquivo","",,,,,,,,,,,,,,,,,,,,],
    ["Relato de Atividade","Chamado aberto","Cadastro realizado","Deploy realizado","Participação em Reunião ou similares","Gestão de Estória de Usuário realizada","",,,,,,,,,,,,,,,,,,,,,],
    ["Gestão de Webservice realizada","Gestão de Acesso realizada","Chamado aberto","Gestão de Solução ou Ativo de TI realizada","Deploy realizado","Relato de Atividade","Participação em Reunião ou similares","Atendimento ou tratativas realizadas","Acompanhamento realizado","Arquivo","",,,,,,,,,,,,,,,,,],
    ["Relato de Atividade","",,,,,,,,,,,,,,,,,,,,,,,,,,],
  ];

  var duracao = [
    ["950_S_15_Muito Baixa","15","Atividades Comuns - Atuar como Product Owner/Gestor de Solução de TI"],
    ["951_S_30_Baixa","30","Atividades Comuns - Atuar como Product Owner/Gestor de Solução de TI"],
    ["952_S_45_Média","45","Atividades Comuns - Atuar como Product Owner/Gestor de Solução de TI"],
    ["953_S_60_Alta","60","Atividades Comuns - Atuar como Product Owner/Gestor de Solução de TI"],
    ["954_S_120_Muito Alta","120","Atividades Comuns - Atuar como Product Owner/Gestor de Solução de TI"],
    ["955_S_240_Especial","240","Atividades Comuns - Atuar como Product Owner/Gestor de Solução de TI"],
    ["956_S_60_Muito Baixa","60","Atividades Comuns - Atuar na proposição e aprovação de políticas, normativos e processos"],
    ["957_S_90_Baixa","90","Atividades Comuns - Atuar na proposição e aprovação de políticas, normativos e processos"],
    ["958_S_120_Média","120","Atividades Comuns - Atuar na proposição e aprovação de políticas, normativos e processos"],
    ["959_S_150_Alta","150","Atividades Comuns - Atuar na proposição e aprovação de políticas, normativos e processos"],
    ["960_S_180_Muito Alta","180","Atividades Comuns - Atuar na proposição e aprovação de políticas, normativos e processos"],
    ["961_S_240_Especial","240","Atividades Comuns - Atuar na proposição e aprovação de políticas, normativos e processos"],
    ["962_S_15_Muito Baixa","15","Atividades Comuns - Elaborar, analisar e revisar arquivos, documentos ou demandas"],
    ["963_S_30_Baixa","30","Atividades Comuns - Elaborar, analisar e revisar arquivos, documentos ou demandas"],
    ["964_S_60_Média","60","Atividades Comuns - Elaborar, analisar e revisar arquivos, documentos ou demandas"],
    ["965_S_120_Alta","120","Atividades Comuns - Elaborar, analisar e revisar arquivos, documentos ou demandas"],
    ["966_S_240_Muito Alta","240","Atividades Comuns - Elaborar, analisar e revisar arquivos, documentos ou demandas"],
    ["967_S_480_Especial","480","Atividades Comuns - Elaborar, analisar e revisar arquivos, documentos ou demandas"],
    ["968_S_30_Muito Baixa","30","Atividades Comuns - Elaborar, analisar, revisar ou levantar informações para planejamento"],
    ["969_S_60_Baixa","60","Atividades Comuns - Elaborar, analisar, revisar ou levantar informações para planejamento"],
    ["970_S_120_Média","120","Atividades Comuns - Elaborar, analisar, revisar ou levantar informações para planejamento"],
    ["971_S_180_Alta","180","Atividades Comuns - Elaborar, analisar, revisar ou levantar informações para planejamento"],
    ["972_S_240_Muito Alta","240","Atividades Comuns - Elaborar, analisar, revisar ou levantar informações para planejamento"],
    ["973_S_480_Especial","480","Atividades Comuns - Elaborar, analisar, revisar ou levantar informações para planejamento"],
    ["974_S_15_Muito Baixa","15","Atividades Comuns - Gerir e Fiscalizar Contratos"],
    ["975_S_30_Baixa","30","Atividades Comuns - Gerir e Fiscalizar Contratos"],
    ["976_S_45_Média","45","Atividades Comuns - Gerir e Fiscalizar Contratos"],
    ["977_S_60_Alta","60","Atividades Comuns - Gerir e Fiscalizar Contratos"],
    ["978_S_120_Muito Alta","120","Atividades Comuns - Gerir e Fiscalizar Contratos"],
    ["979_S_240_Especial","240","Atividades Comuns - Gerir e Fiscalizar Contratos"],
    ["980_S_30_Baixa","30","Atividades Comuns - Gerir Solução e Ferramenta de TI"],
    ["981_S_60_Média","60","Atividades Comuns - Gerir Solução e Ferramenta de TI"],
    ["982_S_120_Alta","120","Atividades Comuns - Gerir Solução e Ferramenta de TI"],
    ["4747_S_15_Muito Baixa","15","Atividades Comuns - Gerir Solução e Ferramenta de TI"],
    ["4748_S_240_Muito Alta","240","Atividades Comuns - Gerir Solução e Ferramenta de TI"],
    ["4749_S_480_Especial","480","Atividades Comuns - Gerir Solução e Ferramenta de TI"],
    ["983_S_30_Muito Baixa","30","Atividades Comuns - Levantar informações e subsídios"],
    ["984_S_60_Baixa","60","Atividades Comuns - Levantar informações e subsídios"],
    ["985_S_120_Média","120","Atividades Comuns - Levantar informações e subsídios"],
    ["986_S_180_Alta","180","Atividades Comuns - Levantar informações e subsídios"],
    ["987_S_240_Muito Alta","240","Atividades Comuns - Levantar informações e subsídios"],
    ["988_S_300_Especial","300","Atividades Comuns - Levantar informações e subsídios"],
    ["995_S_15_Muito Baixa","15","Atividades Comuns - Participar de reuniões e similares"],
    ["996_S_30_Baixa","30","Atividades Comuns - Participar de reuniões e similares"],
    ["997_S_60_Média","60","Atividades Comuns - Participar de reuniões e similares"],
    ["998_S_90_Alta","90","Atividades Comuns - Participar de reuniões e similares"],
    ["999_S_120_Muito Alta","120","Atividades Comuns - Participar de reuniões e similares"],
    ["1000_S_360_Especial","360","Atividades Comuns - Participar de reuniões e similares"],
    ["1001_S_30_Muito Baixa","30","Atividades Comuns - Pesquisar ou estudar assunto"],
    ["1002_S_60_Baixa","60","Atividades Comuns - Pesquisar ou estudar assunto"],
    ["1003_S_120_Média","120","Atividades Comuns - Pesquisar ou estudar assunto"],
    ["1004_S_180_Alta","180","Atividades Comuns - Pesquisar ou estudar assunto"],
    ["1005_S_240_Muito Alta","240","Atividades Comuns - Pesquisar ou estudar assunto"],
    ["1006_S_300_Especial","300","Atividades Comuns - Pesquisar ou estudar assunto"],
    ["1007_S_30_Muito Baixa","30","Atividades Comuns - Realizar Contratação e Prorrogação"],
    ["1008_S_60_Baixa","60","Atividades Comuns - Realizar Contratação e Prorrogação"],
    ["1009_S_90_Média","90","Atividades Comuns - Realizar Contratação e Prorrogação"],
    ["1010_S_120_Alta","120","Atividades Comuns - Realizar Contratação e Prorrogação"],
    ["1011_S_360_Muito Alta","360","Atividades Comuns - Realizar Contratação e Prorrogação"],
    ["1012_S_480_Especial","480","Atividades Comuns - Realizar Contratação e Prorrogação"],
    ["1013_S_15_Muito Baixa","15","Atividades Comuns - Receber, distribuir e acompanhar demandas"],
    ["1014_S_30_Baixa","30","Atividades Comuns - Receber, distribuir e acompanhar demandas"],
    ["1015_S_60_Média","60","Atividades Comuns - Receber, distribuir e acompanhar demandas"],
    ["4744_S_120_Alta","120","Atividades Comuns - Receber, distribuir e acompanhar demandas"],
    ["4745_S_180_Muito Alta","180","Atividades Comuns - Receber, distribuir e acompanhar demandas"],
    ["4746_S_240_Especial","240","Atividades Comuns - Receber, distribuir e acompanhar demandas"],
    ["1016_S_15_Muito Baixa","15","Atividades Comuns - Tratar demandas gerais"],
    ["1017_S_30_Baixa","30","Atividades Comuns - Tratar demandas gerais"],
    ["1018_S_60_Média","60","Atividades Comuns - Tratar demandas gerais"],
    ["1019_S_120_Alta","120","Atividades Comuns - Tratar demandas gerais"],
    ["1020_S_240_Muito Alta","240","Atividades Comuns - Tratar demandas gerais"],
    ["1021_S_480_Especial","480","Atividades Comuns - Tratar demandas gerais"],
    ["1022_S_30_Baixa","30","Dados - Apoiar Governança de Dados"],
    ["1023_S_60_Média","60","Dados - Apoiar Governança de Dados"],
    ["1024_S_90_Alta","90","Dados - Apoiar Governança de Dados"],
    ["1025_S_15_Muito Baixa","15","Dados - Atender Demanda de Solução de Dados"],
    ["1026_S_30_Baixa","30","Dados - Atender Demanda de Solução de Dados"],
    ["1027_S_60_Média","60","Dados - Atender Demanda de Solução de Dados"],
    ["1028_S_120_Alta","120","Dados - Atender Demanda de Solução de Dados"],
    ["1029_S_240_Muito Alta","240","Dados - Atender Demanda de Solução de Dados"],
    ["1030_S_480_Especial","480","Dados - Atender Demanda de Solução de Dados"],
    ["1031_S_15_Muito Baixa","15","Dados - Garantir Conformidade e Demanda Externa"],
    ["1032_S_30_Baixa","30","Dados - Garantir Conformidade e Demanda Externa"],
    ["1033_S_45_Média","45","Dados - Garantir Conformidade e Demanda Externa"],
    ["1034_S_60_Média","60","Documento - Reclassificar Arquivo e Destinação Documental"],
    ["1035_S_120_Alta","120","Documento - Reclassificar Arquivo e Destinação Documental"],
    ["1036_S_240_Muito Alta","240","Documento - Reclassificar Arquivo e Destinação Documental"],
    ["4750_S_15_Muito Baixa","15","Documento - Reclassificar Arquivo e Destinação Documental"],
    ["4751_S_30_Baixa","30","Documento - Reclassificar Arquivo e Destinação Documental"],
    ["4752_S_480_Especial","480","Documento - Reclassificar Arquivo e Destinação Documental"],
    ["1043_S_15_Muito Baixa","15","Infraestrutura de TI - Atender ou acompanhar atendimento de demandas"],
    ["1044_S_30_Baixa","30","Infraestrutura de TI - Atender ou acompanhar atendimento de demandas"],
    ["1045_S_60_Média","60","Infraestrutura de TI - Atender ou acompanhar atendimento de demandas"],
    ["1046_S_120_Alta","120","Infraestrutura de TI - Atender ou acompanhar atendimento de demandas"],
    ["1047_S_240_Muito Alta","240","Infraestrutura de TI - Atender ou acompanhar atendimento de demandas"],
    ["1048_S_480_Especial","480","Infraestrutura de TI - Atender ou acompanhar atendimento de demandas"],
    ["1049_S_15_Muito Baixa","15","Infraestrutura de TI - Desativar ou acompanhar desativação de solução"],
    ["1050_S_30_Baixa","30","Infraestrutura de TI - Desativar ou acompanhar desativação de solução"],
    ["1051_S_60_Média","60","Infraestrutura de TI - Desativar ou acompanhar desativação de solução"],
    ["1052_S_120_Alta","120","Infraestrutura de TI - Desativar ou acompanhar desativação de solução"],
    ["1053_S_240_Muito Alta","240","Infraestrutura de TI - Desativar ou acompanhar desativação de solução"],
    ["1054_S_480_Especial","480","Infraestrutura de TI - Desativar ou acompanhar desativação de solução"],
    ["1055_S_15_Muito Baixa","15","Infraestrutura de TI - Investigar ou apoiar investigação de incidente"],
    ["1056_S_30_Baixa","30","Infraestrutura de TI - Investigar ou apoiar investigação de incidente"],
    ["1057_S_60_Média","60","Infraestrutura de TI - Investigar ou apoiar investigação de incidente"],
    ["1058_S_120_Alta","120","Infraestrutura de TI - Investigar ou apoiar investigação de incidente"],
    ["1059_S_240_Muito Alta","240","Infraestrutura de TI - Investigar ou apoiar investigação de incidente"],
    ["1060_S_480_Especial","480","Infraestrutura de TI - Investigar ou apoiar investigação de incidente"],
    ["1061_S_15_Muito Baixa","15","Infraestrutura de TI - Planejar, implantar ou acompanhar implantação de solução"],
    ["1062_S_30_Baixa","30","Infraestrutura de TI - Planejar, implantar ou acompanhar implantação de solução"],
    ["1063_S_60_Média","60","Infraestrutura de TI - Planejar, implantar ou acompanhar implantação de solução"],
    ["1064_S_120_Alta","120","Infraestrutura de TI - Planejar, implantar ou acompanhar implantação de solução"],
    ["1065_S_240_Muito Alta","240","Infraestrutura de TI - Planejar, implantar ou acompanhar implantação de solução"],
    ["1066_S_480_Especial","480","Infraestrutura de TI - Planejar, implantar ou acompanhar implantação de solução"],
    ["4037_S_240_Alta","240","Ocorrência - Atestado de Comparecimento"],
    ["4038_S_180_Média","180","Ocorrência - Atestado de Comparecimento"],
    ["4039_S_120_Baixa","120","Ocorrência - Atestado de Comparecimento"],
    ["4040_S_60_Muito Baixa","60","Ocorrência - Atestado de Comparecimento"],
    ["989_S_30_Muito Baixa","30","Ocorrência - Participar de Capacitação"],
    ["990_S_60_Baixa","60","Ocorrência - Participar de Capacitação"],
    ["991_S_120_Média","120","Ocorrência - Participar de Capacitação"],
    ["992_S_240_Alta","240","Ocorrência - Participar de Capacitação"],
    ["993_S_360_Muito Alta","360","Ocorrência - Participar de Capacitação"],
    ["994_S_480_Especial","480","Ocorrência - Participar de Capacitação"],
    ["1037_S_60_Média","60","Protocolo - Autenticar Documentos Digitalizados"],
    ["1038_S_120_Alta","120","Protocolo - Autenticar Documentos Digitalizados"],
    ["1039_S_240_Muito Alta","240","Protocolo - Autenticar Documentos Digitalizados"],
    ["4753_S_15_Muito Baixa","15","Protocolo - Autenticar Documentos Digitalizados"],
    ["4754_S_30_Baixa","30","Protocolo - Autenticar Documentos Digitalizados"],
    ["4755_S_480_Especial","480","Protocolo - Autenticar Documentos Digitalizados"],
    ["1040_S_30_Baixa","30","Protocolo - Interagir com responsáveis pelos Protocolos nos Estados"],
    ["1041_S_60_Média","60","Protocolo - Interagir com responsáveis pelos Protocolos nos Estados"],
    ["1042_S_120_Alta","120","Protocolo - Interagir com responsáveis pelos Protocolos nos Estados"],
    ["4756_S_15_Muito Baixa","15","Protocolo - Interagir com responsáveis pelos Protocolos nos Estados"],
    ["4757_S_240_Muito Alta","240","Protocolo - Interagir com responsáveis pelos Protocolos nos Estados"],
    ["4758_S_480_Especial","480","Protocolo - Interagir com responsáveis pelos Protocolos nos Estados"],
    ["1067_S_15_Muito Baixa","15","Sistemas - Atender Demandas de Sistema"],
    ["1068_S_30_Baixa","30","Sistemas - Atender Demandas de Sistema"],
    ["1069_S_60_Média","60","Sistemas - Atender Demandas de Sistema"],
    ["1070_S_120_Alta","120","Sistemas - Atender Demandas de Sistema"],
    ["1071_S_240_Muito Alta","240","Sistemas - Atender Demandas de Sistema"],
    ["1072_S_480_Especial","480","Sistemas - Atender Demandas de Sistema"],
    ["1073_S_30_Muito Baixa","30","Sistemas - Desativar Sistemas"],
    ["1074_S_60_Baixa","60","Sistemas - Desativar Sistemas"],
    ["1075_S_120_Média","120","Sistemas - Desativar Sistemas"],
    ["1076_S_240_Alta","240","Sistemas - Desativar Sistemas"],
    ["1077_S_360_Muito Alta","360","Sistemas - Desativar Sistemas"],
    ["1078_S_480_Especial","480","Sistemas - Desativar Sistemas"],
    ["1079_S_30_Muito Baixa","30","Sistemas - Desenvolver Solução"],
    ["1080_S_60_Baixa","60","Sistemas - Desenvolver Solução"],
    ["1081_S_120_Média","120","Sistemas - Desenvolver Solução"],
    ["1082_S_240_Alta","240","Sistemas - Desenvolver Solução"],
    ["1083_S_360_Muito Alta","360","Sistemas - Desenvolver Solução"],
    ["1084_S_480_Especial","480","Sistemas - Desenvolver Solução"],
    ["1085_S_30_Muito Baixa","30","Sistemas - Gerir Operações e Arquitetura"],
    ["1086_S_60_Baixa","60","Sistemas - Gerir Operações e Arquitetura"],
    ["1087_S_120_Média","120","Sistemas - Gerir Operações e Arquitetura"],
    ["1088_S_240_Alta","240","Sistemas - Gerir Operações e Arquitetura"],
    ["1089_S_360_Muito Alta","360","Sistemas - Gerir Operações e Arquitetura"],
    ["1090_S_480_Especial","480","Sistemas - Gerir Operações e Arquitetura"],
    ["1091_S_30_Muito Baixa","30","Sistemas - Investigar Erro"],
    ["1092_S_60_Baixa","60","Sistemas - Investigar Erro"],
    ["1093_S_120_Média","120","Sistemas - Investigar Erro"],
    ["1094_S_240_Alta","240","Sistemas - Investigar Erro"],
    ["1095_S_360_Muito Alta","360","Sistemas - Investigar Erro"],
    ["1096_S_480_Especial","480","Sistemas - Investigar Erro"],
  ];


  var tabela = []

  for(i=0; i<atividades.length; i++){
    let tempos = []
    for(k=0; k<duracao.length; k++){
      if(atividades[i][0] === duracao[k][2]){
        tempos.push(duracao[k])
      }
    }

    tabela.push([
      atividades[i][0],
      atividades[i][1],
      sub_atividades[i],
      tempos
      ])
  }

  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("pgd_atividades", 'readwrite');
    const store = tx.objectStore("pgd_atividades");

    let req;
    try {
      // req = store.add(obj);
      for(i=0; i<tabela.length; i++){
        req = store.add({
          area: 'SGI',
          atividade: tabela[i][0],
          descricao: tabela[i][1],
          sub_atividades: tabela[i][2],
          duracao: tabela[i][3]
        })
      }
    } catch (e) {
      console.error("Matriz Atividade " + e.error)
      throw e;
    }

    req.onsuccess = function(event){
      var key = event.target.result;
      // console.debug("#"+key);
    }

    req.onerror = function() {
      console.error(i + " " + atividades[i][0] + " => " + this.error);
    };
    
  };//indexedDB


} // inserirPgdGIDS



function inserirDadosRecorrentesDeTeste(){

  let dados_recorrentes = [
    {
      data_ini: '2022-06-01T09:30',
      data_fim: '2022-06-01T10:00',
      atividade: 8,
      sub_atividade: "Participação em Reunião ou similares",
      duracao: "996_S_30_Baixa",
      descricao: "Projeto SGE.",
      num_sei: '',
      recorrencia: 1,
      encerramento: "2022-12-31T23:59"
    },
    {
      data_ini:"2022-06-01T10:00",
      data_fim:"2022-06-01T11:00",
      duracao:"997_S_60_Média",
      descricao:"Projeto RGL.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
      recorrencia: 1,
      encerramento:"2022-12-31T23:59"
    },
    {
      data_ini:"2022-06-01T10:30",
      data_fim:"2022-06-01T11:00",
      duracao:"996_S_30_Baixa",
      descricao:"Projeto Mosaico. Levantamento de requisitos de negócio.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
      recorrencia: 1,
      encerramento:"2022-12-31T23:59"
    },
    {
      data_ini:"2022-06-01T11:00",
      data_fim:"2022-06-01T11:15",
      duracao:"995_S_15_Muito Baixa",
      descricao:"Projeto Certifica (Daily).",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
      recorrencia: 1,
      encerramento:"2022-12-31T23:59"
    },
    {
      data_ini:"2022-06-01T11:15",
      data_fim:"2022-06-01T12:00",
      duracao:"997_S_60_Média",
      descricao:"Projeto Certifica (Daily).",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
      recorrencia: 1,
      encerramento:"2022-12-31T23:59"
    },
    {
      data_ini:"2022-06-01T14:30",
      data_fim:"2022-06-01T15:00",
      duracao:"996_S_30_Baixa",
      descricao:"Projeto RCR (Daily).",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
      recorrencia: 1,
      encerramento:"2022-12-31T23:59"
    },
    {
      data_ini:"2022-06-01T15:15",
      data_fim:"2022-06-01T15:45",
      duracao:"996_S_30_Baixa",
      descricao:"GIDS3 (Daily).",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
      recorrencia: 1,
      encerramento:"2022-12-31T23:59"
    },
  ];

  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("eventos", 'readwrite');
    const store = tx.objectStore("eventos");

    let req;
    try {
      for(i=0; i<dados_recorrentes.length; i++){
        req = store.add(dados_recorrentes[i])
      }
    } catch (e) {
      console.error("Dados de teste recorrentes: " + e.error)
      throw e;
    }

    req.onsuccess = function(event){
      var key = event.target.result;
      console.debug("Recorrente de teste: #"+key);
    }

    req.onerror = function() {
      console.error("Recorrente de teste => " + this.error);
    };
    
  };//indexedDB
}





function inserirDiarioDeTeste(){

  let diario = [
    {
      data_ini: '2022-06-20T09:30',
      data_fim: '2022-06-20T10:00',
      atividade: 8,
      sub_atividade: "Participação em Reunião ou similares",
      duracao: "996_S_30_Baixa",
      descricao: "Projeto SGE.  Anderson se comprometeu a investigar o erro verificado pelo Frederico ao carregar o mapa.",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T10:00",
      data_fim:"2022-06-20T11:00",
      duracao:"997_S_60_Média",
      descricao:"Projeto RGL. Chamado INC-15622 foi priorizado. Renato pediu para fazer reunião com a GT1 sobre chamados em aberto. Renato afirmou que a data de validade da licença está preenchida mas não é exibida no documento ao imprimir. Airam criou a tarefa #5881. Reclamada a INC-9596 (reaberta para correção). Airam cobrou resposta sobre a integração contínua.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T10:30",
      data_fim:"2022-06-20T11:00",
      duracao:"996_S_30_Baixa",
      descricao:"Projeto Mosaico. Anderson pediu pra agendar reunião da GT1 + Augusto/SpectrumCenter. Acredita que a equipe técnica já compreendeu o negócio e precisa estudar o que será feito em termos de implementação neste time slot.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T11:00",
      data_fim:"2022-06-20T13:00",
      duracao:"995_S_15_Muito Baixa",
      descricao:"Integração Contínua. Trataivas sobre quem tem interesse na automação de testes; viabilidade; alinhamento com GIDS5 e rito para solicitação. Questionamentos técnicos ao contratado.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T11:00",
      data_fim:"2022-06-20T11:15",
      duracao:"995_S_15_Muito Baixa",
      descricao:"Projeto Certifica (Daily). Desenvolvedores mostraram o andamento dos chamados. PO tratou sobre Declaração de Conformidade e autenticação de usuário externo. Abordados problemas com WebServices",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T11:15",
      data_fim:"2022-06-20T12:00",
      duracao:"997_S_60_Média",
      descricao:"Projeto Certifica (Requisitos): não havia requisitos para levantar.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T14:30",
      data_fim:"2022-06-20T15:00",
      duracao:"996_S_30_Baixa",
      descricao:"Projeto RCR (Daily). andamento dos chamados segue normal e com chamado 15368 para validação pelo PO.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T15:15",
      data_fim:"2022-06-20T15:45",
      duracao:"996_S_30_Baixa",
      descricao:"GIDS3 (Daily). Atualização da Sprint com os desenvolvedores. Enfatizado que deploy em produção somente após teste e homologação. Luciano discorreu sobre problemas no ambientes SU e PD do SCH.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T16:00",
      data_fim:"2022-06-20T17:00",
      duracao:"996_S_30_Baixa",
      descricao:"Estudo dos itens de 1 a 7 do Guia de Métricas da Anatel, SEI 7055424.",
      atividade: 9,
      sub_atividade: "Pesquisa ou Estudo realizado",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T16:00",
      data_fim:"2022-06-20T17:00",
      duracao:"996_S_30_Baixa",
      descricao:"Revisão dos Acordos de Nível de Serviço do Projeto Básico usado na contratação com a Spectrum Center. Analisando função de auditoria no Marval.",
      atividade: 9,
      sub_atividade: "Pesquisa ou Estudo realizado",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T16:00",
      data_fim:"2022-06-20T17:00",
      duracao:"996_S_30_Baixa",
      descricao:"Análise do diário dos postos de trabalho.",
      atividade: 9,
      sub_atividade: "Pesquisa ou Estudo realizado",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T16:00",
      data_fim:"2022-06-20T17:00",
      duracao:"996_S_30_Baixa",
      descricao:"45min \"Tratamento de Incidentes\": atendimento para ORER e Augusto no período da tarde. Problemas com firewall ao homologar funcionalidades. Deise solicitou auxílio ao Alex. Eu solicitei informações sobre como proceder neste caso diretamente para a Produção. Combinamos aguardar por resposta até terça-feira de manhã antes de agir novamente.",
      atividade: 9,
      sub_atividade: "Pesquisa ou Estudo realizado",
      num_sei: '',
    },
    


    {
      data_ini: '2022-06-21T09:30',
      data_fim: '2022-06-21T10:00',
      atividade: 8,
      sub_atividade: "Participação em Reunião ou similares",
      duracao: "996_S_30_Baixa",
      descricao: "Projeto SGE. Anderson continua investigando o problema com carregamento do mapa em TS e que poderá requerer o envolvimento da GIDS.",
      num_sei: '',
    },
    {
      data_ini:"2022-06-21T10:00",
      data_fim:"2022-06-21T11:00",
      duracao:"997_S_60_Média",
      descricao:"Projeto RGL. Augusto (SpectrumCenter) citou problemas de validação que foram corrigidos. Tratamos sobre o assunto de Integração Contínua (testes automatizados). Discorrido sobre demanda urgente de UTE para delegação americana.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-21T10:30",
      data_fim:"2022-06-21T11:00",
      duracao:"996_S_30_Baixa",
      descricao:"Projeto Mosaico. Sem requisitos de negócio para levantar. Equipe técnica segue na modelagem.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-21T11:00",
      data_fim:"2022-06-21T11:15",
      duracao:"995_S_15_Muito Baixa",
      descricao:"Projeto Certifica (Daily). PO ausente, Stefan (ORCN) entrou como substituto. Apresentação das entregas. É preciso consultar o CPF do Representante/Representado no SEI, por causa das Procurações dos requerentes de Certificação.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-21T11:15",
      data_fim:"2022-06-21T12:00",
      duracao:"997_S_60_Média",
      descricao:"Projeto Certifica para Requisitos: não havia requisitos novos.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-21T14:30",
      data_fim:"2022-06-21T15:00",
      duracao:"996_S_30_Baixa",
      descricao:"Projeto RCR (Daily). Existem problemas de infra impedindo o andamento dos trabalhos.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-21T15:15",
      data_fim:"2022-06-21T15:45",
      duracao:"996_S_30_Baixa",
      descricao:"GIDS3 (Daily). UTE/SCH têm problemas ao consumir WebServices do SEI. SGE com problemas de Firewall, INC-15951 e REQ-15952. Abordada a necessidade de esclarecimentos com PO Fred sobre SGE e importação de estações.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-21T16:15",
      data_fim:"2022-06-21T17:15",
      duracao:"996_S_30_Baixa",
      descricao:"Projeto de Migração de Dados do Mongo DB: modelagem pela equipe técnica.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-21T16:00",
      data_fim:"2022-06-21T17:00",
      duracao:"996_S_30_Baixa",
      descricao:"Tratando problemas com Firewall que impedem o bom andamento do trabalho de desenvolvimento e testes pelos POs.",
      atividade: 9,
      sub_atividade: "Pesquisa ou Estudo realizado",
      num_sei: '',
    },


    {
      data_ini: '2022-06-22T09:30',
      data_fim: '2022-06-22T10:00',
      atividade: 8,
      sub_atividade: "Participação em Reunião ou similares",
      duracao: "996_S_30_Baixa",
      descricao: "Projeto SGE. Tratativas relacionadas ao Firewall (Chamado REQ-15959). Esclarecimentos sobre requisitos. Dificuldade de abordar requisitos e fazer testes devido ao problema com o Firewall.",
      num_sei: '',
    },
    {
      data_ini:"2022-06-22T10:00",
      data_fim:"2022-06-22T11:00",
      duracao:"997_S_60_Média",
      descricao:"Projeto RGL. Funcionalidade de outorga por público externo continua não funcionando. WS do SEI estava com problemas ontem e está sendo investigado pela área. Abordado sobre validação de designação de emissão no Serviço 010. Abordado sobre migração de atos e exclusão de duplicação de dados.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-22T10:30",
      data_fim:"2022-06-22T11:00",
      duracao:"996_S_30_Baixa",
      descricao:"Projeto Mosaico. Requisitos de negócio não carecem de explicações. Continuação da modelagem.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-22T11:00",
      data_fim:"2022-06-22T11:15",
      duracao:"995_S_15_Muito Baixa",
      descricao:"Projeto Certifica (Daily). Abordado sobre impedimento relacionado ao WS do SEI. PO quer pausar a EU sobre CCT e iniciar #14908, sobre CDC, deixando sem entregas na Sprint.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },

    {
      data_ini:"2022-06-20T11:00",
      data_fim:"2022-06-20T12:00",
      duracao:"996_S_30_Baixa",
      descricao:"40min Reunião GIDS3: sobre investigação do problema com o WebService do SEI.",
      atividade: 8,
      sub_atividade: "Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-22T11:15",
      data_fim:"2022-06-22T12:00",
      duracao:"997_S_60_Média",
      descricao:"Projeto Certifica sem necessidade de esclarecimentos adicionais para requisitos.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-22T14:30",
      data_fim:"2022-06-22T15:00",
      duracao:"996_S_30_Baixa",
      descricao:"Projeto RCR (Daily). Informado que há um impedimento quando o Mosaico consulta o SitarWeb.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-22T15:15",
      data_fim:"2022-06-22T15:45",
      duracao:"996_S_30_Baixa",
      descricao:"GIDS3 (Daily). Acompanhamento dos chamados. Informado que mudança de regra de negócio deve ser submetida por SMTI e não por VISAO, exceto se fora apenas uma análise de impacto. SGE voltou a funcionar depois que o firewall foi reconfigurado.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T16:00",
      data_fim:"2022-06-20T17:00",
      duracao:"996_S_30_Baixa",
      descricao:"reunião com Eduardo, Marcus e Augusto: investigação que se refere ao chamado REQ-16136.",
      atividade: 8,
      sub_atividade: "Participação em Reunião ou similares",
      num_sei: '',
    },

    {
      data_ini: '2022-06-23T09:30',
      data_fim: '2022-06-23T10:00',
      atividade: 8,
      sub_atividade: "Participação em Reunião ou similares",
      duracao: "996_S_30_Baixa",
      descricao: "Projeto SGE. Andamento dos chamados. Ambiente DS está acessível.",
      num_sei: '',
    },
    {
      data_ini:"2022-06-23T10:00",
      data_fim:"2022-06-23T11:00",
      duracao:"997_S_60_Média",
      descricao:"Projeto RGL. Priorizada a SMTI 53500.048463/2022-00.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-23T10:30",
      data_fim:"2022-06-23T11:00",
      duracao:"996_S_30_Baixa",
      descricao:"Projeto Mosaico. Requisitos de negócio sob modelagem pela equipe técnica.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-23T11:00",
      data_fim:"2022-06-23T11:15",
      duracao:"995_S_15_Muito Baixa",
      descricao:"Projeto Certifica (Daily). Acompanhamento de chamados.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-23T11:15",
      data_fim:"2022-06-23T12:00",
      duracao:"997_S_60_Média",
      descricao:"Projeto Certifica (Requisitos). Tarefas estão claras para a equipe.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-23T14:30",
      data_fim:"2022-06-23T15:00",
      duracao:"996_S_30_Baixa",
      descricao:"Projeto RCR (Daily). Bloqueio no HM ainda persiste (INC-16136), apesar de concedidas as permissões de acesso ao BD do SARH.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-23T15:15",
      data_fim:"2022-06-23T15:45",
      duracao:"996_S_30_Baixa",
      descricao:"GIDS3 (Daily). Apresentação dos chamados. Problemas relatados com Firewall e alteração de tabela na versão 4 do SEI são pontos que requerem solução rápida e efetiva.",
      atividade: 8,
      sub_atividade:"Participação em Reunião ou similares",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T16:00",
      data_fim:"2022-06-20T17:00",
      duracao:"996_S_30_Baixa",
      descricao:"Análise e triagem de processos de SMTI. 53500.048463/2022-00 para Cláudia e Moyses. Análise e triagem de processos de SMTI. 53500.048463/2022-00 para Cláudia e Moyses. 53500.020276/2022-53 pode envolver vários sistemas e foi encaminhada para Wesley.",
      atividade: 9,
      sub_atividade: "Pesquisa ou Estudo realizado",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T16:00",
      data_fim:"2022-06-20T17:00",
      duracao:"996_S_30_Baixa",
      descricao:"Procurei conseguir o desbloqueio de Firewall no SGE, INC-16218. Acompanhamento de outros chamados desta semana no Marval.",
      atividade: 9,
      sub_atividade: "Pesquisa ou Estudo realizado",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T16:00",
      data_fim:"2022-06-20T17:00",
      duracao:"996_S_30_Baixa",
      descricao:"Estudo do Registro de Reunião SEI 6885390 sobre Banco de Horas e Ausências/Compensações",
      atividade: 9,
      sub_atividade: "Pesquisa ou Estudo realizado",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T16:00",
      data_fim:"2022-06-20T17:00",
      duracao:"996_S_30_Baixa",
      descricao:"Tratando de assuntos ligados à Produção com o Cléoben (GIMR). Levantando informações técnicas com a equipe.",
      atividade: 9,
      sub_atividade: "Pesquisa ou Estudo realizado",
      num_sei: '',
    },
    {
      data_ini:"2022-06-20T11:00",
      data_fim:"2022-06-20T12:00",
      duracao:"996_S_30_Baixa",
      descricao:"Reunião de Coordenadores da GIDS, onde o principal assunto foi a Fiscalização do Acompanhamento do Contrato de Postos de Trabalho.",
      atividade: 8,
      sub_atividade: "Participação em Reunião ou similares",
      num_sei: '',
    },

  ];

  indexedDB.open("pgd",1).onsuccess = function (evt) {
    const idb = this.result;
    const tx = idb.transaction("diario", 'readwrite');
    const store = tx.objectStore("diario");

    let req;
    try {
      for(i=0; i<diario.length; i++){
        req = store.add(diario[i])
      }
    } catch (e) {
      console.error("Diário de teste: " + e.error)
      throw e;
    }

    req.onsuccess = function(event){
      var key = event.target.result;
      console.debug("Diário de teste: #"+key);
    }

    req.onerror = function() {
      console.error("Diário de teste => " + this.error);
    };
    
  };//indexedDB
}