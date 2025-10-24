const mongoose = require('mongoose');

const ChecklistItemSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  ok: { type: Boolean, default: false }
}, { _id: false });

const ControlCalidadProcesoSchema = new mongoose.Schema({
  op: { type: mongoose.Schema.Types.ObjectId, ref: 'OrdenProduccion', required: true },
  etapa: { type: String, required: true },
  checklist: { type: [ChecklistItemSchema], default: [] },
  resultado: { type: String, enum: ['aprobado','rechazado'], required: true },
  notas: { type: String, default: null },
  usuario: { type: String, default: 'system' },
  fecha: { type: Date, default: Date.now }
}, { timestamps: true });

ControlCalidadProcesoSchema.index({ op: 1, etapa: 1 });

module.exports = mongoose.model('ControlCalidadProceso', ControlCalidadProcesoSchema);
