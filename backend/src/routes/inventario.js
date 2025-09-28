const express = require('express');
const router = express.Router();
// Controladores legacy simples
const inventarioController = require('../controllers/inventarioController');
// Nuevos controladores avanzados
const bodegaController = require('../controllers/inventario/bodegaController');
const ubicacionController = require('../controllers/inventario/ubicacionController');
const movimientoController = require('../controllers/inventario/movimientoController');
const stockController = require('../controllers/inventario/stockController');
const reservaController = require('../controllers/inventario/reservaController');
const conteoController = require('../controllers/inventario/conteoController');
const loteController = require('../controllers/inventario/loteController');
const kardexController = require('../controllers/inventario/kardexController');

const validate = require('../middleware/validate');
const invSchema = require('../validators/inventario');

// Legacy endpoints (mantener compatibilidad)
router.post('/registrar', validate(invSchema.registrarGrano), inventarioController.registrarGrano);
router.post('/actualizar', validate(invSchema.actualizarStock), inventarioController.actualizarStock);
router.get('/', inventarioController.verInventario);

// Multi-bodega
router.post('/bodegas', bodegaController.crear);
router.get('/bodegas', bodegaController.listar);

// Ubicaciones
router.post('/ubicaciones', ubicacionController.crear);
router.get('/ubicaciones', ubicacionController.listar);

// Movimientos y costeo
router.post('/movimientos', movimientoController.registrar);
router.get('/movimientos', movimientoController.listar);

// Stock consolidado
router.get('/stock', stockController.listar);

// Reservas
router.post('/reservas', reservaController.crear);
router.get('/reservas', reservaController.listar);
router.post('/reservas/:id/liberar', reservaController.liberar);

// Conteos cíclicos
router.post('/conteos', conteoController.crear);
router.post('/conteos/:id/cerrar', conteoController.cerrar);
router.get('/conteos', conteoController.listar);

// Lotes
router.post('/lotes', loteController.crear);
router.get('/lotes', loteController.listar);
router.put('/lotes/:id', loteController.actualizar);

// Kardex y valorización
router.get('/kardex', kardexController.kardex);
router.get('/valuacion', kardexController.valorizacion);

module.exports = router;

