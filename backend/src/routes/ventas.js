const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../validators/ventas');

const clienteCtrl = require('../controllers/ventas/clienteController');
const productoCtrl = require('../controllers/ventas/productoController');
const pedidoCtrl = require('../controllers/ventas/pedidoController');
const facturaCtrl = require('../controllers/ventas/facturaController');

// Clientes
router.get('/clientes', requireAuth, requireRole('admin','it','operador'), clienteCtrl.listar);
router.post('/clientes', requireAuth, requireRole('admin','it'), validate(v.cliente.crear), clienteCtrl.crear);
router.patch('/clientes/:id', requireAuth, requireRole('admin','it'), validate(v.cliente.paramsId, 'params'), validate(v.cliente.actualizar), clienteCtrl.actualizar);

// Productos terminados
router.get('/productos', requireAuth, requireRole('admin','it','operador'), productoCtrl.listar);
router.post('/productos', requireAuth, requireRole('admin','it'), validate(v.producto.crear), productoCtrl.crear);
router.patch('/productos/:id', requireAuth, requireRole('admin','it'), validate(v.producto.paramsId, 'params'), validate(v.producto.actualizar), productoCtrl.actualizar);

// Pedidos
router.get('/pedidos', requireAuth, requireRole('admin','it','operador'), pedidoCtrl.listar);
router.post('/pedidos', requireAuth, requireRole('admin','it','operador'), validate(v.pedido.crear), pedidoCtrl.crear);
router.post('/pedidos/:id/confirmar', requireAuth, requireRole('admin','it','operador'), validate(v.pedido.paramsId, 'params'), pedidoCtrl.confirmar);
router.post('/pedidos/:id/despachar', requireAuth, requireRole('admin','it','operador'), validate(v.pedido.paramsId, 'params'), pedidoCtrl.despachar);
router.post('/pedidos/:id/cancelar', requireAuth, requireRole('admin','it'), validate(v.pedido.paramsId, 'params'), pedidoCtrl.cancelar);

// Facturas
router.get('/facturas', requireAuth, requireRole('admin','it','operador'), facturaCtrl.listar);
router.post('/facturas', requireAuth, requireRole('admin','it'), validate(v.factura.emitir), facturaCtrl.emitir);
router.post('/facturas/:id/anular', requireAuth, requireRole('admin','it'), validate(v.factura.paramsId, 'params'), facturaCtrl.anular);

module.exports = router;
