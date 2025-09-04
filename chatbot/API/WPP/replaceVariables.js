async function replaceVariables(template, variables) {
    // Transforma o template JSON em string
    let jsonString = JSON.stringify(template);
  
    // Para cada chave e valor passado
    for (const [key, value] of Object.entries(variables)) {
      // Cria uma expressão regular para localizar a variável no formato {{VARIAVEL}}
      const regex = new RegExp(`{{${key}}}`, 'g');
      // Substitui todas ocorrências no JSON
      jsonString = jsonString.replace(regex, value);
    }
  
    // Converte de volta para objeto JSON
    return JSON.parse(jsonString);
  }
  
  module.exports = { replaceVariables };
  