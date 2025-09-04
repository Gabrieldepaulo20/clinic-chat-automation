// index.js (Lambda) ────────────────────────────────────────────────────────────

const mysql = require('mysql2/promise');
const ConnectDB = require('./bd/connectionBD.js');
const dias_disponiveis = require('./bd/dias_disponivel_profissional.js');
const horarios_disponiveis = require('./bd/horarios_disponiveis_profissional.js');
const agendar = require('./bd/agendar_paciente.js');
const getProfissionais = require('./bd/profissionais.js');
const buscarIdUsuario = require('./bd/buscarIdUsuario.js');

// Mantém UMA única Promise de conexão enquanto a Lambda ficar “quente”
let connectionPromise = null;
async function getConnection() {
  if (!connectionPromise) {
    connectionPromise = ConnectDB();
  }
  return connectionPromise;
}

function resposta(statusCode, bodyObj) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",             // libera chamadas de qualquer origem
      "Access-Control-Allow-Methods": "POST,OPTIONS", // métodos permitidos
      "Access-Control-Allow-Headers": "Content-Type"  // cabeçalhos permitidos
    },
    body: JSON.stringify(bodyObj)
  };
}

// Rotas que efetivamente chamam as funções de bd/... e devolvem objetos { statusCode, body: JSONstring }
const rotas = {
  dias_disponiveis: async (connection, data) => {
    const resp = await dias_disponiveis(connection, data);
    // resp já é algo como { statusCode: 200, body: JSON.stringify([...]) }
    // Para manter o formato, extraímos o array de dentro do resp.body e devolvemos com headers CORS:
    return resposta(resp.statusCode, JSON.parse(resp.body));
  },
  horarios_disponiveis: async (connection, data) => {
    const resp = await horarios_disponiveis(connection, data);
    return resposta(resp.statusCode, JSON.parse(resp.body));
  },
  agendar: async (connection, data) => {
    const resp = await agendar(connection, data);
    // resp pode ser { statusCode: 201, mensagem: "..." } ou { statusCode:400, ... }
    return resposta(resp.statusCode, resp);
  },
  getProfissionais: async (connection) => {
    const lista = await getProfissionais(connection);
    // lista é um array simples de nomes. Envia 200 + array JSON:
    return resposta(200, lista);
  },
  buscarIdUsuario: async (connection, data) => {
    const resultado = await buscarIdUsuario(connection, data);
    return resposta(200, resultado);
}
}

exports.handler = async (event) => {
  // 1) Se for pré-voo CORS (OPTIONS), devolve 204 com headers CORS
  if (event.requestContext?.http?.method?.toUpperCase() === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: ""
    };
  }

  let connection;
  try {
    // 2) Exigir POST para as ações principais
    const method = event.requestContext?.http?.method;
    if (!method || method.toUpperCase() !== "POST") {
      return resposta(405, { error: "Método não suportado." });
    }

    // 3) Se não tiver corpo, devolve 400
    if (!event.body) {
      return resposta(400, { error: "Requisição POST sem corpo." });
    }

    // 4) Tenta fazer parse do JSON
    let data;
    try {
      data = JSON.parse(event.body);
    } catch {
      return resposta(400, { error: "JSON inválido no corpo da requisição." });
    }

    // 5) Verifica se existe a ação (acao) e se está mapeada
    const { acao } = data;
    if (!acao || !rotas[acao]) {
      return resposta(400, { error: "Ação inválida ou não encontrada." });
    }

    // 6) Abre (ou reutiliza) a conexão MySQL
    connection = await getConnection();

    // 7) Executa a rota e retorna já com headers CORS
    return await rotas[acao](connection, data);

  } catch (err) {
    console.error("Erro Lambda:", err);
    return resposta(500, { error: "Erro interno no servidor." });
  }

};