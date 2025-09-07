const mongoose = require('mongoose');

const IngredienteSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['arabica', 'robusta', 'blend'], required: true },
  cantidad: { type: Number, required: true, min: 0 }
}, { _id: false });

const EtapaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  estado: { type: String, enum: ['pendiente', 'completada'], default: 'pendiente' },
  consumoAplicado: { type: Boolean, default: false }
}, { _id: false });

const ConsumoSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['arabica', 'robusta', 'blend'], required: true },
  cantidad: { type: Number, required: true, min: 0 },
  fecha: { type: Date, default: Date.now }
}, { _id: false });

const OrdenProduccionSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  producto: { type: String, required: true },
  receta: { type: [IngredienteSchema], default: [] },
  etapas: { type: [EtapaSchema], default: [
    { nombre: 'Tostado', estado: 'pendiente' },
    { nombre: 'Molido', estado: 'pendiente' },
    { nombre: 'Empaque', estado: 'pendiente' }
  ] },
  estado: { type: String, enum: ['pendiente', 'en_proceso', 'completada', 'cancelada'], default: 'pendiente' },
  consumos: { type: [ConsumoSchema], default: [] },
  merma: { type: Number, default: 0 },
  fechaCreacion: { type: Date, default: Date.now },
  fechaCierre: { type: Date }
});

OrdenProduccionSchema.pre('save', function(next) {
  if (!this.codigo) {
    this.codigo = `OP-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('OrdenProduccion', OrdenProduccionSchema);
