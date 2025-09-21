const mongoose = require('mongoose');

const NoConformidadSchema = new mongoose.Schema({
  recurso: { type: String, enum: ['lote','op'], required: true },
  referencia: { type: String, required: true },
  motivo: { type: String, required: true },
  acciones: { type: String, default: null },
  estado: { type: String, enum: ['abierta','cerrada'], default: 'abierta' },
  usuario: { type: String, default: 'system' },
  fecha: { type: Date, default: Date.now },
  fechaCierre: { type: Date }
}, { timestamps: true });

NoConformidadSchema.index({ recurso: 1, estado: 1, fecha: -1 });

module.exports = mongoose.model('NoConformidad', NoConformidadSchema);
