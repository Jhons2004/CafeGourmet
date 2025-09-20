const mongoose = require('mongoose');
const RecepcionLote = require('../models/RecepcionLote');
const OrdenCompra = require('../models/OrdenCompra');
const Proveedor = require('../models/Proveedor');
const Grano = require('../models/Grano');
const Auditoria = require('../models/Auditoria');

module.exports = {
  crear: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { ordenCompra, lotes } = req.body;
      const oc = await OrdenCompra.findById(ordenCompra).session(session);
      if (!oc) throw new Error('OC inválida');
      if (!['aprobada','recibida'].includes(oc.estado)) throw new Error('OC debe estar aprobada');
      const prov = await Proveedor.findById(oc.proveedor).session(session);
      if (!prov) throw new Error('Proveedor inválido');

      const rec = await RecepcionLote.create([{
        ordenCompra: oc._id,
        proveedor: prov._id,
        lotes,
        observaciones: req.body.observaciones || null
      }], { session });

      // Crear documentos de Grano por lote
      for (const l of lotes) {
        await Grano.create([{
          tipo: l.tipo,
          cantidad: l.cantidad,
          lote: l.lote,
          costoUnitario: l.costoUnitario,
          proveedor: prov.nombre,
          ubicacion: 'ALM-PRINCIPAL',
          estado: 'activo'
        }], { session });
      }

      oc.estado = 'recibida';
      oc.fechaRecepcion = new Date();
      await oc.save({ session });

      await session.commitTransaction();
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'recepcion', payload: req.body, resultado: 'ok' });
      res.json(rec[0]);
    } catch (e) {
      await session.abortTransaction();
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'crear', recurso: 'recepcion', payload: req.body, resultado: 'error', mensaje: e.message });
      res.status(400).json({ error: e.message });
    } finally {
      session.endSession();
    }
  },
  listar: async (_req, res) => {
    try { res.json(await RecepcionLote.find().populate('ordenCompra proveedor').sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ error: e.message }); }
  }
};
