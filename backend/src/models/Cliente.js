const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, index: true },
  ruc: { type: String, default: null, index: true },
  email: { type: String, default: null },
  telefono: { type: String, default: null },
  direccion: { type: String, default: null },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', ClienteSchema);
