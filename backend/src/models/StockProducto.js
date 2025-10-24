const mongoose = require('mongoose');

const StockProductoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductoTerminado', required: true, index: true },
  lotePT: { type: String, default: null, index: true },
  cantidad: { type: Number, required: true, min: 0 },
  ubicacion: { type: String, default: 'ALM-PRINCIPAL', index: true },
  fechaIngreso: { type: Date, default: Date.now }
}, { timestamps: true });

StockProductoSchema.index({ producto: 1, ubicacion: 1, fechaIngreso: 1 });

module.exports = mongoose.model('StockProducto', StockProductoSchema);
