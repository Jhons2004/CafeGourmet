const PedidoVenta = require('../../models/PedidoVenta');
const Factura = require('../../models/Factura');
const CuentaPorCobrar = require('../../models/CuentaPorCobrar');

module.exports = {
  listar: async (_req, res) => {
    try { res.json(await Factura.find().populate('pedido').sort({ createdAt: -1 })); }
    catch (e) { res.status(500).json({ error: e.message }); }
  },
  emitir: async (req, res) => {
    try {
      const { pedidoId } = req.body; const p = await PedidoVenta.findById(pedidoId);
      if (!p) throw new Error('Pedido no encontrado');
      if (p.estado !== 'despachado') throw new Error('Solo se factura pedido despachado');
      const f = await Factura.create({ pedido: p._id, subtotal: p.subtotal, impuestos: p.impuestos, total: p.total });
      // Auto crear Cuenta por Cobrar (CxC) si no existe
      try {
        const existe = await CuentaPorCobrar.findOne({ factura: f._id, estado: { $ne: 'anulado' } });
        if (!existe) {
          const venc = new Date(); venc.setDate(venc.getDate() + 15);
          await CuentaPorCobrar.create({ cliente: p.cliente, factura: f._id, fechaVencimiento: venc, moneda: 'PEN', monto: f.total, saldo: f.total });
        }
      } catch (e) {
        // no bloquear emisión de factura por CxC; auditar si tuvieramos auditoría de ventas
      }
      res.json(f);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  anular: async (req, res) => {
    try { const { id } = req.params; const f = await Factura.findById(id); if (!f) throw new Error('Factura no encontrada');
      f.estado = 'anulada'; await f.save(); res.json(f);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};
