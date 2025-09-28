const mongoose = require('mongoose');

const BodegaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  codigo: { type: String, required: true, uppercase: true, unique: true },
  tipo: { type: String, enum: ['PRINCIPAL','SECUNDARIA','TRANSITO','DEV','CALIDAD'], default: 'PRINCIPAL' },
  activa: { type: Boolean, default: true },
  direccion: { type: String, default: '' },
  notas: { type: String, default: '' }
}, { timestamps: true });

// 'codigo' ya tiene unique => índice implícito, evitamos duplicado

module.exports = mongoose.model('Bodega', BodegaSchema);
