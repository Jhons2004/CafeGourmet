const mongoose = require('mongoose');

const ReservaStockSchema = new mongoose.Schema({
  productoRef: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  tipoProducto: { type: String, enum: ['grano','productoTerminado'], required: true },
  lote: { type: String, default: null },
  bodega: { type: mongoose.Schema.Types.ObjectId, ref: 'Bodega', required: true },
  ubicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Ubicacion', required: true },
  cantidad: { type: Number, required: true },
  estado: { type: String, enum: ['ACTIVA','LIBERADA','CONSUMIDA'], default: 'ACTIVA' },
  referencia: { type: String, default: '' }, // id pedido venta u otro
  notas: { type: String, default: '' }
}, { timestamps: true });

ReservaStockSchema.index({ productoRef: 1, estado: 1 });

module.exports = mongoose.model('ReservaStock', ReservaStockSchema);
