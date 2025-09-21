const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
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
		const ext = path.extname(file.originalname) || '.bin';
		const name = `cxp_${req.params.id}_${Date.now()}${ext}`;
		cb(null, name);
	}
});
const upload = multer({ storage });

// Cuentas por pagar
router.get('/cxp', requireAuth, requireRole('admin','it','operador'), cxp.listar);
router.post('/cxp', requireAuth, requireRole('admin','it'), validate(v.cxp.crear), cxp.crear);
router.post('/cxp/:id/pago', requireAuth, requireRole('admin','it'), validate(v.paramsId, 'params'), validate(v.cxp.pago), cxp.pagar);
router.post('/cxp/:id/anular', requireAuth, requireRole('admin','it'), validate(v.paramsId, 'params'), cxp.anular);
router.post('/cxp/:id/factura', requireAuth, requireRole('admin','it'), validate(v.paramsId, 'params'), validate(v.cxp.factura), cxp.actualizarFactura);
router.post('/cxp/:id/factura/adjunto', requireAuth, requireRole('admin','it'), validate(v.paramsId, 'params'), upload.single('archivo'), async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ error: 'Archivo requerido (campo: archivo)' });
		const relativeUrl = `/uploads/invoices/${req.file.filename}`;
		req.body = { numero: undefined, fecha: undefined, observaciones: undefined, tcUsado: undefined, adjuntoUrl: relativeUrl };
		return cxp.actualizarFactura(req, res);
	} catch (e) { res.status(500).json({ error: e.message }); }
});

// Cuentas por cobrar
router.get('/cxc', requireAuth, requireRole('admin','it','operador'), cxc.listar);
router.post('/cxc', requireAuth, requireRole('admin','it'), validate(v.cxc.crear), cxc.crear);
router.post('/cxc/:id/cobro', requireAuth, requireRole('admin','it'), validate(v.paramsId, 'params'), validate(v.cxc.cobro), cxc.cobrar);
router.post('/cxc/:id/anular', requireAuth, requireRole('admin','it'), validate(v.paramsId, 'params'), cxc.anular);

// Analytics
router.get('/aging', requireAuth, requireRole('admin','it','operador'), analytics.aging);

// Tipo de cambio (Banguat), acceso general autenticado
router.get('/tc', requireAuth, requireRole('admin','it','operador'), tc.obtener);

module.exports = router;

