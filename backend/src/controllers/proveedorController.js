const Proveedor = require('../models/Proveedor');
const Auditoria = require('../models/Auditoria');

module.exports = {
  crear: async (req, res) => {
    try {
      const doc = await Proveedor.create(req.body);
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'proveedor', payload: req.body, resultado: 'ok' });
      res.json(doc);
    } catch (e) {
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'proveedor', payload: req.body, resultado: 'error', mensaje: e.message });
      res.status(400).json({ error: e.message });
    }
  },
  listar: async (_req, res) => {
    try { res.json(await Proveedor.find().sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ error: e.message }); }
  },
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const doc = await Proveedor.findByIdAndUpdate(id, req.body, { new: true });
      if (!doc) return res.status(404).json({ error: 'Proveedor no encontrado' });
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'actualizar', recurso: 'proveedor', payload: { id, ...req.body }, resultado: 'ok' });
      res.json(doc);
    } catch (e) {
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'actualizar', recurso: 'proveedor', payload: { id: req.params.id, ...req.body }, resultado: 'error', mensaje: e.message });
      res.status(400).json({ error: e.message });
    }
  }
};
