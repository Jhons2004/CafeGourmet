const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schema = require('../validators/usuario');
const rateLimit = require('express-rate-limit');
const usuarioController = require('../controllers/usuarioController');

router.post('/registrar', validate(schema.registrar), usuarioController.registrar);
const loginLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 50 });
router.post('/login', loginLimiter, validate(schema.login), usuarioController.login);
router.get('/', requireAuth, requireRole('admin','it','rrhh'), usuarioController.listar);
router.patch('/:id/rol', requireAuth, requireRole('admin','it','rrhh'), validate(schema.actualizarRol), usuarioController.actualizarRol);
router.delete('/:id', requireAuth, requireRole('admin','it'), usuarioController.eliminar);
// Recuperación de contraseña
router.post('/forgot-password', validate(schema.forgotPassword), usuarioController.forgotPassword);
router.post('/reset-password/:token', validate(schema.resetPassword), usuarioController.resetPassword);
// Cambio simple de contraseña (sin token)
router.post('/reset-password-simple', validate(schema.resetPasswordSimple), usuarioController.resetPasswordSimple);

module.exports = router;
