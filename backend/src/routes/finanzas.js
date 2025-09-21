const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators/finanzas');

const cxp = require('../controllers/finanzas/cxpController');
const cxc = require('../controllers/finanzas/cxcController');
const analytics = require('../controllers/finanzas/analyticsController');
const tc = require('../controllers/finanzas/tcController');

// Cuentas por pagar
router.get('/cxp', requireAuth, requireRole('admin','it','operador'), cxp.listar);
router.post('/cxp', requireAuth, requireRole('admin','it'), validate(v.cxp.crear), cxp.crear);
router.post('/cxp/:id/pago', requireAuth, requireRole('admin','it'), validate(v.paramsId, 'params'), validate(v.cxp.pago), cxp.pagar);
router.post('/cxp/:id/anular', requireAuth, requireRole('admin','it'), validate(v.paramsId, 'params'), cxp.anular);
router.post('/cxp/:id/factura', requireAuth, requireRole('admin','it'), validate(v.paramsId, 'params'), validate(v.cxp.factura), cxp.actualizarFactura);

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

