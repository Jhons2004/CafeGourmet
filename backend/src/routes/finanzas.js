const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const { resources, actions } = require('../permissions/policies');
const { audit } = require('../middleware/audit');
const validate = require('../middleware/validate');
const v = require('../validators/finanzas');

const cxp = require('../controllers/finanzas/cxpController');
const cxc = require('../controllers/finanzas/cxcController');
const analytics = require('../controllers/finanzas/analyticsController');
const tc = require('../controllers/finanzas/tcController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de almacenamiento para adjuntos de facturas
const uploadDir = path.resolve(__dirname, '../../uploads/invoices');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => {
		const ext = (path.extname(file.originalname) || '.bin').toLowerCase();
		// Nombre seguro: cxp_<id>_<timestamp><ext>
		const safeId = String(req.params.id || 'na').replace(/[^a-zA-Z0-9_-]/g, '');
		const name = `cxp_${safeId}_${Date.now()}${ext}`;
		cb(null, name);
	}
});

const ALLOWED_MIMES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const ALLOWED_EXTS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);
const upload = multer({
	storage,
	limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
	fileFilter: (req, file, cb) => {
		const ext = (path.extname(file.originalname) || '').toLowerCase();
		if (!ALLOWED_MIMES.has(file.mimetype) || !ALLOWED_EXTS.has(ext)) {
			return cb(new Error('Tipo de archivo no permitido. Use PDF/JPG/PNG'));
		}
		cb(null, true);
	}
});

// Cuentas por pagar
router.get('/cxp', requireAuth, requirePermission(resources.FINANZAS_CXP, actions.VIEW), cxp.listar);
router.post('/cxp', requireAuth, requirePermission(resources.FINANZAS_CXP, actions.CREATE), validate(v.cxp.crear), audit(resources.FINANZAS_CXP, actions.CREATE), cxp.crear);
router.post('/cxp/:id/pago', requireAuth, requirePermission(resources.FINANZAS_CXP, actions.PAY), validate(v.paramsId, 'params'), validate(v.cxp.pago), audit(resources.FINANZAS_CXP, actions.PAY), cxp.pagar);
router.post('/cxp/:id/anular', requireAuth, requirePermission(resources.FINANZAS_CXP, actions.VOID), validate(v.paramsId, 'params'), audit(resources.FINANZAS_CXP, actions.VOID), cxp.anular);
router.post('/cxp/:id/factura', requireAuth, requirePermission(resources.FINANZAS_CXP, actions.UPDATE), validate(v.paramsId, 'params'), validate(v.cxp.factura), audit(resources.FINANZAS_CXP, actions.UPDATE), cxp.actualizarFactura);
router.post('/cxp/:id/factura/adjunto', requireAuth, requirePermission(resources.FINANZAS_CXP, actions.UPLOAD), validate(v.paramsId, 'params'), upload.single('archivo'), audit(resources.FINANZAS_CXP, actions.UPLOAD), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'Archivo requerido (campo: archivo)' });
		const relativeUrl = `/uploads/invoices/${req.file.filename}`;
		// No sobrescribir otros campos de factura: solo adjuntoUrl
		req.body = { adjuntoUrl: relativeUrl };
		return cxp.actualizarFactura(req, res);
	} catch (e) { res.status(500).json({ error: e.message }); }
});

// Descarga autenticada del adjunto de factura de proveedor
router.get('/cxp/:id/factura/adjunto', requireAuth, requirePermission(resources.FINANZAS_CXP, actions.DOWNLOAD), validate(v.paramsId, 'params'), audit(resources.FINANZAS_CXP, actions.DOWNLOAD), cxp.descargarAdjunto);

// Cuentas por cobrar
router.get('/cxc', requireAuth, requirePermission(resources.FINANZAS_CXC, actions.VIEW), cxc.listar);
router.post('/cxc', requireAuth, requirePermission(resources.FINANZAS_CXC, actions.CREATE), validate(v.cxc.crear), audit(resources.FINANZAS_CXC, actions.CREATE), cxc.crear);
router.post('/cxc/:id/cobro', requireAuth, requirePermission(resources.FINANZAS_CXC, actions.COLLECT), validate(v.paramsId, 'params'), validate(v.cxc.cobro), audit(resources.FINANZAS_CXC, actions.COLLECT), cxc.cobrar);
router.post('/cxc/:id/anular', requireAuth, requirePermission(resources.FINANZAS_CXC, actions.VOID), validate(v.paramsId, 'params'), audit(resources.FINANZAS_CXC, actions.VOID), cxc.anular);

// Analytics
router.get('/aging', requireAuth, requirePermission(resources.FINANZAS_AGING, actions.VIEW), analytics.aging);

// Tipo de cambio (Banguat), acceso general autenticado
router.get('/tc', requireAuth, requirePermission(resources.FINANZAS_TC, actions.VIEW), tc.obtener);

module.exports = router;

