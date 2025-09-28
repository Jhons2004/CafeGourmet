const mongoose = require('mongoose');

const CapaFIFOSchema = new mongoose.Schema({
  cantidad: { type: Number, required: true },
  costoUnitario: { type: Number, required: true },
  restante: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
}, { _id: false });

const StockSchema = new mongoose.Schema({
  productoRef: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  tipoProducto: { type: String, enum: ['grano','productoTerminado'], required: true },
  lote: { type: String, default: null, index: true }, // legado
  loteRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote', index: true },
  bodega: { type: mongoose.Schema.Types.ObjectId, ref: 'Bodega', required: true, index: true },
  ubicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Ubicacion', required: true, index: true },
  cantidad: { type: Number, required: true, min: 0 },
  costoPromedio: { type: Number, default: 0 },
  capasFIFO: { type: [CapaFIFOSchema], default: [] },
  metodoCosteo: { type: String, enum: ['PROMEDIO','FIFO'], default: 'PROMEDIO' }
}, { timestamps: true });

StockSchema.index({ productoRef: 1, tipoProducto: 1, lote: 1, loteRef: 1, bodega: 1, ubicacion: 1 }, { unique: true });

module.exports = mongoose.model('Stock', StockSchema);
