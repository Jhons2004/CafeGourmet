const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { policyForRole } = require('../permissions/policies');
const validate = require('../middleware/validate');
const schema = require('../validators/usuario');
const rateLimit = require('express-rate-limit');
const usuarioController = require('../controllers/usuarioController');
const multer = require('multer');
const path = require('path');

// Configuración de multer para logos
const logosDir = path.resolve(__dirname, '../uploads/logos');
try { require('fs').mkdirSync(logosDir, { recursive: true }); } catch {}
const upload = multer({
	storage: multer.diskStorage({
		destination: (_req, _file, cb) => cb(null, logosDir),
		filename: (_req, file, cb) => {
			const unique = Date.now() + '-' + Math.round(Math.random()*1e9);
			const ext = path.extname(file.originalname || '.png');
			cb(null, unique + ext);
		}
	}),
	fileFilter: (_req, file, cb) => {
		if (!/image\/(png|jpe?g)/i.test(file.mimetype)) return cb(new Error('Tipo de archivo inválido')); cb(null, true);
	},
	limits: { fileSize: 300 * 1024 }
});

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

// Permisos del rol actual (para UI de menú/permisos)
router.get('/permisos', requireAuth, (req, res)=>{
	const rol = req.user?.rol || 'operador';
	return res.json({ rol, permisos: policyForRole(rol) });
});

// Preferencias UI
router.get('/preferencias', requireAuth, usuarioController.obtenerPreferencias);
const schema = require('../validators/usuario');
router.patch('/preferencias', requireAuth, validate(schema.actualizarPreferencias), usuarioController.actualizarPreferencias);
router.post('/logo', requireAuth, upload.single('logo'), usuarioController.subirLogo);
router.delete('/logo', requireAuth, usuarioController.eliminarLogo);

module.exports = router;
