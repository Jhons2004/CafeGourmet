const PedidoVenta = require('../../models/PedidoVenta');
const StockProductoService = require('../../services/StockProductoService');

module.exports = {
  listar: async (req, res) => {
    try { res.json(await PedidoVenta.find().populate('cliente items.producto').sort({ createdAt: -1 })); }
    catch (e) { res.status(500).json({ error: e.message }); }
  },
  crear: async (req, res) => {
    try { const p = await PedidoVenta.create(req.body); res.json(p); }
    catch (e) { res.status(400).json({ error: e.message }); }
  },
  confirmar: async (req, res) => {
    try { const { id } = req.params; const p = await PedidoVenta.findById(id); if (!p) throw new Error('Pedido no encontrado');
      if (p.estado !== 'borrador') throw new Error('Solo se puede confirmar un pedido en borrador');
      p.estado = 'confirmado'; await p.save();
      // Crear reservas de stock (simplificado: bodega/ubicacion primera encontrada)
      const Bodega = require('../../models/Bodega');
      const Ubicacion = require('../../models/Ubicacion');
      const ReservaStock = require('../../models/ReservaStock');
      const principal = await Bodega.findOne();
      const ubi = principal ? await Ubicacion.findOne({ bodega: principal._id }) : null;
      if (principal && ubi) {
        for (const it of p.items) {
          await ReservaStock.create({ productoRef: it.producto, tipoProducto: 'productoTerminado', bodega: principal._id, ubicacion: ubi._id, cantidad: it.cantidad, referencia: p.codigo, notas: 'Reserva auto pedido' });
        }
      }
      res.json(p);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  despachar: async (req, res) => {
    try { const { id } = req.params; const p = await PedidoVenta.findById(id);
      if (!p) throw new Error('Pedido no encontrado');
      if (p.estado !== 'confirmado') throw new Error('Solo se puede despachar un pedido confirmado');
      const items = (p.items || []).map(i => ({ productoId: i.producto, cantidad: i.cantidad }));
      await StockProductoService.despachar(items);
      // Marcar reservas como CONSUMIDA
      try {
        const ReservaStock = require('../../models/ReservaStock');
        await ReservaStock.updateMany({ referencia: p.codigo, estado: 'ACTIVA' }, { $set: { estado: 'CONSUMIDA' } });
      } catch(e) { /* log opcional */ }
      p.estado = 'despachado'; p.fechaDespacho = new Date(); await p.save(); res.json(p);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  cancelar: async (req, res) => {
    try { const { id } = req.params; const p = await PedidoVenta.findById(id); if (!p) throw new Error('Pedido no encontrado');
      if (p.estado === 'despachado') throw new Error('No se puede cancelar un pedido despachado');
      const previo = p.estado;
      p.estado = 'cancelado'; await p.save();
      if (previo === 'confirmado') {
        try {
          const ReservaStock = require('../../models/ReservaStock');
            await ReservaStock.updateMany({ referencia: p.codigo, estado: 'ACTIVA' }, { $set: { estado: 'LIBERADA' } });
        } catch(e){ /* log */ }
      }
      res.json(p);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};
