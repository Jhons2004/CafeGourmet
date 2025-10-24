require('dotenv').config();
const mongoose = require('mongoose');
const assert = require('assert');
const Bodega = require('../src/models/Bodega');
const Ubicacion = require('../src/models/Ubicacion');
const Lote = require('../src/models/Lote');
const { registrarMovimiento } = require('../src/services/inventoryCostingService');

async function run(){
  const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cafe') + '_fefo';
  await mongoose.connect(uri);
  await mongoose.connection.db.dropDatabase();
  const b = await Bodega.create({ nombre: 'B1', codigo: 'B1' });
  const u = await Ubicacion.create({ bodega: b._id, codigo: 'U1' });
  const prod = new mongoose.Types.ObjectId();
  const hoy = new Date();
  const lote1 = await Lote.create({ tipoProducto: 'grano', productoRef: prod, fechaCaducidad: new Date(hoy.getTime()+ 5*24*60*60*1000) });
  const lote2 = await Lote.create({ tipoProducto: 'grano', productoRef: prod, fechaCaducidad: new Date(hoy.getTime()+ 10*24*60*60*1000) });
  // Entradas por lote
  await registrarMovimiento({ tipo: 'ENTRADA', productoRef: prod, tipoProducto: 'grano', loteRef: lote1._id, bodegaDestino: b._id, ubicacionDestino: u._id, cantidad: 10, costoUnitario: 5, metodoCosteo: 'PROMEDIO' });
  await registrarMovimiento({ tipo: 'ENTRADA', productoRef: prod, tipoProducto: 'grano', loteRef: lote2._id, bodegaDestino: b._id, ubicacionDestino: u._id, cantidad: 10, costoUnitario: 6, metodoCosteo: 'PROMEDIO' });
  // Salida sin especificar lote => debe elegir lote1 (FEFO)
  const salida = await registrarMovimiento({ tipo: 'SALIDA', productoRef: prod, tipoProducto: 'grano', bodegaOrigen: b._id, ubicacionOrigen: u._id, cantidad: 5, metodoCosteo: 'PROMEDIO' });
  assert(String(salida.loteRef) === String(lote1._id), 'FEFO no seleccionó el lote más próximo a caducar');
  // Crear lote expirado y entrada
  const loteExp = await Lote.create({ tipoProducto: 'grano', productoRef: prod, fechaCaducidad: new Date(hoy.getTime() - 24*60*60*1000) });
  await registrarMovimiento({ tipo: 'ENTRADA', productoRef: prod, tipoProducto: 'grano', loteRef: loteExp._id, bodegaDestino: b._id, ubicacionDestino: u._id, cantidad: 3, costoUnitario: 7, metodoCosteo: 'PROMEDIO' });
  let errorCatched = false;
  try {
    await registrarMovimiento({ tipo: 'SALIDA', productoRef: prod, tipoProducto: 'grano', loteRef: loteExp._id, bodegaOrigen: b._id, ubicacionOrigen: u._id, cantidad: 1, metodoCosteo: 'PROMEDIO' });
  } catch(e){ errorCatched = e.message.includes('Lote caducado'); }
  assert(errorCatched, 'No bloqueó salida de lote caducado');
  console.log('OK: Pruebas FEFO / caducidad');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e=>{ console.error('FALLO FEFO', e); process.exit(1); });
