/**
 * Script para verificar los datos en la base de datos
 */

const mongoose = require('mongoose');
require('dotenv').config();

const ProductoTerminado = require('./src/models/ProductoTerminado');
const StockProducto = require('./src/models/StockProducto');
const Cliente = require('./src/models/Cliente');
const PedidoVenta = require('./src/models/PedidoVenta');
const Factura = require('./src/models/Factura');
const Proveedor = require('./src/models/Proveedor');
const OrdenCompra = require('./src/models/OrdenCompra');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cafe_gourmet';

async function verificarDatos() {
  try {
    console.log('🔌 Conectando a MongoDB...\n');
    await mongoose.connect(MONGODB_URI);

    const productos = await ProductoTerminado.countDocuments();
    const stock = await StockProducto.countDocuments();
    const clientes = await Cliente.countDocuments();
    const pedidos = await PedidoVenta.countDocuments();
    const facturas = await Factura.countDocuments();
    const proveedores = await Proveedor.countDocuments();
    const ordenes = await OrdenCompra.countDocuments();

    console.log('════════════════════════════════════════');
    console.log('📊 RESUMEN DE DATOS EN LA BASE DE DATOS');
    console.log('════════════════════════════════════════');
    console.log(`📦 Productos Terminados:    ${productos}`);
    console.log(`📊 Registros de Stock:      ${stock}`);
    console.log(`👥 Clientes:                ${clientes}`);
    console.log(`🏭 Proveedores:             ${proveedores}`);
    console.log(`🧾 Órdenes de Compra:       ${ordenes}`);
    console.log(`💳 Pedidos de Venta:        ${pedidos}`);
    console.log(`🧾 Facturas:                ${facturas}`);
    console.log('════════════════════════════════════════');
    console.log(`📊 TOTAL:                   ${productos + stock + clientes + proveedores + ordenes + pedidos + facturas}`);
    console.log('════════════════════════════════════════\n');

    // Mostrar algunos productos con stock
    if (productos > 0) {
      console.log('📦 PRIMEROS 10 PRODUCTOS:');
      console.log('═══════════════════════════════════════');
      const prods = await ProductoTerminado.find().limit(10);
      for (const p of prods) {
        const stockDoc = await StockProducto.findOne({ producto: p._id });
        const cantidadStock = stockDoc ? stockDoc.cantidad : 0;
        console.log(`  ${p.sku} - ${p.nombre} (${p.unidad}) | Stock: ${cantidadStock}`);
      }
      console.log('');
    }

    // Mostrar algunos clientes
    if (clientes > 0) {
      console.log('👥 PRIMEROS 5 CLIENTES:');
      console.log('═══════════════════════════════════════');
      const clients = await Cliente.find().limit(5);
      for (const c of clients) {
        console.log(`  ${c.nombre} - ${c.email} | RUC: ${c.ruc}`);
      }
      console.log('');
    }

    // Mostrar algunos pedidos
    if (pedidos > 0) {
      console.log('💳 PRIMEROS 5 PEDIDOS:');
      console.log('═══════════════════════════════════════');
      const peds = await PedidoVenta.find().populate('cliente').limit(5);
      for (const p of peds) {
        console.log(`  ${p.codigo} - Cliente: ${p.cliente?.nombre || 'N/A'} | Estado: ${p.estado} | Total: $${p.total}`);
      }
      console.log('');
    }

    console.log('✅ Verificación completada\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

verificarDatos();
