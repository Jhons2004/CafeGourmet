const crypto = require('crypto');
const Usuario = require('../models/Usuario');

module.exports = {
    registrar: async (req, res) => {
        try {
            const { nombre, email, password, rol } = req.body;
            const existe = await Usuario.findOne({ email });
            if (existe) return res.status(400).json({ error: 'El email ya está registrado' });
            const usuario = new Usuario({ nombre, email, password, rol });
            await usuario.save();
            res.json({ mensaje: 'Usuario registrado', usuario: { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
        } catch (err) {
            res.status(400).json({ error: 'Error al registrar usuario', detalles: err.message });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const usuario = await Usuario.findOne({ email });
            if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
            const valido = await usuario.compararPassword(password);
            if (!valido) return res.status(401).json({ error: 'Contraseña incorrecta' });
            res.json({ mensaje: 'Login exitoso', usuario: { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
        } catch (err) {
            res.status(400).json({ error: 'Error en login', detalles: err.message });
        }
    },
    // Solicitar restablecimiento: genera token temporal y lo devuelve (en producción se enviaría por email)
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const usuario = await Usuario.findOne({ email });
            if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

            const token = crypto.randomBytes(20).toString('hex');
            const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutos
            usuario.resetToken = token;
            usuario.resetExpires = expires;
            await usuario.save();

            // Enviaríamos email; por ahora devolvemos el token para pruebas
            res.json({ mensaje: 'Token generado', token, expira: expires });
        } catch (err) {
            res.status(400).json({ error: 'Error al generar token', detalles: err.message });
        }
    },
    // Restablecer contraseña usando token válido
    resetPassword: async (req, res) => {
        try {
            const { token } = req.params;
            const { nuevaPassword } = req.body;
            const usuario = await Usuario.findOne({ resetToken: token, resetExpires: { $gt: new Date() } });
            if (!usuario) return res.status(400).json({ error: 'Token inválido o expirado' });

            usuario.password = nuevaPassword; // será hasheada por el pre('save')
            usuario.resetToken = null;
            usuario.resetExpires = null;
            await usuario.save();
            res.json({ mensaje: 'Contraseña actualizada' });
        } catch (err) {
            res.status(400).json({ error: 'Error al restablecer contraseña', detalles: err.message });
        }
    },
    // Versión simple: cambia la contraseña solo con el email (sin token)
    resetPasswordSimple: async (req, res) => {
        try {
            const { email, nuevaPassword } = req.body;
            const usuario = await Usuario.findOne({ email });
            if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
            usuario.password = nuevaPassword; // será hasheada por el pre('save')
            usuario.resetToken = null;
            usuario.resetExpires = null;
            await usuario.save();
            res.json({ mensaje: 'Contraseña actualizada' });
        } catch (err) {
            res.status(400).json({ error: 'Error al actualizar contraseña', detalles: err.message });
        }
    }
};
