const ControlCalidadProceso = require('../../models/ControlCalidadProceso');

module.exports = {
  listar: async (_req, res) => {
    try { res.json(await ControlCalidadProceso.find().sort({ createdAt: -1 })); }
    catch (e) { res.status(500).json({ error: e.message }); }
  },
  crear: async (req, res) => {
    try {
      const { op, etapa, checklist, resultado, notas } = req.body;
      const cc = await ControlCalidadProceso.create({ op, etapa, checklist, resultado, notas, usuario: req.user?.email || 'system' });
      res.json(cc);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};
