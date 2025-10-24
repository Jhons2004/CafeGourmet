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
  bomRef: { type: mongoose.Schema.Types.ObjectId, ref: 'BOM' },
  receta: { type: [IngredienteSchema], default: [] },
  // Nuevo: insumos detallados cuando se usa BOM (productoRef/cantidad)
  insumos: { type: [{ tipoProducto: { type: String, enum: ['grano','productoTerminado'], required: true }, productoRef: { type: mongoose.Schema.Types.ObjectId, required: true }, cantidad: { type: Number, required: true } }], default: [] },
  etapas: { type: [EtapaSchema], default: [
    { nombre: 'Tostado', estado: 'pendiente' },
    { nombre: 'Molido', estado: 'pendiente' },
    { nombre: 'Empaque', estado: 'pendiente' }
  ] },
  estado: { type: String, enum: ['pendiente', 'en_proceso', 'completada', 'cancelada'], default: 'pendiente' },
  consumos: { type: [ConsumoSchema], default: [] },
  merma: { type: Number, default: 0 },
  fechaCreacion: { type: Date, default: Date.now },
  fechaCierre: { type: Date },
  costoInsumos: { type: Number, default: 0 },
  costoUnitarioFinal: { type: Number, default: 0 },
  bomConsumida: { type: Boolean, default: false }
});

OrdenProduccionSchema.pre('save', function(next) {
  if (!this.codigo) {
    this.codigo = `OP-${Date.now()}`;
  }
  next();
});

// Indexes to optimize common queries
OrdenProduccionSchema.index({ fechaCreacion: -1 });
OrdenProduccionSchema.index({ estado: 1, fechaCreacion: -1 });
OrdenProduccionSchema.index({ producto: 1, fechaCreacion: -1 });

module.exports = mongoose.model('OrdenProduccion', OrdenProduccionSchema);
