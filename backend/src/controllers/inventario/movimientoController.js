const { registrarMovimiento } = require('../../services/inventoryCostingService');
const MovimientoInventario = require('../../models/MovimientoInventario');
module.exports = {
  registrar: async (req,res) => {
    try {
      const mov = await registrarMovimiento(req.body);
      res.json(mov);
    } catch(err){
      res.status(400).json({ error: err.message });
    }
  },
  listar: async (req,res) => {
    const filter = {};
    if (req.query.productoRef) filter.productoRef = req.query.productoRef;
    if (req.query.tipo) filter.tipo = req.query.tipo;
    const list = await MovimientoInventario.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(list);
  }
};
