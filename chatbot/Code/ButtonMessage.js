const { sendTemplateMessage } = require('../API/WPP/sendTemplate');

const {
    getMessageById,
    updateEtapa,
} = require('../DB/indexDB');

async function ButtonMessage(message, senderNumber, etapaAtual, urlSiteBruto, slugRemarcar, slugCancelar, utms) {
    console.log('Botão ou lista recebido:', message.interactive);

    let urlSite = `${urlSiteBruto}${utms}`;

    const etapaInfo = await getMessageById(etapaAtual.etapa);
    
    const replyId = message.interactive.button_reply?.id || message.interactive.list_reply?.id; // Pega a id da escolha do usuário

    // Busca a mensagem no banco usando o reply.id
    const messageData = await getMessageById(replyId);

    if (etapaInfo.id_mensagens == 6){ //Se for a mensagem de id 6 (Remarcar?)
        if(message.interactive.button_reply?.title == 'SIM'){ //Se for remarcar
            urlSite = `${urlSiteBruto}${slugRemarcar}${utms}`;
        } else { //Se for cancelar
            urlSite = `${urlSiteBruto}${slugCancelar}${utms}`;
        }

        await sendTemplateMessage(messageData.nome_mensagem, messageData.caminho, senderNumber, {PHONE_NUMBER: senderNumber,URL_SITE: urlSite});

    } else {

        await sendTemplateMessage(messageData.nome_mensagem, messageData.caminho, senderNumber, {PHONE_NUMBER: senderNumber,URL_SITE: urlSite});

    }

    // Atualiza a etapa do usuário no banco
    await updateEtapa(senderNumber, messageData.id_mensagens);

    return { statusCode: 200, body: 'Message Send' };
}

module.exports = { ButtonMessage };