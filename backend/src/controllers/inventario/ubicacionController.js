const Ubicacion = require('../../models/Ubicacion');
module.exports = {
  crear: async (req,res) => { try { const u = new Ubicacion(req.body); await u.save(); res.json(u); } catch(err){ res.status(400).json({ error: err.message }); } },
  listar: async (req,res) => { const filter = {}; if (req.query.bodega) filter.bodega = req.query.bodega; const list = await Ubicacion.find(filter); res.json(list); }
};
