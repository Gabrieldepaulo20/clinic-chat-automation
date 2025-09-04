//VER DE RESETAR A ETAPA NO BANCO DPS DE UM CERTO TEMPO
//QUANDO ETAPA FINAL (NULL), NÃO COLOCA O CAMPO ETAPA DO USUÁRIO COMO NULO

const { sendTemplateMessage } = require('./API/WPP/sendTemplate');
const { getImageByIDWPP } = require('./API/WPP/getImageByIDWPP');
const { downloadImage } = require('./API/WPP/downloadImage');
const { uploadS3 } = require('./API/WPP/uploads3image');
const { TextMessage } = require('./Code/TextMessage');
const { ButtonMessage } = require('./Code/ButtonMessage');
const { ButtonMessageFinally } = require('./Code/ButtonMessageFinally');
const { Image } = require('./Code/Image');

const {
  getEtapa,
  getMessageById,
  getNumberByNumber,
  getUserAtive,
  insertNumber,
  updateEtapa,
  updateStatus,
  showTablesTESTE
} = require('./DB/indexDB');

exports.handler = async (event) => {
  try{
    // const teste = await showTablesTESTE();
    // console.log('AAAA: ', teste);
    // return { statusCode: 200, body: 'CODE_INATIVE' };
    const body = JSON.parse(event.body); //"Parseia" o body para JSON

    //IGNORA MENSAGENS DE STATUS
    if (body.entry?.[0]?.changes?.[0]?.value?.statuses) { //Verifica se "statuses" existe, se existir, ignora
      console.log('Recebido evento de status, ignorando...');
      return { statusCode: 200, body: 'STATUS_IGNORED' };
    }
    const method = event.requestContext.http.method; //Recebe o metódo da requisição

    if (method === 'GET') { //Se o método for GET
      const params = event.queryStringParameters; //Extrai as Query da requisição
      const VERIFY_TOKEN = 'Pizzaeacaibestfood';

      if (
        params['hub.mode'] === 'subscribe' &&
        params['hub.verify_token'] === VERIFY_TOKEN
      ) {
        return {
          statusCode: 200,
          body: params['hub.challenge'],
        };
      } else {
        return {
          statusCode: 400,
          body: 'Token de verificação inválido',
        };
      }
    }

    if (method === 'POST') { //Se o método for POST
      try {
        console.log('Webhook recebido:', JSON.stringify(body), 'Method:', method); //Retorna avisando que recebeu o webhook

        const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

        //VERIFICA SE EXISTE UMA MENSAGEM
        if (!message) {
            console.log('Mensagem não encontrada...');
            return { statusCode: 200, body: 'NO_MESSAGE_FOUND' };
        }

        //URLS
        const urlSiteBase = 'http://uicalendario.s3-website-us-east-1.amazonaws.com';
        const slugRemarcar = '/remarcar';
        const slugCancelar = '/cancelar';

        let etapaAtual = {id_mensagens: null, nome_mensagem: null, tipo: null, proxima_mensagem_id: null, caminho: null}; //Variavel para armazenar a etapa atual do número
        let etapaInfo = {id_mensagens: null, nome_mensagem: null, tipo: null, proxima_mensagem_id: null, caminho: null}; //Variavel para armazenar as informações da etapa atual
        let nextMessage = {id_mensagens: null, nome_mensagem: null, tipo: null, proxima_mensagem_id: null, caminho: null}; //Variavel para armazenar a próxima mensagem
        
        const senderNumber = message.from; //Número de quem enviou
        let numberInfo = await getNumberByNumber(senderNumber); //Dados do Número

        // SE NÃO EXISTIR O NÚMERO NO BANCO, CRIA UM REGISTRO PARA ELE
        if(numberInfo.id === null) {
          await insertNumber(senderNumber, null);
          numberInfo = await getNumberByNumber(senderNumber);

        } else { // SE EXISTIR, PEGA A ETAPA ATUAL
          etapaAtual = await getEtapa(senderNumber); // Pega a etapa do número atual
          etapaInfo = await getMessageById(etapaAtual.etapa); // Pega as informações da etapa atual

          if (etapaInfo.proxima_mensagem_id !== null && etapaInfo.proxima_mensagem_id !== '') { //Se a etapaInfo existir, e existir uma próxima mensagem
            nextMessage = await getMessageById(etapaInfo.proxima_mensagem_id);
          }
        }

        // SE A MENSAGEM ERA PARA SER UMA RESPOSTA A BOTÃO, MAS FOI UM TEXTO
        if((etapaInfo.tipo == 'button' || etapaInfo.tipo ==='list') && message.type == 'text'){
          const messageSelectOption = await getMessageById(-99);
          await sendTemplateMessage(messageSelectOption.nome_mensagem, messageSelectOption.caminho, senderNumber, {PHONE_NUMBER: senderNumber, URL_SITE: urlSiteBase});
          return { statusCode: 200, body: 'SELECT A OPTION' };
        }

        const idUserAtive = await getUserAtive(numberInfo.id);
        const utms = `?utm_source=whatsapp&idUser=${encodeURIComponent(idUserAtive.id_usuario)}`;

        const urlSite = `${urlSiteBase}${utms}`;

        if (message.interactive?.button_reply?.id || message.interactive?.list_reply?.id) { // Se existir um botão ou lista
          await ButtonMessage(message, senderNumber, etapaAtual, urlSiteBase, slugRemarcar, slugCancelar, utms);

        } else if((message.interactive?.button_reply || message.interactive?.list_reply) && !message.interactive?.button_reply?.id && !message.interactive?.list_reply?.id ) { //Se o "list reply" existir, mas o id da próxima mensagem ser nulo (ou seja, é a ultima mensagem)
          await ButtonMessageFinally(message, senderNumber, etapaAtual, urlSiteBase, slugRemarcar, slugCancelar, utms);

        } else if(message.text?.body) {

          if(etapaInfo.id_mensagens !== null){ //Se a etapa não estiver nula
            await TextMessage(message, senderNumber, etapaAtual, urlSiteBase, slugRemarcar, slugCancelar, utms);

          } else { //Se não existir uma etapa
            if (!numberInfo.etapa) { //Se a etapa não existir
              console.log('Usuário não existe ou etapa não existe');
              nextMessage = await getMessageById(1);

              await sendTemplateMessage(nextMessage.nome_mensagem, nextMessage.caminho, senderNumber, {PHONE_NUMBER: senderNumber,URL_SITE: urlSite});

              await updateEtapa(senderNumber, nextMessage.id_mensagens);
            }
          }

        } else if(message.type == 'image'){
          await Image(message, senderNumber, etapaAtual, idUserAtive, urlSiteBase, utms);
        }

        numberInfo = await getNumberByNumber(senderNumber);
        etapaInfo = await getMessageById(numberInfo.etapa);

        if(etapaInfo.tipo == 'text' && etapaInfo.proxima_mensagem_id === null){
          console.log('PROXIMA MSG É NULL, OU SEJA, É A ULTIMA');
          await updateEtapa(senderNumber, null);
          await updateStatus(numberInfo.id, 0, 'celular', 1)
        }

        return {
          statusCode: 200,
          body: 'EVENT_RECEIVED',
        };
      } catch (error) {
        console.error('Erro ao processar o evento:', error);
        return {
          statusCode: 200,
          body: 'ERROR_EVENT_RECEIVED',
        };
      } 
    }

  } catch{
    return {
      statusCode: 200,
      body: 'ERROR',
    };
  } finally {
    console.log('Finalizando...');
    return {
      statusCode: 200,
      body: 'OK',
    };
  }
};