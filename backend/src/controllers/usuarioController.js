const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { JWT_SECRET } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

module.exports = {
    listar: async (_req, res) => {
        try {
            const usuarios = await Usuario.find({}, { password: 0, resetToken: 0, resetExpires: 0 }).sort({ nombre: 1 });
            res.json(usuarios);
        } catch (err) {
            res.status(500).json({ error: 'Error al listar usuarios', detalles: err.message });
        }
    },
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
    actualizarRol: async (req, res) => {
        try {
            const { id } = req.params;
            const { rol } = req.body; // 'admin' | 'it' | 'rrhh' | 'operador'
            if (!['admin', 'it', 'rrhh', 'operador', 'auditor'].includes(rol)) {
                return res.status(400).json({ error: 'Rol inválido' });
            }
            const usuario = await Usuario.findByIdAndUpdate(id, { rol }, { new: true, projection: { password: 0, resetToken: 0, resetExpires: 0 } });
            if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
            res.json({ mensaje: 'Rol actualizado', usuario });
        } catch (err) {
            res.status(400).json({ error: 'Error al actualizar rol', detalles: err.message });
        }
    },
    eliminar: async (req, res) => {
        try {
            const { id } = req.params;
            const eliminado = await Usuario.findByIdAndDelete(id);
            if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
            res.json({ mensaje: 'Usuario eliminado' });
        } catch (err) {
            res.status(400).json({ error: 'Error al eliminar usuario', detalles: err.message });
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const usuario = await Usuario.findOne({ email });
            if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
            const valido = await usuario.compararPassword(password);
            if (!valido) return res.status(401).json({ error: 'Contraseña incorrecta' });
            const token = jwt.sign({ id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }, JWT_SECRET, { expiresIn: '8h' });
            res.json({ mensaje: 'Login exitoso', token, usuario: { nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
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
    },
    obtenerPreferencias: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.user.id, { password:0, resetToken:0, resetExpires:0 });
            if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
            res.json({ preferencias: usuario.uiPreferences });
        } catch (err) {
            res.status(400).json({ error: 'Error al obtener preferencias', detalles: err.message });
        }
    },
    actualizarPreferencias: async (req, res) => {
        try {
            const { themeMode, themePalette, borderStyle, numberFormat, customColors } = req.body;
            const usuario = await Usuario.findById(req.user.id);
            if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
            if (themeMode) usuario.uiPreferences.themeMode = themeMode;
            if (themePalette) usuario.uiPreferences.themePalette = themePalette;
            if (borderStyle) usuario.uiPreferences.borderStyle = borderStyle;
            if (numberFormat) usuario.uiPreferences.numberFormat = numberFormat;
            if (customColors) usuario.uiPreferences.customColors = customColors;
            usuario.uiPreferences.updatedAt = new Date();
            await usuario.save();
            res.json({ mensaje: 'Preferencias actualizadas', preferencias: usuario.uiPreferences });
        } catch (err) {
            res.status(400).json({ error: 'Error al actualizar preferencias', detalles: err.message });
        }
    },
    subirLogo: async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ error: 'Archivo no recibido' });
            const usuario = await Usuario.findById(req.user.id);
            if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
            usuario.uiPreferences.logoUrl = `/uploads/logos/${req.file.filename}`;
            usuario.uiPreferences.updatedAt = new Date();
            await usuario.save();
            res.json({ mensaje: 'Logo actualizado', logoUrl: usuario.uiPreferences.logoUrl });
        } catch (err) {
            res.status(400).json({ error: 'Error al subir logo', detalles: err.message });
        }
    },
    eliminarLogo: async (req, res) => {
        try {
            const usuario = await Usuario.findById(req.user.id);
            if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
            if (usuario.uiPreferences.logoUrl) {
                const filePath = path.resolve(__dirname, '../../', usuario.uiPreferences.logoUrl.replace(/^\//,''));
                fs.unlink(filePath, ()=>{}); // best effort
            }
            usuario.uiPreferences.logoUrl = '';
            usuario.uiPreferences.updatedAt = new Date();
            await usuario.save();
            res.json({ mensaje: 'Logo eliminado' });
        } catch (err) {
            res.status(400).json({ error: 'Error al eliminar logo', detalles: err.message });
        }
    }
};
