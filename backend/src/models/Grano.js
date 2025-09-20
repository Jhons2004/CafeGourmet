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
    proveedor: {
        type: String,
        required: true
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
});

GranoSchema.index({ tipo: 1, fechaRegistro: 1 });

module.exports = mongoose.model('Grano', GranoSchema);
