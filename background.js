
// ===========================================
// BANCO DE DADOS
// ===========================================

const DB_NAME = 'pgd';
const DB_VERSION = 1; // Use a long long for this value (don't use a float)
const DB_TIPOS_TAREFAS = 'tipos_tarefas';
const DB_TAREFAS = 'tarefas';
const DB_PGD_ATIVIDADES = "pgd_atividades"
const DB_PGD_DURACAO = "pgd_duracao"
const DB_PGD_SUB_ATIVIDADES = "pgd_sub_atividades"

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
      DB_PGD_ATIVIDADES, { keyPath: 'id', autoIncrement: true });
    store.createIndex('atividade', 'atividade', { unique: true });
    store.createIndex('descricao', 'descricao', { unique: false });
    
    var store = evt.currentTarget.result.createObjectStore(
      DB_PGD_DURACAO, { keyPath: 'id', autoIncrement: true });
    store.createIndex('idx_cod_duracao', ['codigo', 'atividade_id'], { unique: true });
    store.createIndex('idx_duracao', 'duracao', { unique: false });
    
    var store = evt.currentTarget.result.createObjectStore(
      DB_PGD_SUB_ATIVIDADES, { keyPath: 'id', autoIncrement: true });
    store.createIndex('idx_sub_atividade', ['sub_atividade','atividade_id'], { unique: true });
    

    var store = evt.currentTarget.result.createObjectStore(
      DB_TIPOS_TAREFAS, { keyPath: 'id', autoIncrement: true });
    store.createIndex('codigo', 'codigo', { unique: false });
    store.createIndex('atividade', 'atividade', { unique: true });
    store.createIndex('descricao', 'descricao', { unique: false });
    store.createIndex('minutos', 'minutos', { unique: false });

    var store = evt.currentTarget.result.createObjectStore(
      DB_TAREFAS, { keyPath: 'id', autoIncrement: true });
    store.createIndex('data', 'data', { unique: false });
    store.createIndex('atividade', 'atividade', { unique: false });
    store.createIndex('minutos', 'minutos', { unique: false });
    store.createIndex('descricao', 'descricao', { unique: false });
    store.createIndex('numerosei', 'numerosei', { unique: false });
  };
}

/**
 * @param {string} store_name
 * @param {string} mode either "readonly" or "readwrite"
 */
function getObjectStore(store_name, mode) {
  var tx = db.transaction(store_name, mode);
  return tx.objectStore(store_name);
}

function addPgdAtividade(atividade, descricao) {
  var obj = { atividade: atividade, descricao: descricao };
  var store = getObjectStore(DB_PGD_ATIVIDADES, 'readwrite');
  var req;
  try {
    req = store.add(obj);
  } catch (e) {
    throw e;
  }
  req.onsuccess = function(event){
    var key = event.target.result;
    console.log(atividade + " #"+key)
  }

  req.onerror = function() {
    console.error("addPgdAtividade "+obj.atividade, this.error);
  };
}

function addPgdSubAtividade(nome, atividade_id) {
  var obj = { sub_atividade: nome, atividade_id: atividade_id };
  var store = getObjectStore(DB_PGD_SUB_ATIVIDADES, 'readwrite');
  var req;
  try {
    req = store.add(obj);
  } catch (e) {
    throw e;
  }
  req.onerror = function() {
    console.error("addPgdSubAtividade "+nome, this.error);
  };
}

function addPgdDuracao(codigo, duracao, atividade_id) {
  var obj = { codigo: codigo, duracao: duracao, atividade_id: atividade_id };
  var store = getObjectStore(DB_PGD_DURACAO, 'readwrite');
  var req;
  try {
    req = store.add(obj);
  } catch (e) {
    throw e;
  }
  req.onerror = function() {
    console.error("addPgdDuracao "+ codigo, this.error);
  };
}

// TODO fazer um select genérico + equivalente do SQL WHERE
function dbSelect(table) {
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

  var res = []
  req.onsuccess = function(evt) {
    var cursor = evt.target.result;

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
  };
  return res;
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
  title: "Incluir teste",
  //type: "checkbox",
  contexts: ["all"],
  //checked : dontInvertState
}, onCreated);

browser.contextMenus.create({
  id: "pgd-export",
  title: "Listar",
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
    case "pgd-export":
        listarTiposTarefas()
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

browser.runtime.onMessage.addListener((request, sender, sendResponse) => 
{
    if(request.cmd === "listarTiposTarefas"){
        // debugger
        listarTiposTarefas()
    }
});


// browser.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     if (request.greeting == "hello")
//       sendResponse({farewell: "goodbye"});
//   }
// );


/*
addTipoTarefa("995_S_15_Muito Baixa", "Atividades Comuns - Participar de reuniões e similares (Muito Baixa)", "Reuniões bla bla bla", 15)
addTipoTarefa("996_S_30_Baixa", "Atividades Comuns - Participar de reuniões e similares (Baixa)", "Reuniões bla bla bla", 30)
*/


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

  // console.error("DESLIGUEI A INSERÇÃO DE ATIV E SUB ATIV!!!!!!!");

  for(i=0; i<atividades.length; i++){
    addPgdAtividade(atividades[i][0], atividades[i][1])
  }

  var cursor = dbSelect(DB_PGD_ATIVIDADES)
  // debugger //saporra de firefox faz cache. Tem que ligar o debugger pra conseguir rodar a merda do script de inserção abaixo

  for(i=0; i<sub_atividades.length; i++){
    var nome_atividade = atividades[i][0]
    var id_atividade = 0
    for(k=0; k<cursor.length; k++){
      console.debug("cursor")
      console.debug(cursor[k].atividade + " === " + nome_atividade)
      if(cursor[k].atividade == nome_atividade){
        id_atividade = cursor[k].id
        break
      }
    }

    for(n=0; n<sub_atividades[i].length; n++){
      var nome = sub_atividades[i][n]
      console.debug(nome_atividade + " #"+id_atividade+" => " + nome)
      if(nome != undefined && nome.length > 0 && id_atividade>0)
        addPgdSubAtividade(nome, id_atividade)
    }
  }// sub_atividades

  // adiciona duração
  for(n=0; n<duracao.length; n++){
    for(i=0; i<cursor.length; i++){
      if(cursor[i].atividade == duracao[n][2])
        addPgdDuracao(duracao[n][0], parseInt(duracao[n][1]), cursor[i].id)
    }
  }

  


} // inserirPgdGIDS