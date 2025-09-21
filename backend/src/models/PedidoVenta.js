const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductoTerminado', required: true },
  cantidad: { type: Number, required: true, min: 0 },
  precio: { type: Number, required: true, min: 0 }
}, { _id: false });

const PedidoVentaSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  items: { type: [ItemSchema], default: [] },
  subtotal: { type: Number, default: 0 },
  impuestos: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  estado: { type: String, enum: ['borrador','confirmado','despachado','cancelado'], default: 'borrador', index: true },
  fechaDespacho: { type: Date }
}, { timestamps: true });

PedidoVentaSchema.pre('save', function(next) {
  if (!this.codigo) this.codigo = `PV-${Date.now()}`;
  this.subtotal = (this.items || []).reduce((s, it) => s + (Number(it.cantidad||0) * Number(it.precio||0)), 0);
  this.impuestos = Math.round(this.subtotal * 0.18 * 100) / 100; // 18% IGV por defecto
  this.total = this.subtotal + this.impuestos;
  next();
});

module.exports = mongoose.model('PedidoVenta', PedidoVentaSchema);
