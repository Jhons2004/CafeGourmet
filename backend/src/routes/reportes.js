const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/reportesController');

router.get('/kpis', requireAuth, requireRole('admin','it','operador'), ctrl.kpis);
router.get('/ventas-diarias', requireAuth, requireRole('admin','it','operador'), ctrl.ventasDiarias);
router.get('/merma', requireAuth, requireRole('admin','it','operador'), ctrl.mermaProduccion);

module.exports = router;
