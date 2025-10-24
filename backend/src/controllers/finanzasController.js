// Controller de Finanzas con integración de patrones
const CuentaPorPagar = require('../models/CuentaPorPagar');
const CuentaPorCobrar = require('../models/CuentaPorCobrar');
const Auditoria = require('../models/Auditoria');
const SistemaCafeFacade = require('../domain/SistemaCafeFacade');
const PrecioStrategy = require('../domain/PrecioStrategy');
const InventarioObserver = require('../domain/InventarioObserver');

module.exports = {
  listarCxp: async (_req, res) => {
    try {
      const cxp = await CuentaPorPagar.find().populate('proveedor ordenCompra');
      res.json(cxp);
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  listarCxc: async (_req, res) => {
    try {
      const cxc = await CuentaPorCobrar.find().populate('cliente factura');
      res.json(cxc);
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  crearCxp: async (req, res) => {
    try {
      // Facade para lógica de negocio
      const facade = new SistemaCafeFacade();
      const cxp = await facade.crearCuentaPorPagar(req.body);
      // Observer para notificar cambios
      InventarioObserver.notify('cuentaPorPagarCreada', cxp);
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'cxp', payload: req.body, resultado: 'ok' });
      res.json(cxp);
    } catch (e) {
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'cxp', payload: req.body, resultado: 'error', mensaje: e.message });
      res.status(400).json({ error: e.message });
    }
  },
  crearCxc: async (req, res) => {
    try {
      // Facade para lógica de negocio
      const facade = new SistemaCafeFacade();
      const cxc = await facade.crearCuentaPorCobrar(req.body);
      InventarioObserver.notify('cuentaPorCobrarCreada', cxc);
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'cxc', payload: req.body, resultado: 'ok' });
      res.json(cxc);
    } catch (e) {
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'cxc', payload: req.body, resultado: 'error', mensaje: e.message });
      res.status(400).json({ error: e.message });
    }
  },
  calcularPrecio: async (req, res) => {
    try {
      // Strategy para cálculo de precio
      const strategy = new PrecioStrategy(req.body.tipo);
      const precio = strategy.calcular(req.body);
      res.json({ precio });
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};
