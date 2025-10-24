const ProductoTerminado = require('../../models/ProductoTerminado');

module.exports = {
  listar: async (_req, res) => {
    try { res.json(await ProductoTerminado.find().sort({ nombre: 1 })); } catch (e) { res.status(500).json({ error: e.message }); }
  },
  crear: async (req, res) => {
    try { const p = await ProductoTerminado.create(req.body); res.json(p); } catch (e) { res.status(400).json({ error: e.message }); }
  },
  actualizar: async (req, res) => {
    try { const { id } = req.params; const p = await ProductoTerminado.findByIdAndUpdate(id, req.body, { new: true }); res.json(p); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
};
