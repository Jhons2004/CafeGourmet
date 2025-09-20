const OrdenCompra = require('../models/OrdenCompra');
const Proveedor = require('../models/Proveedor');
const Auditoria = require('../models/Auditoria');

module.exports = {
  crear: async (req, res) => {
    try {
      const { proveedor } = req.body;
      const prov = await Proveedor.findById(proveedor);
      if (!prov) return res.status(400).json({ error: 'Proveedor inválido' });
      const doc = await OrdenCompra.create(req.body);
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'orden_compra', payload: req.body, resultado: 'ok' });
      res.json(doc);
    } catch (e) {
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'orden_compra', payload: req.body, resultado: 'error', mensaje: e.message });
      res.status(400).json({ error: e.message });
    }
  },
  listar: async (_req, res) => {
    try { res.json(await OrdenCompra.find().populate('proveedor').sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ error: e.message }); }
  },
  aprobar: async (req, res) => {
    try {
      const { id } = req.params;
      const oc = await OrdenCompra.findById(id);
      if (!oc) return res.status(404).json({ error: 'OC no encontrada' });
      if (oc.estado !== 'borrador') return res.status(400).json({ error: 'Solo borrador puede aprobarse' });
      oc.estado = 'aprobada';
      oc.fechaAprobacion = new Date();
      await oc.save();
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'aprobar', recurso: 'orden_compra', payload: { id }, resultado: 'ok' });
      res.json(oc);
    } catch (e) {
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'aprobar', recurso: 'orden_compra', payload: { id: req.params.id }, resultado: 'error', mensaje: e.message });
      res.status(400).json({ error: e.message });
    }
  }
};
