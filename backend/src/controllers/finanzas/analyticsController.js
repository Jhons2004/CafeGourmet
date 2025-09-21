const CuentaPorPagar = require('../../models/CuentaPorPagar');
const CuentaPorCobrar = require('../../models/CuentaPorCobrar');

function bucketize(diffDays) {
  if (diffDays < 0) return 'no_vencido';
  if (diffDays <= 30) return 'd1_30';
  if (diffDays <= 60) return 'd31_60';
  if (diffDays <= 90) return 'd61_90';
  return 'd90_plus';
}

async function buildAging(Model) {
  const hoy = new Date();
  const docs = await Model.find({ estado: { $nin: ['pagado','cobrado','anulado'] }, saldo: { $gt: 0 } })
    .select('saldo fechaVencimiento')
    .lean();
  const totals = { no_vencido: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90_plus: 0 };
  const counts = { no_vencido: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90_plus: 0 };
  for (const d of docs) {
    const dd = Math.floor((hoy - new Date(d.fechaVencimiento)) / (1000*60*60*24));
    const b = bucketize(dd);
    totals[b] += Number(d.saldo||0);
    counts[b] += 1;
  }
  return { totals, counts };
}

module.exports = {
  aging: async (req, res) => {
    try {
      const tipo = (req.query.tipo||'both').toLowerCase();
      const out = {};
      if (tipo === 'cxp' || tipo === 'both') {
        out.cxp = await buildAging(CuentaPorPagar);
      }
      if (tipo === 'cxc' || tipo === 'both') {
        out.cxc = await buildAging(CuentaPorCobrar);
      }
      res.json(out);
    } catch (e) { res.status(500).json({ error: e.message }); }
  }
};
