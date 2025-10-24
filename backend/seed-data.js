/**
 * Script para insertar datos de prueba en la base de datos
 * Inserta 50 registros en cada colección principal
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Modelos
const ProductoTerminado = require('./src/models/ProductoTerminado');
const StockProducto = require('./src/models/StockProducto');
const Cliente = require('./src/models/Cliente');
const PedidoVenta = require('./src/models/PedidoVenta');
const Factura = require('./src/models/Factura');
const Proveedor = require('./src/models/Proveedor');
const OrdenCompra = require('./src/models/OrdenCompra');
const RecepcionLote = require('./src/models/RecepcionLote');
const OrdenProduccion = require('./src/models/OrdenProduccion');
const Usuario = require('./src/models/Usuario');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cafe_gourmet';

// Datos de ejemplo
const tiposCafe = ['Arábica Premium', 'Robusta Especial', 'Blend Gourmet', 'Arábica Orgánico', 'Robusta Intenso'];
const origenes = ['Colombia', 'Brasil', 'Etiopía', 'Costa Rica', 'Guatemala', 'Kenia', 'Perú', 'Honduras'];
const unidades = ['kg', 'g', 'un'];
const estadosPedido = ['borrador', 'confirmado', 'despachado', 'cancelado'];
const estadosOC = ['borrador', 'aprobada', 'recibida', 'cancelada'];

// Función para generar string aleatorio
const randomString = (length = 8) => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

// Función para fecha aleatoria en los últimos 6 meses
const randomDate = (daysBack = 180) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
};

// Función para número aleatorio en rango
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Función para selección aleatoria de array
const randomChoice = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

async function seedData() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // 1. LIMPIAR DATOS EXISTENTES (opcional - comentar si no quieres borrar)
    console.log('🗑️  Limpiando datos existentes...');
    await ProductoTerminado.deleteMany({});
    await StockProducto.deleteMany({});
    await Cliente.deleteMany({});
    await PedidoVenta.deleteMany({});
    await Factura.deleteMany({});
    await Proveedor.deleteMany({});
    await OrdenCompra.deleteMany({});
    await RecepcionLote.deleteMany({});
    await OrdenProduccion.deleteMany({});
    console.log('✅ Datos limpiados\n');

    // 2. CREAR 50 PRODUCTOS TERMINADOS
    console.log('📦 Creando 50 Productos Terminados...');
    const productos = [];
    for (let i = 1; i <= 50; i++) {
      const producto = await ProductoTerminado.create({
        sku: `CAFE-${String(i).padStart(3, '0')}`,
        nombre: `${randomChoice(tiposCafe)} ${randomChoice(origenes)} #${i}`,
        unidad: randomChoice(unidades),
        descripcion: `Café de alta calidad importado de ${randomChoice(origenes)}`,
        categoria: randomChoice(['Premium', 'Estándar', 'Orgánico', 'Especial']),
        precioVenta: randomInt(30, 150)
      });
      productos.push(producto);
    }
    console.log(`✅ ${productos.length} productos creados\n`);

    // 3. CREAR STOCK PARA LOS PRODUCTOS
    console.log('📊 Creando stock para productos...');
    const stockDocs = [];
    for (const producto of productos) {
      const cantidadStock = randomInt(50, 1000);
      const stock = await StockProducto.create({
        producto: producto._id,
        cantidad: cantidadStock,
        ubicacion: randomChoice(['ALM-PRINCIPAL', 'ALM-SECUNDARIO', 'ALM-NORTE', 'ALM-SUR']),
        lotePT: `LOTE-${randomString(6)}`,
        fechaIngreso: randomDate(90)
      });
      stockDocs.push(stock);
    }
    console.log(`✅ ${stockDocs.length} registros de stock creados\n`);

    // 4. CREAR 50 CLIENTES
    console.log('👥 Creando 50 Clientes...');
    const clientes = [];
    const empresas = ['Café Express', 'Distribuidora Norte', 'Super Café', 'Gourmet Store', 'Coffee Shop'];
    for (let i = 1; i <= 50; i++) {
      const cliente = await Cliente.create({
        nombre: `${randomChoice(empresas)} ${i}`,
        ruc: `${randomInt(10000000000, 99999999999)}`,
        email: `cliente${i}@empresa.com`,
        telefono: `+51-${randomInt(900000000, 999999999)}`,
        direccion: `Av. Principal ${randomInt(100, 999)}, ${randomChoice(origenes)}`,
        ciudad: randomChoice(origenes),
        pais: randomChoice(['Perú', 'Colombia', 'Ecuador', 'Chile'])
      });
      clientes.push(cliente);
    }
    console.log(`✅ ${clientes.length} clientes creados\n`);

    // 5. CREAR 50 PROVEEDORES
    console.log('🏭 Creando 50 Proveedores...');
    const proveedores = [];
    const tiposProveedor = ['Importadora', 'Distribuidora', 'Finca', 'Cooperativa'];
    for (let i = 1; i <= 50; i++) {
      const proveedor = await Proveedor.create({
        nombre: `${randomChoice(tiposProveedor)} ${randomChoice(origenes)} ${i}`,
        ruc: `${randomInt(10000000000, 99999999999)}`,
        contacto: `Contacto ${i}`,
        telefono: `+51-${randomInt(900000000, 999999999)}`,
        email: `proveedor${i}@empresa.com`,
        direccion: `Calle Comercio ${randomInt(100, 999)}`,
        ciudad: randomChoice(origenes),
        pais: randomChoice(origenes)
      });
      proveedores.push(proveedor);
    }
    console.log(`✅ ${proveedores.length} proveedores creados\n`);

    // 6. CREAR 50 ÓRDENES DE COMPRA
    console.log('🧾 Creando 50 Órdenes de Compra...');
    const ordenes = [];
    for (let i = 1; i <= 50; i++) {
      const numItems = randomInt(1, 5);
      const items = [];
      let total = 0;
      
      for (let j = 0; j < numItems; j++) {
        const cantidad = randomInt(10, 100);
        const precioUnitario = randomInt(5, 30);
        items.push({
          tipo: randomChoice(['arabica', 'robusta', 'blend']),
          cantidad,
          precioUnitario,
          subtotal: cantidad * precioUnitario
        });
        total += cantidad * precioUnitario;
      }

      const orden = await OrdenCompra.create({
        proveedor: randomChoice(proveedores)._id,
        items,
        total,
        estado: randomChoice(estadosOC),
        fechaEmision: randomDate(120),
        fechaEntregaEstimada: new Date(Date.now() + randomInt(1, 30) * 24 * 60 * 60 * 1000)
      });
      ordenes.push(orden);
    }
    console.log(`✅ ${ordenes.length} órdenes de compra creadas\n`);

    // 7. CREAR 50 RECEPCIONES DE COMPRA
    console.log('📥 Creando 50 Recepciones de Compra...');
    const recepciones = [];
    for (let i = 0; i < 50 && i < ordenes.length; i++) {
      const orden = ordenes[i];
      
      // Obtener el proveedor de la orden
      const ordenCompleta = await OrdenCompra.findById(orden._id);
      
      const lotes = orden.items.map((item, idx) => ({
        tipo: item.tipo,
        cantidad: item.cantidad,
        costoUnitario: item.precioUnitario,
        lote: `LOTE-${randomString(8)}`,
        fechaCosecha: randomDate(180),
        humedad: randomInt(10, 14) // Número sin el símbolo %
      }));

      const recepcion = await RecepcionLote.create({
        ordenCompra: orden._id,
        proveedor: ordenCompleta.proveedor, // Agregar el proveedor
        lotes,
        fechaRecepcion: randomDate(60),
        observaciones: `Recepción completa. Calidad: ${randomChoice(['Excelente', 'Muy buena', 'Buena', 'Aceptable'])}`
      });
      recepciones.push(recepcion);
    }
    console.log(`✅ ${recepciones.length} recepciones creadas\n`);

    // 8. CREAR 50 ÓRDENES DE PRODUCCIÓN
    console.log('🏭 Creando 50 Órdenes de Producción...');
    const ops = [];
    for (let i = 1; i <= 50; i++) {
      const numRecetas = randomInt(1, 3);
      const receta = [];
      
      for (let j = 0; j < numRecetas; j++) {
        receta.push({
          tipo: randomChoice(['arabica', 'robusta']),
          cantidad: randomInt(10, 100)
        });
      }

      const op = await OrdenProduccion.create({
        producto: `${randomChoice(tiposCafe)} - OP${i}`,
        receta,
        cantidadPlanificada: randomInt(100, 500),
        cantidadProducida: randomInt(0, 500),
        estado: randomChoice(['pendiente', 'en_proceso', 'completada', 'cancelada']),
        fechaInicio: randomDate(90),
        fechaFin: randomChoice([null, randomDate(30)])
      });
      ops.push(op);
    }
    console.log(`✅ ${ops.length} órdenes de producción creadas\n`);

    // 9. CREAR 50 PEDIDOS DE VENTA
    console.log('💳 Creando 50 Pedidos de Venta...');
    const pedidos = [];
    for (let i = 1; i <= 50; i++) {
      const numItems = randomInt(1, 4);
      const items = [];
      
      for (let j = 0; j < numItems; j++) {
        const producto = randomChoice(productos);
        const cantidad = randomInt(5, 50);
        const precio = producto.precioVenta || randomInt(30, 150);
        items.push({
          producto: producto._id,
          cantidad,
          precio
        });
      }

      const pedido = await PedidoVenta.create({
        codigo: `PV-${String(Date.now() + i).padStart(16, '0')}`, // Código único con timestamp + i
        cliente: randomChoice(clientes)._id,
        items,
        estado: randomChoice(estadosPedido),
        fechaDespacho: randomChoice([null, randomDate(30)])
      });
      pedidos.push(pedido);
      
      // Pequeño delay para evitar duplicados de timestamp
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    console.log(`✅ ${pedidos.length} pedidos de venta creados\n`);

    // 10. CREAR FACTURAS PARA PEDIDOS DESPACHADOS
    console.log('🧾 Creando Facturas...');
    const facturas = [];
    const pedidosDespachados = pedidos.filter(p => p.estado === 'despachado');
    
    for (let i = 0; i < pedidosDespachados.length; i++) {
      const pedido = pedidosDespachados[i];
      const subtotal = pedido.subtotal || pedido.total || 0;
      const impuestos = subtotal * 0.18;
      const total = subtotal + impuestos;
      
      const factura = await Factura.create({
        numero: `F-${String(Date.now() + i).padStart(16, '0')}`,
        pedido: pedido._id,
        subtotal: subtotal,
        impuestos: impuestos,
        total: total,
        estado: randomChoice(['emitida', 'anulada'])
      });
      facturas.push(factura);
      
      // Pequeño delay para evitar duplicados
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    console.log(`✅ ${facturas.length} facturas creadas\n`);

    // RESUMEN FINAL
    console.log('════════════════════════════════════════');
    console.log('✅ INSERCIÓN DE DATOS COMPLETADA');
    console.log('════════════════════════════════════════');
    console.log(`📦 Productos Terminados:    ${productos.length}`);
    console.log(`📊 Registros de Stock:      ${stockDocs.length}`);
    console.log(`👥 Clientes:                ${clientes.length}`);
    console.log(`🏭 Proveedores:             ${proveedores.length}`);
    console.log(`🧾 Órdenes de Compra:       ${ordenes.length}`);
    console.log(`📥 Recepciones:             ${recepciones.length}`);
    console.log(`🏭 Órdenes de Producción:   ${ops.length}`);
    console.log(`💳 Pedidos de Venta:        ${pedidos.length}`);
    console.log(`🧾 Facturas:                ${facturas.length}`);
    console.log('════════════════════════════════════════');
    console.log(`📊 TOTAL DE REGISTROS:      ${productos.length + stockDocs.length + clientes.length + proveedores.length + ordenes.length + recepciones.length + ops.length + pedidos.length + facturas.length}`);
    console.log('════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error al insertar datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar
seedData();
