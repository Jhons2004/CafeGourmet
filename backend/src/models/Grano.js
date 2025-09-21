// Modelo de grano de café
const mongoose = require('mongoose');

const GranoSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: ['arabica', 'robusta', 'blend'],
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 0
    },
    lote: {
        type: String,
        default: null,
        index: true
    },
    costoUnitario: {
        type: Number,
        default: 0
    },
    proveedor: {
        type: String,
        required: true
    },
    ubicacion: { type: String, default: 'ALM-PRINCIPAL' },
    estado: { type: String, enum: ['activo','bloqueado','inactivo'], default: 'activo' },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
});

GranoSchema.index({ tipo: 1, fechaRegistro: 1 });
GranoSchema.index({ tipo: 1, lote: 1 });
GranoSchema.index({ lote: 1, estado: 1 });
GranoSchema.index({ estado: 1, fechaRegistro: -1 });

module.exports = mongoose.model('Grano', GranoSchema);
