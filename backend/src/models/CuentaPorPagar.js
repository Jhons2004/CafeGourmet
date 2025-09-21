const mongoose = require('mongoose');

const PagoSchema = new mongoose.Schema({
	fecha: { type: Date, default: Date.now },
	monto: { type: Number, required: true }
}, { _id: false });

const FacturaProveedorSchema = new mongoose.Schema({
	numero: { type: String },
	fecha: { type: Date },
	adjuntoUrl: { type: String },
	observaciones: { type: String },
	tcUsado: { type: Number }, // Tipo de cambio usado si la factura es en USD
	tcFuente: { type: String }, // Fuente del tipo de cambio (e.g., Banguat ...)
	tcFecha: { type: Date } // Fecha del tipo de cambio utilizado
}, { _id: false });

const CxPSchema = new mongoose.Schema({
	proveedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Proveedor', required: true },
	ordenCompra: { type: mongoose.Schema.Types.ObjectId, ref: 'OrdenCompra' },
	moneda: { type: String, enum: ['GTQ','USD'], default: 'GTQ' },
	monto: { type: Number, required: true },
	saldo: { type: Number, required: true },
	fechaVencimiento: { type: Date, required: true },
	estado: { type: String, enum: ['pendiente','parcial','pagado','anulado'], default: 'pendiente' },
	pagos: { type: [PagoSchema], default: [] },
	facturaProveedor: { type: FacturaProveedorSchema, default: {} }
}, { timestamps: true });

CxPSchema.index({ proveedor: 1 });
CxPSchema.index({ estado: 1 });
CxPSchema.index({ fechaVencimiento: 1 });
// Índice único parcial: mismo proveedor + número de factura no debe repetirse cuando numero existe
CxPSchema.index(
	{ proveedor: 1, 'facturaProveedor.numero': 1 },
	{ unique: true, partialFilterExpression: { 'facturaProveedor.numero': { $exists: true, $type: 'string' } } }
);

module.exports = mongoose.model('CuentaPorPagar', CxPSchema);

