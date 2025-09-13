const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['admin', 'it', 'rrhh', 'operador'], default: 'operador' },
    // Campos para recuperación de contraseña
    resetToken: { type: String, default: null },
    resetExpires: { type: Date, default: null }
});

UsuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UsuarioSchema.methods.compararPassword = function(password) {
    return bcrypt.compare(password, this.password);
};

const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Seed: crear dos usuarios admin si no existen
async function seedAdmins() {
    const admins = [
        { nombre: 'Admin 1', email: 'Admin1', password: '12345678', rol: 'admin' },
        { nombre: 'Admin 2', email: 'Admin2', password: '12345678', rol: 'admin' },
    ];

    for (const a of admins) {
        const existe = await Usuario.findOne({ email: a.email });
        if (!existe) {
            const u = new Usuario(a);
            await u.save();
            console.log(`Usuario admin creado: ${a.email}`);
        } else {
            console.log(`Usuario admin ya existe: ${a.email}`);
        }
    }
}

seedAdmins();

module.exports = Usuario;
