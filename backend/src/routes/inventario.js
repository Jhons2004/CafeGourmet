const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const validate = require('../middleware/validate');
const invSchema = require('../validators/inventario');

router.post('/registrar', validate(invSchema.registrarGrano), inventarioController.registrarGrano);
router.post('/actualizar', validate(invSchema.actualizarStock), inventarioController.actualizarStock);
router.get('/', inventarioController.verInventario);

module.exports = router;
