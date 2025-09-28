const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ['admin', 'it', 'rrhh', 'operador', 'auditor'], default: 'operador' },
    // Campos para recuperación de contraseña
    resetToken: { type: String, default: null },
    resetExpires: { type: Date, default: null },
    // Preferencias UI
    uiPreferences: {
        themeMode: { type: String, enum: ['light','dark'], default: 'light' },
        themePalette: { type: String, default: 'espresso' },
        borderStyle: { type: String, enum: ['rounded','flat'], default: 'rounded' },
        numberFormat: { type: String, enum: ['fin','natural'], default: 'fin' },
        customColors: { type: Object, default: {} },
        logoUrl: { type: String, default: '' },
        updatedAt: { type: Date, default: Date.now }
    }
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

// Seed: crear dos usuarios admin con emails formales y migrar legacy si existieran
async function seedAdmins() {
    const targets = [
        { nombre: 'Admin 1', email: 'admin1@cafe.com', legacyEmails: ['Admin1'], password: '12345678', rol: 'admin' },
        { nombre: 'Admin 2', email: 'admin2@cafe.com', legacyEmails: ['Admin2'], password: '12345678', rol: 'admin' },
    ];

    for (const t of targets) {
        // 1) ¿Ya existe con email objetivo?
        let doc = await Usuario.findOne({ email: t.email });
        if (doc) {
            console.log(`Usuario admin ya existe: ${t.email}`);
            continue;
        }

        // 2) ¿Existe con email legacy? migrar
        let migrated = false;
        for (const legacyEmail of t.legacyEmails) {
            const legacy = await Usuario.findOne({ email: legacyEmail });
            if (legacy) {
                legacy.email = t.email;
                if (!legacy.nombre) legacy.nombre = t.nombre;
                legacy.rol = 'admin';
                await legacy.save();
                console.log(`Usuario admin migrado de ${legacyEmail} a ${t.email}`);
                migrated = true;
                break;
            }
        }

        // 3) Si no existe ni legacy, crear
        if (!migrated) {
            const u = new Usuario({ nombre: t.nombre, email: t.email, password: t.password, rol: 'admin' });
            await u.save();
            console.log(`Usuario admin creado: ${t.email}`);
        }
    }
}

// Seed async but don't block
seedAdmins().catch(console.error);

module.exports = Usuario;
