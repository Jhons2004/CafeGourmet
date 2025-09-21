const mongoose = require('mongoose');

const MedicionesSchema = new mongoose.Schema({
  humedad: { type: Number },
  acidez: { type: Number },
  defectos: { type: Number }
}, { _id: false });

const ControlCalidadRecepcionSchema = new mongoose.Schema({
  recepcion: { type: mongoose.Schema.Types.ObjectId, ref: 'RecepcionLote', required: true },
  lote: { type: String, required: true, index: true },
  mediciones: { type: MedicionesSchema, default: {} },
  resultado: { type: String, enum: ['aprobado','rechazado'], required: true },
  notas: { type: String, default: null },
  usuario: { type: String, default: 'system' },
  fecha: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ControlCalidadRecepcion', ControlCalidadRecepcionSchema);
