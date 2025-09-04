
const mysql = require('mysql2/promise');
const ConnectDB = require('./bd/connectionBD.js');
const dias_disponiveis = require('./bd/dias_disponivel_profissional.js');
const horarios_disponiveis = require('./bd/horarios_disponiveis_profissional.js');
const agendar = require('./bd/agendar_paciente.js');
const getProfissionais = require('./bd/profissionais.js');

// Mantém UMA única Promise de conexão enquanto a Lambda ficar “quente”
let connectionPromise = null;
async function getConnection() {
  if (!connectionPromise) {
    connectionPromise = ConnectDB();
  }
  return connectionPromise;
}

/**
 * Gera resposta JSON com headers CORS já incluídos
 */
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
  buscarIdUsuario: async (connection, data) => {
    const resp = await buscarIdUsuario(connection, data);
    return resposta(resp.statusCode, JSON.parse(resp.body));
  },
};

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