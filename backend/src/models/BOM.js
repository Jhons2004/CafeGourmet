const mongoose = require('mongoose');

const ComponenteSchema = new mongoose.Schema({
  tipoProducto: { type: String, enum: ['grano','productoTerminado'], required: true },
  productoRef: { type: mongoose.Schema.Types.ObjectId, required: true },
  cantidad: { type: Number, required: true },
  unidad: { type: String, default: 'kg' }
}, { _id: false });

const BOMSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  productoFinalRef: { type: mongoose.Schema.Types.ObjectId, required: true },
  version: { type: Number, default: 1 },
  activa: { type: Boolean, default: true },
  componentes: { type: [ComponenteSchema], default: [] },
  notas: { type: String, default: '' }
}, { timestamps: true });

BOMSchema.index({ productoFinalRef: 1, activa: 1 });

module.exports = mongoose.model('BOM', BOMSchema);
