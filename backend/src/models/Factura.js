const mongoose = require('mongoose');

const FacturaSchema = new mongoose.Schema({
  numero: { type: String, unique: true },
  pedido: { type: mongoose.Schema.Types.ObjectId, ref: 'PedidoVenta', required: true },
  subtotal: { type: Number, required: true },
  impuestos: { type: Number, required: true },
  total: { type: Number, required:  true },
  estado: { type: String, enum: ['emitida','anulada'], default: 'emitida' }
}, { timestamps: true });

FacturaSchema.pre('save', function(next){
  if (!this.numero) this.numero = `F-${Date.now()}`;
  next();
});

module.exports = mongoose.model('Factura', FacturaSchema);
