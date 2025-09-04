const mysql = require('mysql2/promise');
const { sendTemplateMessage } = require('./API/WPP/sendTemplate');
const {
  ConnectDB,
  showTablesTESTE,
  getUserByCPF,
  createUser,
  insertUsers,
  getUserByNumber,
  updateEtapa,
  getMessageByName,
  getMessageById,
  upsertMessage,
} = require('./DB/indexDB');


exports.handler = async (event) => {
  const tabelas = await showTablesTESTE();
  // await upsertMessage({nome_mensagem:'plano_sim', caminho:'Cadastro', tipo: 'text', proxima_mensagem_id:12});
  // await upsertMessage({nome_mensagem:'indicacao_sim', caminho:'Cadastro', tipo: 'text', proxima_mensagem_id:13});
  return;
  // const cpf = await getUserByNumber('55169811067');
  // if(!cpf || cpf.toString().trim() === ''){
  //   return 'Vazio';
  // }
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify(tabelas, null, 2),
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // };

  const body = JSON.parse(event.body); //"Parseia" o body para JSON

  //IGNORA MENSAGENS DE STATUS
  if (body.entry?.[0]?.changes?.[0]?.value?.statuses) { //Verifica se "statuses" existe, se existir, ignora
    console.log('Recebido evento de status, ignorando...');
    return {
      statusCode: 200,
      body: 'STATUS_IGNORED',
    };
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

    // //CONNECTA COM O BANCO
    // let connection;
    // try {
    //   connection = await connectDB();
    //   console.log('Conexão com o banco estabelecida.');
    // } catch (err) {
    //   console.error('Erro ao conectar ao banco "ChatbotBD":', err);
    //   return {
    //     statusCode: 500,
    //     body: 'Erro ao conectar ao banco de dados',
    //   };
    // }

    //PROCESSA A MENSAGEM
    try {
      const entry = body.entry?.[0]; //Recebe o "entry" do body em json
      const changes = entry?.changes?.[0]; //Recebe o "changes" do entry
      const messages = changes?.value?.messages; //Recebe o "messages" do changes.value
      console.log('Mensagens recebidas:', messages); //Retorna no log as mensagens recebidas

      // Se houver uma mensagem
      if (messages && messages.length > 0) {
        console.log('Ha messages no objeto');
        const message = messages[0];
        const sender = message.from;

        //SE FOR UMA RESPOSTA A UM BOTÃO OU LISTA
        if(messages[0].interactive?.list_reply?.id || messages[0].interactive?.button_reply?.id){
          if(messages[0].interactive?.list_reply?.id){
            const nexMessage = getMessageByName(messages[0].interactive?.list_reply?.id);
          } else {
            const nexMessage = getMessageByName(messages[0].interactive?.button_reply?.id);
          }
          await sendTemplateMessage(nextMessage.nome_mensagem, nextMessage.caminho, sender);
          await updateEtapa(sender, nextMessage.proxima_mensagem_id);
        } else if(messages[0].type == 'text'){ // SE FOR UM TEXTO
          const user = await getUserByNumber(sender);
          const actualMessage = await getMessage(user.id_etapa);
          if(actualMessage.nome_mensagem == 'completeName'){ 
            insertUser('messages[0].text.body', null, sender, actualMessage.proxima_mensagem_id)
            
          } else if(actualMessage.nome_mensagem == 'CPF'){
            updateUser(sender, 'messages[0].text.body', 'cpf', actualMessage.proxima_mensagem_id)
            
          } else if(actualMessage.nome_mensagem == 'verifyRegisterConsulta' || actualMessage.nome_mensagem == 'verifyRegisterCAC' || actualMessage.nome_mensagem == 'verifyRegisterAgendamentos' ){
            const user = await getUserByNumber(sender);
            if(!user || user.toString().trim() === ''){
              const nexMessage = getMessageByName('completeName');
              await sendTemplateMessage(nextMessage.nome_mensagem, nextMessage.caminho, sender);
              await updateEtapa(sender, nextMessage.id_mensagens);
            }
    
          }
          if(!actualMessage.proxima_mensagem_id || actualMessage.proxima_mensagem_id.toString().trim() === ''){
            return;
          } else {
            await sendTemplateMessage(actualMessage.proxima_mensagem_id, actualMessage.caminho, sender);
          }
        }

        //COLOCAR AQUI UMA VERIFICAÇÃO NO BANCO PARA O NÚMERO, PARA ASSIM VERIFICAR A ETAPA DESTE NÚMERO
        const userFound = await getUserByNumber(sender);
        if(!userFound || userFound.toString().trim() === ''){
          await sendTemplateMessage('welcomeButton', 'Welcome', sender);
        } else {
          const currentMessage = await getMessage(userFound.id_etapa);
          const nextMessage = await getMessage(currentMessage.proxima_mensagem_id);
          await sendTemplateMessage(nextMessage.nome_mensagem, nextMessage.caminho, sender);
          await updateEtapa(sender, nextMessage.id_mensagens);
        }
        // Se não for botão ou uma lista, chama a função externa
        // if (message.type !== 'button' && message.type !== 'list' && message.type !== 'interactive') { //Verifica se não é um botão/lista/ interação
        //   console.log('Not a response button'); //Imprime que não foi uma resposta em um botão
        //   try {
        //     await sendTemplateMessage('welcomeButton', sender);
        //   } catch (err) {
        //     console.error('Erro ao enviar mensagem template:', err.message, '\n', 'Template: ', 'welcomeButton');
        //   }
        // } else { //Caso seja um botão/lista/interação
        //   console.log('Response button'); //Imprime no log que foi uma resposta a um botão
        //   try {
        //     await sendTemplateMessage('verifyRegister', sender);
        //   } catch (err) {
        //     console.error('Erro ao enviar mensagem template:', err.message, '\n', 'Template: ', 'welcomeButton');
        //   }
        // }
      }
    } catch (err) {
      console.error('Erro ao processar mensagem:', err);
      return {
        statusCode: 500,
        body: 'Erro ao processar mensagem',
      };
    }

    //Encerra conexão com o banco
    await connection.end();
    return {
      statusCode: 200,
      body: 'EVENT_RECEIVED',
    };
  }

  return {
    statusCode: 404,
    body: 'Rota não encontrada',
  };
};