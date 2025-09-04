const { sendTemplateMessage } = require('../API/WPP/sendTemplate');

const {
    getMessageById,
    updateEtapa,
    getUserByCPF,
    insertUsers,
    updateStatus,
    updateUser,
    getNumberByNumber
} = require('../DB/indexDB');

async function Cadastro(type, message, numberInfo, nextMessage, senderNumber, urlSiteBruto, utms){

    const urlSite = `${urlSiteBruto}${utms}`;
    
    if(type == 'verify'){
        console.log('ETAPA É VERIFY');
        const rawCpf = message.text.body.replace(/\D/g, ''); // Remove tudo que não for número

        if(rawCpf.length !== 11) { //VERIFICA SE O CPF TEM OS 11 DIGITOS
            console.log('CPF INVÁLIDO');

            const WrongCpfID = -98; //ID DA MENSAGEM "wrongCPF"
            nextMessage = await getMessageById(WrongCpfID); 

            await sendTemplateMessage(nextMessage.nome_mensagem, nextMessage.caminho, senderNumber, {PHONE_NUMBER: senderNumber,URL_SITE: urlSite}); //Envia a próxima mensagem
            return {
                statusCode: 400,
                body: 'CPF inválido. Por favor, insira os 11 números do CPF.'
            };
        }
        
        const user = await getUserByCPF(rawCpf);

        if(!user.id_usuario){ //Se o cpf não existir
            await insertUsers(null, rawCpf, numberInfo.id, 1) //Cria o usuário com o número, o cpf
            
            nextMessage = await getMessageById(10); // Busca a mensagem "completeName" que inicia o cadastro

        }

        await updateStatus(rawCpf, 1, 'cpf', 0);
        
    } else if(type == 'completeName'){
        console.log('ETAPA É completeName');
        await updateUser(numberInfo.id, message.text.body, 'nome') //atualiza a coluna 'nome'

    } else if(type == 'cpf'){
        console.log('ETAPA É CPF');
        await updateUser(numberInfo.id, message.text.body, 'cpf') //Atualiza o cpf do usuário

    } else if(type == 'data_nascimento'){
        console.log('ETAPA É Data de Nascimento');
        await updateUser(numberInfo.id, message.text.body, 'data_nascimento') //Atualiza a data de nascimento do usuário
    
    } else if(type == 'rua'){
        console.log('ETAPA É RUA');
        await updateUser(numberInfo.id, message.text.body, 'rua') //Atualiza a rua do usuário
    
    } else if(type == 'numero'){
        console.log('ETAPA É NUMERO');
        await updateUser(numberInfo.id, message.text.body, 'numero') //Atualiza o numero do usuário
    
    } else if(type == 'bairro'){
        console.log('ETAPA É BAIRRO');
        await updateUser(numberInfo.id, message.text.body, 'bairro') //Atualiza o bairro do usuário
    
    } else if(type == 'cidade'){
        console.log('ETAPA É CIDADE');
        await updateUser(numberInfo.id, message.text.body, 'cidade') //Atualiza a cidade do usuário
    
    } else if(type == 'estado'){
        console.log('ETAPA É ESTADO');
        await updateUser(numberInfo.id, message.text.body, 'estado') //Atualiza o estado do usuário
    
    } else if(type == 'cep'){
        console.log('ETAPA É CEP');
        await updateUser(numberInfo.id, message.text.body, 'cep') //Atualiza o cep do usuário
    
    } else if(type == 'telefone'){
        console.log('ETAPA É TELEFONE');
        await updateUser(numberInfo.id, message.text.body, 'telefone') //Atualiza o telefone do usuário
    
    } else if(type == 'email'){
        console.log('ETAPA É EMAIL');
        await updateUser(numberInfo.id, message.text.body, 'email') //Atualiza o email do usuário
    
    }
    
    await sendTemplateMessage(nextMessage.nome_mensagem, nextMessage.caminho, senderNumber, {PHONE_NUMBER: senderNumber,URL_SITE: urlSite}); //Envia a próxima mensagem
    await updateEtapa(senderNumber, nextMessage.id_mensagens);
}

async function TextMessage(message, senderNumber, etapaAtual, urlSiteBruto, slugRemarcar, slugCancelar, utms) {
    console.log('Texto recebido:', message.text.body);

    const numberInfo = await getNumberByNumber(senderNumber);
    const etapaInfo = await getMessageById(etapaAtual.etapa);
    let nextMessage = await getMessageById(etapaInfo.proxima_mensagem_id);

    const etapasDeVerificacao = [
        'verifyRegisterConsulta',
        'verifyRegisterCAC',
        'verifyRegisterAgendamentos'
    ];

    if (etapasDeVerificacao.includes(etapaInfo.nome_mensagem)) { //Se a mensagem atual for de verificação
        await Cadastro('verify', message, numberInfo, nextMessage, senderNumber, urlSiteBruto, utms);

    } else if(etapaInfo.nome_mensagem == 'completeName'){ //Se a etapa atual for "completeName"
        await Cadastro('completeName', message, numberInfo, nextMessage, senderNumber, urlSiteBruto, utms);

    } else if(etapaInfo.nome_mensagem == 'CPF'){ //Se a etapa atual for "CPF"
        await Cadastro('cpf', message, numberInfo, nextMessage, senderNumber, urlSiteBruto, utms);

    }

    return { statusCode: 200, body: 'Message Send' };
}

module.exports = { TextMessage };
