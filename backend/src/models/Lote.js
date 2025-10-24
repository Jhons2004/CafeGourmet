const mongoose = require('mongoose');

const LoteSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  tipoProducto: { type: String, enum: ['grano','productoTerminado'], required: true },
  productoRef: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  origen: { type: String, default: '' }, // finca / parcela / proveedor
  variedad: { type: String, default: '' },
  fechaIngreso: { type: Date, default: Date.now },
  fechaProduccion: { type: Date },
  fechaCaducidad: { type: Date },
  humedad: { type: Number, default: null },
  estado: { type: String, enum: ['ACTIVO','BLOQUEADO','CERRADO'], default: 'ACTIVO' },
  notas: { type: String, default: '' }
}, { timestamps: true });

LoteSchema.pre('save', function(next){
  if(!this.codigo){ this.codigo = 'LT-' + Date.now(); }
  next();
});

LoteSchema.index({ productoRef: 1, estado: 1 });
LoteSchema.index({ fechaIngreso: -1 });

module.exports = mongoose.model('Lote', LoteSchema);
