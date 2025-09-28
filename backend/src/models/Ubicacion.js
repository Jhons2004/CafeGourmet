const mongoose = require('mongoose');

const UbicacionSchema = new mongoose.Schema({
  bodega: { type: mongoose.Schema.Types.ObjectId, ref: 'Bodega', required: true, index: true },
  codigo: { type: String, required: true, uppercase: true },
  descripcion: { type: String, default: '' },
  rack: { type: String, default: '' },
  pasillo: { type: String, default: '' },
  nivel: { type: String, default: '' },
  activa: { type: Boolean, default: true }
}, { timestamps: true });

UbicacionSchema.index({ bodega: 1, codigo: 1 }, { unique: true });

module.exports = mongoose.model('Ubicacion', UbicacionSchema);
