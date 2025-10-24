// Controller de Compras con integración de patrones
const OrdenCompra = require('../models/OrdenCompra');
const Proveedor = require('../models/Proveedor');
const Auditoria = require('../models/Auditoria');
const ProveedorAdapter = require('../domain/ProveedorAdapter');
const SistemaCafeFacade = require('../domain/SistemaCafeFacade');

module.exports = {
  crear: async (req, res) => {
    try {
      // Adapter para proveedor externo
      const proveedorAdaptado = ProveedorAdapter.adaptar(req.body.proveedor);
      // Facade para lógica de negocio
      const facade = new SistemaCafeFacade();
      const orden = await facade.crearOrdenCompra({ ...req.body, proveedor: proveedorAdaptado });
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'compras', payload: req.body, resultado: 'ok' });
      res.json(orden);
    } catch (e) {
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'compras', payload: req.body, resultado: 'error', mensaje: e.message });
      res.status(400).json({ error: e.message });
    }
  },
  listar: async (_req, res) => {
    try { res.json(await OrdenCompra.find().populate('proveedor').sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ error: e.message }); }
  }
};
