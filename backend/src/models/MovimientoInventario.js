const mongoose = require('mongoose');

const MovimientoInventarioSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['ENTRADA','SALIDA','AJUSTE_POS','AJUSTE_NEG','TRANSFERENCIA','RESERVA','LIBERACION_RESERVA'], required: true },
  productoRef: { type: mongoose.Schema.Types.ObjectId, required: true },
  tipoProducto: { type: String, enum: ['grano','productoTerminado'], required: true },
  lote: { type: String, default: null }, // legado
  loteRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Lote' },
  bodegaOrigen: { type: mongoose.Schema.Types.ObjectId, ref: 'Bodega' },
  bodegaDestino: { type: mongoose.Schema.Types.ObjectId, ref: 'Bodega' },
  ubicacionOrigen: { type: mongoose.Schema.Types.ObjectId, ref: 'Ubicacion' },
  ubicacionDestino: { type: mongoose.Schema.Types.ObjectId, ref: 'Ubicacion' },
  cantidad: { type: Number, required: true },
  costoUnitario: { type: Number, default: 0 },
  metodoCosteo: { type: String, enum: ['PROMEDIO','FIFO'], required: true },
  capasConsumidas: [{ cantidad: Number, costoUnitario: Number }],
  notas: { type: String, default: '' },
  usuario: { type: String, default: '' },
  fecha: { type: Date, default: Date.now }
}, { timestamps: true });

MovimientoInventarioSchema.index({ fecha: -1 });
MovimientoInventarioSchema.index({ tipo: 1, productoRef: 1, fecha: -1 });

module.exports = mongoose.model('MovimientoInventario', MovimientoInventarioSchema);
