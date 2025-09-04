const fs = require('fs');
const path = require('path');

async function getImageByIDWPP(idImage) {
  console.log('idImage:', idImage);

  const url = `https://graph.facebook.com/v22.0/${idImage}`;
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
    const res = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('→ fetch status:', res.status, res.statusText);
    const data = await res.json();
    console.log('→ metadata response:', data);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
    }

    const mediaUrl = data.url;
    console.log('→ media URL:', mediaUrl);

    return mediaUrl;
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

module.exports = { getImageByIDWPP };
