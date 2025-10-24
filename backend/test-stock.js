// Script de prueba para verificar stock
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/cafegourmet')
  .then(async () => {
    console.log('✅ Conectado a MongoDB');
    
    const StockProducto = require('./src/models/StockProducto');
    const ProductoTerminado = require('./src/models/ProductoTerminado');
    
    // Listar todos los productos
    const productos = await ProductoTerminado.find();
    console.log('\n📦 PRODUCTOS TERMINADOS:');
    console.log('========================');
    productos.forEach(p => {
      console.log(`ID: ${p._id}`);
      console.log(`SKU: ${p.sku}`);
      console.log(`Nombre: ${p.nombre}`);
      console.log(`Unidad: ${p.unidad}`);
      console.log('---');
    });
    
    // Listar todo el stock
    const stocks = await StockProducto.find().populate('producto');
    console.log('\n📊 STOCK DISPONIBLE:');
    console.log('====================');
    if (stocks.length === 0) {
      console.log('⚠️  NO HAY STOCK REGISTRADO');
    } else {
      stocks.forEach(s => {
        console.log(`Producto: ${s.producto?.nombre || 'N/A'} (${s.producto?._id})`);
        console.log(`Cantidad: ${s.cantidad}`);
        console.log(`Ubicación: ${s.ubicacion}`);
        console.log(`Fecha: ${s.fechaIngreso}`);
        console.log('---');
      });
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Conexión cerrada');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
