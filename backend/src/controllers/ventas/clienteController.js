const Cliente = require('../../models/Cliente');

module.exports = {
  listar: async (_req, res) => {
    try { res.json(await Cliente.find().sort({ nombre: 1 })); } catch (e) { res.status(500).json({ error: e.message }); }
  },
  crear: async (req, res) => {
    try { const c = await Cliente.create(req.body); res.json(c); } catch (e) { res.status(400).json({ error: e.message }); }
  },
  actualizar: async (req, res) => {
    try { const { id } = req.params; const c = await Cliente.findByIdAndUpdate(id, req.body, { new: true }); res.json(c); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
};
