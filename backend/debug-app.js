// Script de depuración simple (solo operaciones de inventario avanzado)
require('dotenv').config();
const mongoose = require('mongoose');
const Bodega = require('./src/models/Bodega');
const Ubicacion = require('./src/models/Ubicacion');
const { registrarMovimiento } = require('./src/services/inventoryCostingService');

async function run(){
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cafe';
  await mongoose.connect(uri);
  console.log('Mongo conectado');
  let b = await Bodega.findOne({ codigo: 'TEST' });
  if(!b){ b = await Bodega.create({ nombre: 'Test Bodega', codigo: 'TEST' }); }
  let u = await Ubicacion.findOne({ bodega: b._id, codigo: 'U1' });
  if(!u){ u = await Ubicacion.create({ bodega: b._id, codigo: 'U1' }); }
  console.log('Bodega:', b.codigo, 'Ubicacion:', u.codigo);
  const entrada = await registrarMovimiento({ tipo: 'ENTRADA', productoRef: new mongoose.Types.ObjectId('000000000000000000000000'), tipoProducto: 'grano', bodegaDestino: b._id, ubicacionDestino: u._id, cantidad: 50, costoUnitario: 20, metodoCosteo: 'PROMEDIO', notas: 'Debug entrada'});
  console.log('Entrada costoPromedio:', entrada.costoUnitario);
  const salida = await registrarMovimiento({ tipo: 'SALIDA', productoRef: entrada.productoRef, tipoProducto: 'grano', bodegaOrigen: b._id, ubicacionOrigen: u._id, cantidad: 10, metodoCosteo: 'PROMEDIO', notas: 'Debug salida'});
  console.log('Salida costoUnitario aplicado:', salida.costoUnitario);
  await mongoose.disconnect();
  console.log('FIN DEBUG');
}

run().catch(e=>{ console.error(e); process.exit(1); });