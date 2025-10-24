const Lote = require('../../models/Lote');
module.exports = {
  crear: async (req,res) => {
    try { const lote = new Lote(req.body); await lote.save(); res.json(lote); } catch(err){ res.status(400).json({ error: err.message }); }
  },
  listar: async (req,res) => {
    const filter = {};
    if (req.query.productoRef) filter.productoRef = req.query.productoRef;
    if (req.query.estado) filter.estado = req.query.estado;
    const list = await Lote.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(list);
  },
  actualizar: async (req,res) => {
    try { const lote = await Lote.findByIdAndUpdate(req.params.id, req.body, { new: true }); if(!lote) return res.status(404).json({ error: 'No encontrado' }); res.json(lote);} catch(err){ res.status(400).json({ error: err.message }); }
  }
};
