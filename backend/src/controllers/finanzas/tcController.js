const fetch = require('node-fetch');

// Cache simple en memoria con TTL
let cache = { value: null, exp: 0 };
const TTL_MS = 2 * 60 * 60 * 1000; // 2 horas

// URL del servicio SOAP de Banguat (TipoCambioDia)
const BANGUAT_URL = 'https://www.banguat.gob.gt/variables/ws/TipoCambio.asmx?wsdl';
// Nota: El WSDL contiene definición; el endpoint real de operación es
// https://www.banguat.gob.gt/variables/ws/TipoCambio.asmx

async function fetchTipoCambio() {
  // Armamos un request SOAP básico para la operación TipoCambioDia
  const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <TipoCambioDia xmlns="http://www.banguat.gob.gt/variables/ws/" />
    </soap:Body>
  </soap:Envelope>`;

  const resp = await fetch('https://www.banguat.gob.gt/variables/ws/TipoCambio.asmx', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://www.banguat.gob.gt/variables/ws/TipoCambioDia'
    },
    body: soapEnvelope
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const xml = await resp.text();

  // Parseo simple del XML: buscamos <referencia> o <venta> según respuesta
  // Ejemplo de nodo: <referencia>7.86</referencia>
  const refMatch = xml.match(/<referencia>([^<]+)<\/referencia>/i);
  const ventaMatch = xml.match(/<venta>([^<]+)<\/venta>/i);
  const compraMatch = xml.match(/<compra>([^<]+)<\/compra>/i);
  const fechaMatch = xml.match(/<fecha>([^<]+)<\/fecha>/i);

  const data = {
    referencia: refMatch ? Number(refMatch[1]) : null,
    venta: ventaMatch ? Number(ventaMatch[1]) : null,
    compra: compraMatch ? Number(compraMatch[1]) : null,
    fecha: fechaMatch ? fechaMatch[1] : null,
    fuente: 'Banguat SOAP TipoCambioDia'
  };

  if (!data.referencia && !data.venta) throw new Error('No se pudo parsear tipo de cambio');
  return data;
}

async function getTipoCambioCached(force = false) {
  const now = Date.now();
  if (!force && cache.value && cache.exp > now) return cache.value;
  const val = await fetchTipoCambio();
  cache = { value: val, exp: now + TTL_MS };
  return val;
}

async function getTipoCambioCached(force = false) {
  const now = Date.now();
  if (!force && cache.value && cache.exp > now) return cache.value;
  const val = await fetchTipoCambio();
  cache = { value: val, exp: now + TTL_MS };
  return val;
}

module.exports = {
  obtener: async (req, res) => {
    try {
      const force = req.query.force === '1' || req.query.force === 'true';
      const data = await getTipoCambioCached(force);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
  getCached: getTipoCambioCached,
  // Para usar en arranque del servidor (precalentamiento)
  precalentar: async () => {
    try { await getTipoCambioCached(true); }
    catch (e) { console.warn('No se pudo precargar tipo de cambio:', e.message); }
  },
  // Para scheduler interno cada 2h
  schedule: () => {
    setInterval(async ()=>{
      try { await getTipoCambioCached(true); }
      catch (e) { console.warn('Refresh tipo de cambio falló:', e.message); }
    }, TTL_MS);
  }
};
