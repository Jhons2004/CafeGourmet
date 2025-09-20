const mongoose = require('mongoose');

const LoteSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['arabica','robusta','blend'], required: true },
  cantidad: { type: Number, required: true, min: 0 },
  costoUnitario: { type: Number, required: true, min: 0 },
  lote: { type: String, required: true },
  fechaCosecha: { type: Date },
  humedad: { type: Number }
}, { _id: false });

const RecepcionLoteSchema = new mongoose.Schema({
  ordenCompra: { type: mongoose.Schema.Types.ObjectId, ref: 'OrdenCompra', required: true },
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
  lotes: { type: [LoteSchema], default: [] },
  fechaRecepcion: { type: Date, default: Date.now },
  observaciones: { type: String, default: null }
}, { timestamps: true });

RecepcionLoteSchema.index({ proveedor: 1, fechaRecepcion: -1 });

module.exports = mongoose.model('RecepcionLote', RecepcionLoteSchema);
