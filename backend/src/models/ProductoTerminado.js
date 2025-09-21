const mongoose = require('mongoose');

const ProductoTerminadoSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  unidad: { type: String, enum: ['kg','g','un'], default: 'kg' },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ProductoTerminado', ProductoTerminadoSchema);
