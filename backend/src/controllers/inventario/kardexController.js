const MovimientoInventario = require('../../models/MovimientoInventario');
const Stock = require('../../models/Stock');

module.exports = {
  kardex: async (req,res) => {
    const { productoRef, tipoProducto, desde, hasta, bodega, loteRef, ubicacion, limit, skip, export: exportFmt } = req.query;
    if (!productoRef || !tipoProducto) return res.status(400).json({ error: 'productoRef y tipoProducto requeridos' });
    const filter = { productoRef, tipoProducto };
    if (bodega) filter.$or = [{ bodegaOrigen: bodega }, { bodegaDestino: bodega }];
    if (loteRef) filter.loteRef = loteRef;
    if (ubicacion) filter.$or = [{ ubicacionOrigen: ubicacion }, { ubicacionDestino: ubicacion }];
    if (desde || hasta) {
      filter.fecha = {};
      if (desde) filter.fecha.$gte = new Date(desde);
      if (hasta) filter.fecha.$lte = new Date(hasta);
    }
    const movimientos = await MovimientoInventario.find(filter).sort({ fecha: 1, _id: 1 });
    let saldo = 0; let costoPromedio = 0; const detalle = [];
    for (const m of movimientos) {
      const signo = ['ENTRADA','AJUSTE_POS'].includes(m.tipo) ? 1 : (['SALIDA','AJUSTE_NEG'].includes(m.tipo) ? -1 : 0);
      if (signo !== 0) {
        if (signo > 0) {
          // recalcular costoPromedio para entrada
          const totalAnterior = saldo * costoPromedio;
          const totalNuevo = totalAnterior + (m.cantidad * (m.costoUnitario||0));
          saldo += m.cantidad;
          costoPromedio = saldo > 0 ? (totalNuevo / saldo) : 0;
        } else {
          saldo -= m.cantidad;
          if (saldo < 0) saldo = 0;
        }
      }
      detalle.push({ id: m._id, fecha: m.fecha, tipo: m.tipo, cantidad: m.cantidad * signo, costoUnitario: m.costoUnitario, saldo, costoPromedio });
    }
  const totalMovs = detalle.length;
  let detallePagina = detalle;
  const lim = parseInt(limit,10); const sk = parseInt(skip,10);
    if (!isNaN(lim) && lim > 0) {
      detallePagina = detalle.slice(isNaN(sk)?0:sk, (isNaN(sk)?0:sk)+lim);
    }
    if (exportFmt === 'csv') {
      const header = 'fecha,tipo,cantidad,costoUnitario,saldo,costoPromedio,loteRef';
      const rows = detalle.map(d => [d.fecha.toISOString(), d.tipo, d.cantidad, d.costoUnitario??'', d.saldo, d.costoPromedio, d.loteRef||''].join(','));
      const csv = [header, ...rows].join('\n');
      res.setHeader('Content-Type','text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="kardex.csv"');
      return res.send(csv);
    }
    res.json({ productoRef, tipoProducto, saldoFinal: saldo, costoPromedioFinal: costoPromedio, totalMovs, movimientos: detallePagina });
  },
  valorizacion: async (_req,res) => {
    const stocks = await Stock.find({});
    const resumen = {};
    let total = 0;
    for (const s of stocks) {
      const val = s.cantidad * s.costoPromedio;
      total += val;
      const key = s.tipoProducto;
      resumen[key] = (resumen[key]||0) + val;
    }
    res.json({ total, porTipo: resumen });
  }
};
