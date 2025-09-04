async function downloadImage(urlImage) {
  console.log('urlImage: ', urlImage);

  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const controller = new AbortController();
  const timeout = 20000; // 20 segundos

  const timeoutId = setTimeout(() => {
    console.warn('Timeout atingido. Abortando requisição...');
    controller.abort();
  }, timeout);

  try {
    const res = await fetch(urlImage, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('→ fetch status:', res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Erro no download:', res.status, errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('→ imagem baixada, tamanho:', buffer.length, 'bytes');
    console.log('→ metadata da imagem:', buffer);

    return buffer;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Requisição abortada por timeout.');
      return null;
    } else {
      console.error('Erro inesperado:', error);
      throw error;
    }
  }
}

module.exports = { downloadImage };
