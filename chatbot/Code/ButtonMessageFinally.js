const { sendTemplateMessage } = require('../API/WPP/sendTemplate');

const {
    getMessageById,
    updateEtapa,
} = require('../DB/indexDB');

async function ButtonMessageFinally(message, senderNumber, etapaAtual, urlSiteBruto, slugRemarcar, slugCancelar, utms) {
    console.log('Botão ou lista recebido (Finally):', message.interactive);

    const urlSite = `${urlSiteBruto}${utms}`;

    const WELCOME_MESSAGE_ID = 1;
    const messageData = await getMessageById(WELCOME_MESSAGE_ID); // Busca a Primeira mensagem a "welcomeButton" (1 = welcomeButton)

    await sendTemplateMessage(messageData.nome_mensagem, messageData.caminho, senderNumber, {PHONE_NUMBER: senderNumber,URL_SITE: urlSite});

    await updateEtapa(senderNumber, messageData.id_mensagens);

    return { statusCode: 200, body: 'Message Send' };
}

module.exports = { ButtonMessageFinally };