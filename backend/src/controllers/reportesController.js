const PedidoVenta = require('../models/PedidoVenta');
const Factura = require('../models/Factura');
const StockProducto = require('../models/StockProducto');
const OrdenProduccion = require('../models/OrdenProduccion');
const Grano = require('../models/Grano');

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

module.exports = {
  kpis: async (_req, res) => {
    try {
      const hoy = startOfDay();

      const [ventasHoyAgg, pedidosConfirmados, pedidosDespachados, stockPTAgg, opsEnProceso, lotesBloqueados] = await Promise.all([
        Factura.aggregate([
          { $match: { estado: 'emitida', createdAt: { $gte: hoy } } },
          { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
        ]),
        PedidoVenta.countDocuments({ estado: 'confirmado' }),
        PedidoVenta.countDocuments({ estado: 'despachado', fechaDespacho: { $gte: hoy } }),
        StockProducto.aggregate([{ $group: { _id: null, cantidad: { $sum: '$cantidad' } } }]),
        OrdenProduccion.countDocuments({ estado: 'en_proceso' }),
        Grano.countDocuments({ estado: 'bloqueado' })
      ]);

      const ventasHoy = (ventasHoyAgg[0]?.total) || 0;
      const facturasHoy = (ventasHoyAgg[0]?.count) || 0;
      const stockPT = (stockPTAgg[0]?.cantidad) || 0;

      res.json({ ventasHoy, facturasHoy, pedidosConfirmados, pedidosDespachados, stockPT, opsEnProceso, lotesBloqueados });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  ventasDiarias: async (req, res) => {
    try {
      const days = Math.max(1, Math.min(90, Number(req.query.days) || 7));
      const from = startOfDay(daysAgo(days - 1));
      const rows = await Factura.aggregate([
        { $match: { estado: 'emitida', createdAt: { $gte: from } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
      res.json(rows.map(r => ({ fecha: r._id, total: r.total, count: r.count })));
    } catch (e) { res.status(500).json({ error: e.message }); }
  },

  mermaProduccion: async (req, res) => {
    try {
      const days = Math.max(1, Math.min(180, Number(req.query.days) || 30));
      const from = daysAgo(days);
      const rows = await OrdenProduccion.aggregate([
        { $match: { fechaCierre: { $gte: from } } },
        { $group: { _id: null, merma: { $sum: '$merma' }, cerradas: { $sum: 1 } } }
      ]);
      res.json({ merma: rows[0]?.merma || 0, cerradas: rows[0]?.cerradas || 0 });
    } catch (e) { res.status(500).json({ error: e.message }); }
  }
};
