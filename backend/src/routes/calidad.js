const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators/calidad');

const recCtrl = require('../controllers/calidad/recepcionController');
const procCtrl = require('../controllers/calidad/procesoController');
const ncCtrl = require('../controllers/calidad/ncController');

// QC recepciones
router.get('/recepciones', requireAuth, requireRole('admin','it','operador'), recCtrl.listar);
router.post('/recepciones', requireAuth, requireRole('admin','it','operador'), validate(v.recepcion.crear), recCtrl.crear);

// QC proceso
router.get('/proceso', requireAuth, requireRole('admin','it','operador'), procCtrl.listar);
router.post('/proceso', requireAuth, requireRole('admin','it','operador'), validate(v.proceso.crear), procCtrl.crear);

// No conformidades
router.get('/nc', requireAuth, requireRole('admin','it','operador'), ncCtrl.listar);
router.post('/nc', requireAuth, requireRole('admin','it','operador'), validate(v.nc.crear), ncCtrl.crear);
router.post('/nc/:id/cerrar', requireAuth, requireRole('admin','it'), validate(v.nc.paramsId, 'params'), ncCtrl.cerrar);

module.exports = router;
