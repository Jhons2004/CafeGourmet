const mongoose = require('mongoose');

const CobroSchema = new mongoose.Schema({
	fecha: { type: Date, default: Date.now },
	monto: { type: Number, required: true }
}, { _id: false });

const CxCSchema = new mongoose.Schema({
	cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
	factura: { type: mongoose.Schema.Types.ObjectId, ref: 'Factura' },
	moneda: { type: String, enum: ['GTQ','USD'], default: 'GTQ' },
	monto: { type: Number, required: true },
	saldo: { type: Number, required: true },
	fechaVencimiento: { type: Date, required: true },
	estado: { type: String, enum: ['pendiente','parcial','cobrado','anulado'], default: 'pendiente' },
	cobros: { type: [CobroSchema], default: [] }
}, { timestamps: true });

CxCSchema.index({ cliente: 1 });
CxCSchema.index({ estado: 1 });
CxCSchema.index({ fechaVencimiento: 1 });

module.exports = mongoose.model('CuentaPorCobrar', CxCSchema);

