const ControlCalidadRecepcion = require('../../models/ControlCalidadRecepcion');
const RecepcionLote = require('../../models/RecepcionLote');
const Grano = require('../../models/Grano');

module.exports = {
  listar: async (_req, res) => {
    try { res.json(await ControlCalidadRecepcion.find().sort({ createdAt: -1 })); }
    catch (e) { res.status(500).json({ error: e.message }); }
  },
  crear: async (req, res) => {
    try {
      const { recepcion, lote, mediciones, resultado, notas } = req.body;
      const r = await RecepcionLote.findById(recepcion);
      if (!r) throw new Error('Recepción no encontrada');
      const cc = await ControlCalidadRecepcion.create({ recepcion, lote, mediciones, resultado, notas, usuario: req.user?.email || 'system' });
      // actualizar estado de Grano por lote
      if (resultado === 'rechazado') {
        await Grano.updateMany({ lote }, { $set: { estado: 'bloqueado' } });
      } else if (resultado === 'aprobado') {
        await Grano.updateMany({ lote }, { $set: { estado: 'activo' } });
      }
      res.json(cc);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};
