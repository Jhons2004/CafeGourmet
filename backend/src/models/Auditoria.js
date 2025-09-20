const mongoose = require('mongoose');

const AuditoriaSchema = new mongoose.Schema({
  usuario: { type: String, default: 'system' },
  accion: { type: String, required: true },
  recurso: { type: String, required: true },
  payload: { type: Object, default: {} },
  resultado: { type: String, enum: ['ok','error'], default: 'ok' },
  mensaje: { type: String, default: null },
  fecha: { type: Date, default: Date.now }
}, { timestamps: true });

AuditoriaSchema.index({ recurso: 1, createdAt: -1 });

module.exports = mongoose.model('Auditoria', AuditoriaSchema);
