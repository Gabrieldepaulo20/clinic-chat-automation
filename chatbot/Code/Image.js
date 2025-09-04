const { sendTemplateMessage } = require('../API/WPP/sendTemplate');
const { getImageByIDWPP } = require('../API/WPP/getImageByIDWPP');
const { downloadImage } = require('../API/WPP/downloadImage');
const { uploadS3 } = require('../API/WPP/uploads3image');

const {
    insertImage,
    updateEtapa,
    getMessageById,
    getUserByID
  } = require('../DB/indexDB');

async function Image(message, senderNumber, etapaAtual, idUserAtive, urlSiteBruto, utms){
    console.log('Imagem recebida:', message.image);

    const urlSite = `${urlSiteBruto}${utms}`;

    const etapaInfo = await getMessageById(etapaAtual.etapa);
    let nextMessage = await getMessageById(etapaInfo.proxima_mensagem_id);

    const descricaoMap = {
      indicacao_sim: 'indicacao',
      plano_sim: 'plano'
    };

    const userAtiveInfo = await getUserByID(idUserAtive.id_usuario);

    const descricao = descricaoMap[etapaInfo.nome_mensagem] || null;
    const nomeImagem = `${senderNumber}/${userAtiveInfo.cpf}/${etapaInfo.id_mensagens}`

    const bytesImage = await downloadImage(await getImageByIDWPP(message.image.id));

    const url = await uploadS3(bytesImage, nomeImagem, message.image.mime_type);
    console.log('URL:', url);

    await insertImage(nomeImagem, url, message.image.mime_type, idUserAtive.id_usuario, descricao);

    await updateEtapa(senderNumber, etapaInfo.proxima_mensagem_id);

    if(nextMessage.id_mensagens !== null){
      await sendTemplateMessage(nextMessage.nome_mensagem, nextMessage.caminho, senderNumber, {PHONE_NUMBER: senderNumber, URL_SITE: urlSite});
    }

    return { statusCode: 200, body: 'Message Send' };
}

module.exports = { Image };