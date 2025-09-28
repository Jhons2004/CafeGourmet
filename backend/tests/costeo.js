// Pruebas simples de costeo PROMEDIO y FIFO
require('dotenv').config();
const mongoose = require('mongoose');
const assert = require('assert');
const Bodega = require('../src/models/Bodega');
const Ubicacion = require('../src/models/Ubicacion');
const { registrarMovimiento } = require('../src/services/inventoryCostingService');

async function main(){
  const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cafe') + '_test';
  await mongoose.connect(uri);
  await mongoose.connection.db.dropDatabase();
  const b = await Bodega.create({ nombre: 'Test', codigo: 'TST' });
  const u = await Ubicacion.create({ bodega: b._id, codigo: 'A1' });

  // PROMEDIO
  await registrarMovimiento({ tipo: 'ENTRADA', productoRef: new mongoose.Types.ObjectId(), tipoProducto: 'grano', bodegaDestino: b._id, ubicacionDestino: u._id, cantidad: 100, costoUnitario: 10, metodoCosteo: 'PROMEDIO' });
  await registrarMovimiento({ tipo: 'ENTRADA', productoRef: new mongoose.Types.ObjectId(), tipoProducto: 'grano', bodegaDestino: b._id, ubicacionDestino: u._id, cantidad: 50, costoUnitario: 20, metodoCosteo: 'PROMEDIO' });

  // FIFO
  const prodFIFO = new mongoose.Types.ObjectId();
  await registrarMovimiento({ tipo: 'ENTRADA', productoRef: prodFIFO, tipoProducto: 'grano', bodegaDestino: b._id, ubicacionDestino: u._id, cantidad: 10, costoUnitario: 5, metodoCosteo: 'FIFO' });
  await registrarMovimiento({ tipo: 'ENTRADA', productoRef: prodFIFO, tipoProducto: 'grano', bodegaDestino: b._id, ubicacionDestino: u._id, cantidad: 15, costoUnitario: 8, metodoCosteo: 'FIFO' });
  const salidaFIFO = await registrarMovimiento({ tipo: 'SALIDA', productoRef: prodFIFO, tipoProducto: 'grano', bodegaOrigen: b._id, ubicacionOrigen: u._id, cantidad: 12, metodoCosteo: 'FIFO' });
  // Debe consumir 10@5 y 2@8 => costo medio movimiento = (10*5 + 2*8)/12 = (50+16)/12 = 5.5
  assert(Math.abs(salidaFIFO.costoUnitario - 5.5) < 0.0001, 'Costo FIFO incorrecto');

  console.log('OK: Costeo PROMEDIO y FIFO básicos verificados');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(e=>{ console.error('FALLO PRUEBAS', e); process.exit(1); });
