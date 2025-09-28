const Stock = require('../../models/Stock');
module.exports = {
  listar: async (req,res) => {
    const filter = {};
    if (req.query.productoRef) filter.productoRef = req.query.productoRef;
    if (req.query.tipoProducto) filter.tipoProducto = req.query.tipoProducto;
    if (req.query.bodega) filter.bodega = req.query.bodega;
    if (req.query.lote) filter.lote = req.query.lote;
    const list = await Stock.find(filter).limit(1000);
    res.json(list);
  }
};
