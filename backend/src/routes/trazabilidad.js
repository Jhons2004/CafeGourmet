const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const trazabilidadCtrl = require('../controllers/trazabilidadController');

// Trazabilidad por lote
router.get('/lote/:lote', requireAuth, requireRole('admin','it','operador'), trazabilidadCtrl.porLote);

// Trazabilidad por orden de producción
router.get('/op/:codigo', requireAuth, requireRole('admin','it','operador'), trazabilidadCtrl.porOP);

module.exports = router;