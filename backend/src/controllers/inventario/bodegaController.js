const Bodega = require('../../models/Bodega');
module.exports = {
  crear: async (req,res) => {
    try { const bodega = new Bodega(req.body); await bodega.save(); res.json(bodega); } catch(err){ res.status(400).json({ error: err.message }); }
  },
  listar: async (_req,res) => { const list = await Bodega.find({}); res.json(list); },
};
