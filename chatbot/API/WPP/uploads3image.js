
const AWS = require('aws-sdk');
const s3 = new AWS.S3();


async function uploadS3(buffer, nome, mimetype) {
  console.log('uploadS3 -> Buffer: ', buffer, 'nome: ', nome, 'mimetype: ', mimetype);
  const params = {
    Bucket: process.env.BUCKET_NAME, 
    Key: nome,                       
    Body: buffer,                    
    ContentType: mimetype,           
  };

  try {
    const response = await s3.upload(params).promise();
    console.log(`✅ Upload realizado com sucesso: ${response.Location}`);
    return response.Location;
  } catch (err) {
    console.error('❌ Erro ao fazer upload para o S3:', err.message);
    return { error: err.message };
  }
}

module.exports = { uploadS3 };