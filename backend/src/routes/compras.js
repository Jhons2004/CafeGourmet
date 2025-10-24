const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators/compras');
const proveedorCtrl = require('../controllers/proveedorController');
const ocCtrl = require('../controllers/ordenCompraController');
const recCtrl = require('../controllers/recepcionController');

// Proveedores
router.get('/proveedores', requireAuth, requireRole('admin','it','rrhh','operador'), proveedorCtrl.listar);
router.post('/proveedores', requireAuth, requireRole('admin','it'), validate(v.proveedor.crear), proveedorCtrl.crear);
router.patch('/proveedores/:id', requireAuth, requireRole('admin','it'), validate(v.proveedor.paramsId, 'params'), validate(v.proveedor.actualizar), proveedorCtrl.actualizar);

// Ordenes de compra
router.get('/ordenes', requireAuth, requireRole('admin','it','operador'), ocCtrl.listar);
router.post('/ordenes', requireAuth, requireRole('admin','it'), validate(v.ordenCompra.crear), ocCtrl.crear);
router.post('/ordenes/:id/aprobar', requireAuth, requireRole('admin','it'), validate(v.ordenCompra.paramsId, 'params'), validate(v.ordenCompra.aprobar), ocCtrl.aprobar);

// Recepciones de lotes
router.get('/recepciones', requireAuth, requireRole('admin','it','operador'), recCtrl.listar);
router.post('/recepciones', requireAuth, requireRole('admin','it','operador'), validate(v.recepcion.crear), recCtrl.crear);

module.exports = router;
