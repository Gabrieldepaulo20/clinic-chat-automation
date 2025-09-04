const AWS = require('aws-sdk');
const s3 = new AWS.S3();


async function deleteS3(s3Url) {
  try {
    const bucketName = process.env.chatbotwhatss3;
    const key = s3Url.split(`${bucketName}/`)[1]; 

    if (!key) {
      console.error('❌ Key não encontrado para deletar a imagem.');
      return false;
    }

    console.log(`🗑️ Removendo arquivo: ${key} do bucket: ${bucketName}`);

    // 🔹 Parâmetros para exclusão
    const params = {
      Bucket: bucketName,
      Key: key
    };

    // 🔹 Executa a exclusão no S3
    await s3.deleteObject(params).promise();
    console.log('✅ Imagem deletada com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao deletar imagem do S3:', error.message);
    return false;
  }
}

module.exports = deleteS3;