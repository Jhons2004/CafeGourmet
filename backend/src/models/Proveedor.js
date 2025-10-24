const mongoose = require('mongoose');

const ProveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true, index: true },
  ruc: { type: String, default: null, index: true },
  contacto: { type: String, default: null },
  telefono: { type: String, default: null },
  direccion: { type: String, default: null },
  email: { type: String, default: null },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Proveedor', ProveedorSchema);
