const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/produccionController');
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators/produccion');

// Listar con paginación y filtros
router.get('/', requireAuth, validate(v.listarQuery, 'query'), ctrl.listar);

// Crear OP
router.post('/crear', requireAuth, requireRole('admin','it','operador'), validate(v.crear), ctrl.crear);

// Avanzar etapa
router.post('/:id/etapa', requireAuth, requireRole('admin','it','operador'), validate(v.paramsId, 'params'), validate(v.etapaBody), ctrl.etapa);

// Registrar consumo manual
router.post('/:id/consumo', requireAuth, requireRole('admin','it','operador'), validate(v.paramsId, 'params'), validate(v.consumoBody), ctrl.consumo);

// Cerrar OP
router.post('/:id/cerrar', requireAuth, requireRole('admin','it','operador'), validate(v.paramsId, 'params'), validate(v.cerrarBody), ctrl.cerrar);

// Consumir BOM manualmente (si no se auto-consumió)
router.post('/:id/consumir-bom', requireAuth, requireRole('admin','it','operador'), validate(v.paramsId,'params'), ctrl.consumirBOM);

module.exports = router;
