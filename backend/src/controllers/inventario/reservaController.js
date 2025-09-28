const ReservaStock = require('../../models/ReservaStock');
const Stock = require('../../models/Stock');

async function disponible(productoRef, tipoProducto, bodega, ubicacion){
  const stocks = await Stock.find({ productoRef, tipoProducto, bodega, ubicacion });
  const qty = stocks.reduce((acc,s)=> acc + s.cantidad,0);
  const reservadas = await ReservaStock.aggregate([
    { $match: { productoRef, tipoProducto, bodega, ubicacion, estado: 'ACTIVA' } },
    { $group: { _id: null, total: { $sum: '$cantidad' } } }
  ]);
  const resQty = reservadas.length? reservadas[0].total:0;
  return qty - resQty;
}

module.exports = {
  crear: async (req,res) => {
    try {
      const { productoRef, tipoProducto, bodega, ubicacion, cantidad } = req.body;
      const disp = await disponible(productoRef, tipoProducto, bodega, ubicacion);
      if (disp < cantidad) return res.status(400).json({ error: 'Stock insuficiente para reservar', disponible: disp });
      const reserva = new ReservaStock(req.body);
      await reserva.save();
      res.json(reserva);
    } catch(err){ res.status(400).json({ error: err.message }); }
  },
  listar: async (req,res) => {
    const filter = {};
    ['productoRef','estado','bodega'].forEach(k=>{ if(req.query[k]) filter[k]=req.query[k]; });
    const list = await ReservaStock.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json(list);
  },
  liberar: async (req,res) => {
    const r = await ReservaStock.findById(req.params.id);
    if(!r) return res.status(404).json({ error: 'No encontrada' });
    if(r.estado !== 'ACTIVA') return res.status(400).json({ error: 'Estado no permite liberar' });
    r.estado = 'LIBERADA';
    await r.save();
    res.json(r);
  }
};
