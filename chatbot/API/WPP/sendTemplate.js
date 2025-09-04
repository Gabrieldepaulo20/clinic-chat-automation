const fs = require('fs');
const path = require('path');
const { replaceVariables } = require('./replaceVariables');

const {
  getNumberByNumber,
  getUserAtive
} = require('../../DB/indexDB');

// function replacePhoneNumber(obj, phoneNumber) { //FUNÇÃO PARA ALTERAR O NÚMERO DO JSON DO TEMPLATE
//   const str = JSON.stringify(obj); //Transforma o objeto em uma string json
//   return JSON.parse(str.replace(/{{PHONE_NUMBER}}/g, phoneNumber)); //Substitui a variavel {{PHONE_NUMBER}}, pelo número de quem está enviando a mensagem
// }

async function sendTemplateMessage(templateName, caminho, phoneNumber, variaveis = {}) {
  console.log('sendTemplate:', '\n', 'Nome do template:', templateName, '\n', 'Caminho do template:', caminho, '\n', 'Número de telefone:', phoneNumber);

  //UTMS URL
  if (variaveis.URL_SITE?.includes('idUser=null')) {
    const numberInfo = await getNumberByNumber(phoneNumber);
    const idUserAtive = await getUserAtive(numberInfo.id);
    variaveis.URL_SITE = variaveis.URL_SITE.replace('idUser=null', `idUser=${idUserAtive.id_usuario}`);
  }

  const filePath = path.join(__dirname, 'Templates', caminho, `${templateName}.json`);
  const template = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  console.log('→ template:', template);

  let payload = template;

  if (Object.keys(variaveis).length > 0) {
    payload = await replaceVariables(template, variaveis);
  }

  console.log('→ template com variáveis substituídas:', payload);

  const url = `https://graph.facebook.com/v22.0/${process.env.WPP_PHONE_ID}/messages`;

  console.log('URL da requisição:', url);
  console.log('Headers:', {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    'Content-Type': 'application/json',
  });
  console.log('Payload:', JSON.stringify(payload, null, 2));

  const controller = new AbortController();
  const timeout = 20000; // 20 segundos de timeout (ajuste aqui o tempo desejado)

  const timeoutId = setTimeout(() => {
    console.warn('Timeout atingido. Abortando requisição...');
    controller.abort(); // Aborta a fetch
  }, timeout);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal, // Importante: associar o controller ao fetch
    });

    clearTimeout(timeoutId); // Se deu certo antes do timeout, limpar o timer

    console.log('→ fetch status:', res.status, res.statusText);

    const text = await res.clone().text();
    console.log('→ fetch raw body:', text);

    if (!res.ok) {
      const error = await res.text();
      console.error('Erro ao enviar template:', res.status, error);
      throw new Error(`HTTP ${res.status}: ${error}`);
    }

    const data = await res.json();
    console.log('Template enviado com sucesso:', data);

    return { statusCode: 200, message: 'Template enviado com sucesso' };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Requisição abortada por timeout.');
      return { statusCode: 200 }; // <-- Aqui você retorna 200 se for timeout
    } else {
      console.error('Erro inesperado ao enviar template:', error);
      throw error; // Se for outro erro, relança
    }
  }
}

module.exports = { sendTemplateMessage };