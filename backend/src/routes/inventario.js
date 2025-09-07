const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

router.post('/registrar', inventarioController.registrarGrano);
router.post('/actualizar', inventarioController.actualizarStock);
router.get('/', inventarioController.verInventario);

module.exports = router;
