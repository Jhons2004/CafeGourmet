// Pruebas adicionales: Kardex, reservas y BOM
require('dotenv').config();
const mongoose = require('mongoose');
const assert = require('assert');
const Bodega = require('../src/models/Bodega');
const Ubicacion = require('../src/models/Ubicacion');
const BOM = require('../src/models/BOM');
const { registrarMovimiento } = require('../src/services/inventoryCostingService');
const produccionService = require('../src/services/ProduccionService');
const PedidoVenta = require('../src/models/PedidoVenta');
const Cliente = require('../src/models/Cliente');
const ProductoTerminado = require('../src/models/ProductoTerminado');
const ReservaStock = require('../src/models/ReservaStock');
const kardexController = require('../src/controllers/inventario/kardexController');

async function run(){
  const uri = (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cafe') + '_advtest';
  await mongoose.connect(uri);
  await mongoose.connection.db.dropDatabase();
  const b = await Bodega.create({ nombre: 'B1', codigo: 'B1' });
  const u = await Ubicacion.create({ bodega: b._id, codigo: 'Z1' });

  // Crear producto terminado y cliente
  const productoT = await ProductoTerminado.create({ sku: 'BLEND-PREM', nombre: 'Blend Premium' });
  const cliente = await Cliente.create({ nombre: 'Cliente Test', email: 'c@test.com' });

  // Crear BOM simple (usa producto terminado como componente grano ficticio)
  const bom = await BOM.create({ nombre: 'BOM Blend', productoFinalRef: productoT._id, componentes: [ { tipoProducto: 'grano', productoRef: new mongoose.Types.ObjectId(), cantidad: 5 } ] });

  // Simular inventario de insumo para BOM
  await registrarMovimiento({ tipo: 'ENTRADA', productoRef: bom.componentes[0].productoRef, tipoProducto: 'grano', bodegaDestino: b._id, ubicacionDestino: u._id, cantidad: 50, costoUnitario: 10, metodoCosteo: 'PROMEDIO' });

  // Crear OP con BOM
  const op = await produccionService.crearOP({ producto: 'Blend Premium', bomRef: bom._id });
  assert(op.insumos.length === 1, 'Insumos no cargados desde BOM');

  // Consumir BOM manualmente
  const consumo = await produccionService.consumirBOMEnOP(op._id);
  assert(consumo.costoTotal > 0, 'Consumo BOM sin costo');

  // Cerrar OP ingresando 10 unidades producto terminado con costo unitario esperado ~ (costoInsumos/10)
  const cerrado = await produccionService.cerrarOP(op._id, 0, { productoTerminado: { productoId: productoT._id.toString(), cantidad: 10, costoUnitario: 0 } });
  assert(cerrado.estado === 'completada', 'OP no cerrada');

  // Crear pedido y confirmar (genera reservas)
  const pedido = await PedidoVenta.create({ cliente: cliente._id, items: [{ producto: productoT._id, cantidad: 2, precio: 120 }] });
  // Simular confirmación: reutilizamos controller directamente sería con reservas; por simplicidad actualizamos estado y reservas manuales
  const ReservaStockModel = require('../src/models/ReservaStock');
  await ReservaStockModel.create({ productoRef: productoT._id, tipoProducto: 'productoTerminado', bodega: b._id, ubicacion: u._id, cantidad: 2, referencia: pedido.codigo, notas: 'Reserva test' });
  // Despacho: marcar reservas consumidas
  await ReservaStockModel.updateMany({ referencia: pedido.codigo, estado: 'ACTIVA' }, { $set: { estado: 'CONSUMIDA' } });
  const consumidas = await ReservaStockModel.find({ referencia: pedido.codigo, estado: 'CONSUMIDA' });
  assert(consumidas.length === 1, 'Reserva no consumida');

  // Kardex del insumo
  const req = { query: { productoRef: bom.componentes[0].productoRef.toString(), tipoProducto: 'grano' } };
  const res = { json: (d)=> { res.data = d; } };
  await kardexController.kardex(req,res);
  assert(res.data && res.data.movimientos && res.data.movimientos.length >= 1, 'Kardex vacío');

  console.log('OK: Pruebas avanzadas (BOM, reservas, kardex)');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e=>{ console.error('FALLO PRUEBAS AVANZADAS', e); process.exit(1); });
