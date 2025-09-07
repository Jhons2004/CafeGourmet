const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/produccionController');

router.get('/', ctrl.listar);
router.post('/crear', ctrl.crear);
router.post('/:id/etapa', ctrl.etapa);
router.post('/:id/consumo', ctrl.consumo);
router.post('/:id/cerrar', ctrl.cerrar);

module.exports = router;
