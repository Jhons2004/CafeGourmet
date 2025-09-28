const mongoose = require('mongoose');

const LineaConteoSchema = new mongoose.Schema({
  productoRef: { type: mongoose.Schema.Types.ObjectId, required: true },
  tipoProducto: { type: String, enum: ['grano','productoTerminado'], required: true },
  bodega: { type: mongoose.Schema.Types.ObjectId, ref: 'Bodega', required: true },
  ubicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Ubicacion', required: true },
  lote: { type: String, default: null },
  cantidadFisica: { type: Number, required: true },
  diferencia: { type: Number, default: 0 },
  ajusteGenerado: { type: Boolean, default: false }
}, { _id: false });

const ConteoCiclicoSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  fecha: { type: Date, default: Date.now },
  estado: { type: String, enum: ['ABIERTO','CERRADO'], default: 'ABIERTO' },
  lineas: { type: [LineaConteoSchema], default: [] },
  notas: { type: String, default: '' },
  usuario: { type: String, default: '' }
}, { timestamps: true });

ConteoCiclicoSchema.pre('save', function(next){ if(!this.codigo){ this.codigo = 'CC-'+Date.now(); } next(); });

module.exports = mongoose.model('ConteoCiclico', ConteoCiclicoSchema);
