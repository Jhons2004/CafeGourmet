/**
 * Script para insertar datos de prueba en módulo de Finanzas
 * Inserta 50 registros de CxP y CxC
 */

const mongoose = require('mongoose');
require('dotenv').config();

const CuentaPorPagar = require('./src/models/CuentaPorPagar');
const CuentaPorCobrar = require('./src/models/CuentaPorCobrar');
const Proveedor = require('./src/models/Proveedor');
const Cliente = require('./src/models/Cliente');
const OrdenCompra = require('./src/models/OrdenCompra');
const Factura = require('./src/models/Factura');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cafe_gourmet';

// Utilidades
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDate = (daysBack = 180) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
};

const formasPago = ['efectivo', 'transferencia', 'cheque', 'tarjeta'];
const monedas = ['GTQ', 'USD'];
const estadosCxP = ['pendiente', 'parcial', 'pagado', 'anulado'];
const estadosCxC = ['pendiente', 'parcial', 'cobrado', 'anulado'];

async function seedFinanzas() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Obtener proveedores y clientes existentes
    const proveedores = await Proveedor.find().limit(50);
    const clientes = await Cliente.find().limit(50);
    const ordenes = await OrdenCompra.find().limit(50);
    const facturas = await Factura.find().limit(50);

    if (proveedores.length === 0) {
      console.log('⚠️  No hay proveedores. Ejecuta seed-data.js primero.');
      return;
    }

    if (clientes.length === 0) {
      console.log('⚠️  No hay clientes. Ejecuta seed-data.js primero.');
      return;
    }

    console.log(`📊 Proveedores disponibles: ${proveedores.length}`);
    console.log(`📊 Clientes disponibles: ${clientes.length}`);
    console.log(`📊 Órdenes disponibles: ${ordenes.length}`);
    console.log(`📊 Facturas disponibles: ${facturas.length}\n`);

    // Limpiar datos existentes de finanzas
    console.log('🗑️  Limpiando datos de finanzas...');
    await CuentaPorPagar.deleteMany({});
    await CuentaPorCobrar.deleteMany({});
    console.log('✅ Datos de finanzas limpiados\n');

    // 1. CREAR 50 CUENTAS POR PAGAR
    console.log('💳 Creando 50 Cuentas por Pagar...');
    const cxps = [];
    for (let i = 1; i <= 50; i++) {
      const proveedor = randomChoice(proveedores);
      const moneda = randomChoice(monedas);
      const monto = randomInt(500, 10000);
      const montoPagado = randomChoice([0, monto * 0.3, monto * 0.5, monto]);
      const saldo = monto - montoPagado;
      const estado = montoPagado === 0 ? 'pendiente' : 
                     montoPagado >= monto ? 'pagado' : 'parcial';
      
      const fechaEmision = randomDate(120);
      const diasVencimiento = randomInt(15, 90);
      const fechaVencimiento = new Date(fechaEmision);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVencimiento);

      const orden = ordenes[i % ordenes.length];

      const pagos = [];
      if (montoPagado > 0) {
        const numPagos = montoPagado >= monto ? 1 : randomInt(1, 2);
        let restante = montoPagado;
        for (let j = 0; j < numPagos && restante > 0; j++) {
          const montoPago = j === numPagos - 1 ? restante : Math.min(restante, monto * 0.5);
          pagos.push({
            monto: montoPago,
            fecha: randomDate(90)
          });
          restante -= montoPago;
        }
      }

      const cxp = await CuentaPorPagar.create({
        proveedor: proveedor._id,
        ordenCompra: orden ? orden._id : null,
        monto,
        saldo,
        moneda,
        fechaVencimiento,
        estado,
        pagos,
        facturaProveedor: {
          numero: `FC-PROV-${String(i).padStart(5, '0')}`,
          fecha: fechaEmision,
          adjuntoUrl: null,
          observaciones: `Factura del proveedor ${proveedor.nombre}`
        }
      });
      cxps.push(cxp);
    }
    console.log(`✅ ${cxps.length} cuentas por pagar creadas\n`);

    // 2. CREAR 50 CUENTAS POR COBRAR
    console.log('💰 Creando 50 Cuentas por Cobrar...');
    const cxcs = [];
    for (let i = 1; i <= 50; i++) {
      const cliente = randomChoice(clientes);
      const moneda = randomChoice(monedas);
      const monto = randomInt(1000, 20000);
      const montoCobrado = randomChoice([0, monto * 0.3, monto * 0.5, monto]);
      const saldo = monto - montoCobrado;
      const estado = montoCobrado === 0 ? 'pendiente' : 
                     montoCobrado >= monto ? 'cobrado' : 'parcial';
      
      const fechaEmision = randomDate(120);
      const diasVencimiento = randomInt(30, 60);
      const fechaVencimiento = new Date(fechaEmision);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + diasVencimiento);

      const factura = facturas[i % facturas.length];

      const cobros = [];
      if (montoCobrado > 0) {
        const numCobros = montoCobrado >= monto ? 1 : randomInt(1, 3);
        let restante = montoCobrado;
        for (let j = 0; j < numCobros && restante > 0; j++) {
          const montoCobro = j === numCobros - 1 ? restante : Math.min(restante, monto * 0.4);
          cobros.push({
            monto: montoCobro,
            fecha: randomDate(90)
          });
          restante -= montoCobro;
        }
      }

      const cxc = await CuentaPorCobrar.create({
        cliente: cliente._id,
        factura: factura ? factura._id : null,
        monto,
        saldo,
        moneda,
        fechaVencimiento,
        estado,
        cobros
      });
      cxcs.push(cxc);
    }
    console.log(`✅ ${cxcs.length} cuentas por cobrar creadas\n`);

    // RESUMEN FINAL
    console.log('════════════════════════════════════════');
    console.log('✅ INSERCIÓN DE DATOS DE FINANZAS COMPLETADA');
    console.log('════════════════════════════════════════');
    console.log(`💳 Cuentas por Pagar:       ${cxps.length}`);
    console.log(`   - Pendientes:            ${cxps.filter(c => c.estado === 'pendiente').length}`);
    console.log(`   - Pagadas:               ${cxps.filter(c => c.estado === 'pagado').length}`);
    console.log(`   - Parciales:             ${cxps.filter(c => c.estado === 'parcial').length}`);
    console.log(`💰 Cuentas por Cobrar:      ${cxcs.length}`);
    console.log(`   - Pendientes:            ${cxcs.filter(c => c.estado === 'pendiente').length}`);
    console.log(`   - Cobradas:              ${cxcs.filter(c => c.estado === 'cobrado').length}`);
    console.log(`   - Parciales:             ${cxcs.filter(c => c.estado === 'parcial').length}`);
    console.log('════════════════════════════════════════');
    
    // Calcular totales
    const totalPorPagar = cxps.reduce((sum, c) => sum + c.saldo, 0);
    const totalPorCobrar = cxcs.reduce((sum, c) => sum + c.saldo, 0);
    
    console.log(`\n💵 RESUMEN FINANCIERO:`);
    console.log(`   Total por Pagar:         GTQ ${totalPorPagar.toFixed(2)}`);
    console.log(`   Total por Cobrar:        GTQ ${totalPorCobrar.toFixed(2)}`);
    console.log(`   Balance:                 GTQ ${(totalPorCobrar - totalPorPagar).toFixed(2)}`);
    console.log('════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error al insertar datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar
seedFinanzas();
