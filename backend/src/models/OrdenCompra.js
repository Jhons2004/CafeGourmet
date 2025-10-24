const mongoose = require('mongoose');

const ItemOCSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['arabica','robusta','blend'], required: true },
  cantidad: { type: Number, required: true, min: 0 },
  precioUnitario: { type: Number, required: true, min: 0 }
}, { _id: false });

const OrdenCompraSchema = new mongoose.Schema({
  numero: { type: String, unique: true },
  proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
  items: { type: [ItemOCSchema], default: [] },
  estado: { type: String, enum: ['borrador','aprobada','recibida','cancelada'], default: 'borrador' },
  fechaAprobacion: { type: Date },
  fechaRecepcion: { type: Date }
}, { timestamps: true });

OrdenCompraSchema.pre('save', function(next) {
  if (!this.numero) this.numero = `OC-${Date.now()}`;
  next();
});

OrdenCompraSchema.index({ proveedor: 1, createdAt: -1 });
OrdenCompraSchema.index({ estado: 1, createdAt: -1 });

module.exports = mongoose.model('OrdenCompra', OrdenCompraSchema);
