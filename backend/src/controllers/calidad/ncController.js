const NoConformidad = require('../../models/NoConformidad');

module.exports = {
  listar: async (_req, res) => {
    try { res.json(await NoConformidad.find().sort({ createdAt: -1 })); }
    catch (e) { res.status(500).json({ error: e.message }); }
  },
  crear: async (req, res) => {
    try { const nc = await NoConformidad.create({ ...req.body, usuario: req.user?.email || 'system' }); res.json(nc); }
    catch (e) { res.status(400).json({ error: e.message }); }
  },
  cerrar: async (req, res) => {
    try { const { id } = req.params; const nc = await NoConformidad.findById(id); if (!nc) throw new Error('NC no encontrada');
      nc.estado = 'cerrada'; nc.fechaCierre = new Date(); await nc.save(); res.json(nc);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};
