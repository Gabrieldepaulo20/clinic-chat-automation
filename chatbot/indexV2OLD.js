//VER DE RESETAR A ETAPA NO BANCO DPS DE UM CERTO TEMPO
//QUANDO ETAPA FINAL (NULL), NÃO COLOCA O CAMPO ETAPA DO USUÁRIO COMO NULO

const mysql = require('mysql2/promise');
const { sendTemplateMessage } = require('./API/WPP/sendTemplate');
const { getImageByIDWPP } = require('./API/WPP/getImageByIDWPP');
const { downloadImage } = require('./API/WPP/downloadImage');

const {
  ConnectDB,
  getEtapa,
  getMessage,
  getMessageById,
  getMessageByName,
  getUserByCPF,
  getUserByNumber,
  insertUsers,
  updateEtapa,
  updateStatus,
  updateUser,
  upsertMessage,
  showTablesTESTE
} = require('./DB/indexDB');

exports.handler = async (event) => {
  // await showTablesTESTE();
  // console.log('{ statusCode: 200, body: CODE_INATIVE }');
  //  return { statusCode: 200, body: 'CODE_INATIVE' };

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
    console.log('Webhook recebido:', JSON.stringify(body), 'Method:', method); //Retorna avisando que recebeu o webhook
    
    //URLS
    const urlRemarcar = 'https://site.com/remarcar';
    const urlCancelar = 'https://site.com/cancelar';
    const urlSite = 'https://site.com/';

    //VERIFICA SE EXISTE UMA MENSAGEM
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
        console.log('Mensagem não encontrada...');
        return { statusCode: 200, body: 'NO_MESSAGE_FOUND' };
    } else {
        console.log('Mensagens recebidas:', message); //Retorna no log as mensagens recebidas
    }

    const sender = message.from; //Número de quem enviou

    //VERIFICA SE O NÚMERO EXISTE NO BANCO, SE NÃO, CRIA UM REGISTRO PARA ELE
    const checkUser = await getUserByNumber(sender)
    if(!checkUser){
      await insertUsers(null, null, sender, null);
    }

    let userData = await getUserByNumber(sender); //Pega no banco as informações do usuário

    let etapaAtual = null;
    let etapaInfo = null; 

    if(userData && userData.etapa_id !== undefined){
      etapaAtual = userData.etapa_id;
      etapaInfo = await getMessageById(etapaAtual);
    }

    if (message.interactive?.button_reply?.id || message.interactive?.list_reply?.id) { //Se existir um botão ou lista
        console.log('Botão ou lista recebido:', message.interactive);
        const replyId = message.interactive.button_reply?.id || message.interactive.list_reply?.id; //pega a id da escolha do usuário

        // Busca a mensagem no banco usando o reply.id
        const messageData = await getMessageById(replyId);

        const user = await getUserByNumber(sender);
        let etapa_id = null;

        if(user){
          etapa_id = user.etapa_id;
        }

        if(etapa_id && etapa_id == 6){
          if(message.interactive.button_reply?.title == 'SIM'){
            await sendTemplateMessage(messageData.nome_mensagem, messageData.caminho, sender, {PHONE_NUMBER:sender,URL_SITE:urlRemarcar});
          } else {
            await sendTemplateMessage(messageData.nome_mensagem, messageData.caminho, sender, {PHONE_NUMBER:sender,URL_SITE:urlCancelar});
          }
        } else {

        await sendTemplateMessage(messageData.nome_mensagem, messageData.caminho, sender, {PHONE_NUMBER: sender,URL_SITE: urlSite});

        }
        // Atualiza a etapa do usuário no banco
        await updateEtapa(sender, messageData.id_mensagens);

    } else if((message.interactive?.button_reply || message.interactive?.list_reply) && !message.interactive?.button_reply?.id && !message.interactive?.list_reply?.id ) { //Se o "list reply" existir, mas o id da próxima mensagem ser nulo (ou seja, é a ultima mensagem)
        console.log('Botão ou lista recebido:', message.interactive);

        const messageData = await getMessageById(1); //Busca a Primeira mensagem a "welcomeButton" (1 = welcomeButton)
        
        await sendTemplateMessage(messageData.nome_mensagem, messageData.caminho, sender, {PHONE_NUMBER: sender,URL_SITE: urlSite});

        await updateEtapa(sender, messageData.id_mensagens);

    } else if(message.text?.body) {
        console.log('Texto recebido:', message.text.body);

        if(etapaInfo){ //Se existir uma etapa
            if(etapaInfo.nome_mensagem == 'verifyRegisterConsulta' || etapaInfo.nome_mensagem == 'verifyRegisterCAC' || etapaInfo.nome_mensagem == 'verifyRegisterAgendamentos' ){ //Se a mensagem atual for de verificação
                console.log('ETAPA É VERIFY');
                const user = await getUserByCPF(message.text.body);

                let nextMessage;
                if(!user){ //Se o cpf não existir
                    await updateUser(sender, message.text.body, 'cpf');
                    //await insertUsers(null, message.text.body, sender, 10) //Cria o usuário com o número, o cpf e a etapa
                    nextMessage = await getMessageById(10); // Busca a mensagem "completeName" que inicia o cadastro
                    await updateEtapa(sender, nextMessage.id_mensagens);
                    //COLOCA O STATUS DO USUÁRIO COMO ATIVO
                    await updateStatus(message.text.body, 1, 'cpf')

                } else { //Se o cpf exitir, pega a próxima mensagem
                    nextMessage = await getMessageById(etapaInfo.proxima_mensagem_id);
                    await updateEtapa(sender, etapaInfo.proxima_mensagem_id);

                }

                await sendTemplateMessage(nextMessage.nome_mensagem, nextMessage.caminho, sender, {PHONE_NUMBER: sender,URL_SITE: urlSite}); //Envia a próxima mensagem

            } else if(etapaInfo.nome_mensagem == 'completeName'){ //Se a etapa atual for "completeName"
                console.log('ETAPA É completeName');
                await updateUser(sender, message.text.body, 'nome') //atualiza a coluna 'nome'
                await updateEtapa(sender, etapaInfo.proxima_mensagem_id);
                const proxMensagem = await getMessageById(etapaInfo.proxima_mensagem_id);
                console.log(proxMensagem);
                await sendTemplateMessage(proxMensagem.nome_mensagem, proxMensagem.caminho, sender, {PHONE_NUMBER: sender,URL_SITE: urlSite});

            } else if(etapaInfo.nome_mensagem == 'CPF'){ //Se a etapa atual for "CPF"
                console.log('ETAPA É CPF');
                await updateUser(sender, message.text.body, 'cpf') //Atualiza o cpf do usuário
                await updateEtapa(sender, etapaInfo.proxima_mensagem_id);
                const proxMensagem = await getMessageById(etapaInfo.proxima_mensagem_id);
                await sendTemplateMessage(proxMensagem.nome_mensagem, proxMensagem.caminho, sender, {PHONE_NUMBER: sender,URL_SITE: urlSite});
            } 


        } else {
            if (!userData || !userData.etapa_id) { //Se o usuário não existir, ou a etapa dele estiver como nula
              console.log('Usuário não existe ou etapa não existe');
                const messageData = await getMessageById(1);

                await sendTemplateMessage(messageData.nome_mensagem, messageData.caminho, sender, {PHONE_NUMBER: sender,URL_SITE: urlSite});

                if(userData){
                  await updateEtapa(sender, messageData.id_mensagens);
                }
            }
        }


        userData = await getUserByNumber(sender);
        if(userData && (userData.etapa_id === undefined || userData.etapa_id === null)){
          await updateStatus(sender, 0, 'celular')
        }

    } else if(message.type === 'image'){
      console.log('Imagem recebida:', message.image);
      const metaDataImage = await downloadImage(await getImageByIDWPP(message.image.id));

      if(etapaInfo.nome_mensagem == 'indicacao_sim') {

      } else if(etapaInfo.nome_mensagem == 'plano_sim') {

      }
      
      await updateEtapa(sender, etapaInfo.proxima_mensagem_id);
      
      const nextMessage = await getMessageById(etapaInfo.proxima_mensagem_id);
      if(etapaInfo){
        await sendTemplateMessage(nextMessage.nome_mensagem, nextMessage.caminho, sender, {PHONE_NUMBER: sender, URL_SITE: urlSite});
      }
 
    }

    userData = await getUserByNumber(sender);
    etapaAtual = userData.etapa_id;
    etapaInfo = await getMessageById(etapaAtual);

    if(etapaInfo.tipo == 'text' && (etapaInfo.proxima_mensagem_id === undefined || etapaInfo.proxima_mensagem_id === null)){
      console.log('ETAPA É NULL OU SEJA, É A ULTIMA');
      await updateEtapa(sender, null);
    }

    return {
      statusCode: 200,
      body: 'EVENT_RECEIVED',
    };
  }

  return {
    statusCode: 200,
    body: 'Rota não encontrada',
  };
};