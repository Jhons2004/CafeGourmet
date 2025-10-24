const mongoose = require('mongoose');
const RecepcionLote = require('../models/RecepcionLote');
const OrdenCompra = require('../models/OrdenCompra');
const Proveedor = require('../models/Proveedor');
const Grano = require('../models/Grano');
const Auditoria = require('../models/Auditoria');

module.exports = {
  crear: async (req, res) => {
    try {
      const { ordenCompra, lotes } = req.body;
      
      // Verificar que la OC existe y está en estado válido
      const oc = await OrdenCompra.findById(ordenCompra);
      if (!oc) throw new Error('Orden de compra no encontrada');
      if (!['aprobada','recibida'].includes(oc.estado)) throw new Error('La orden de compra debe estar aprobada');
      
      // Verificar que el proveedor existe
      const prov = await Proveedor.findById(oc.proveedor);
      if (!prov) throw new Error('Proveedor no encontrado');

      // Crear la recepción de lote
      const rec = await RecepcionLote.create({
        ordenCompra: oc._id,
        proveedor: prov._id,
        lotes,
        observaciones: req.body.observaciones || null
      });

      // Crear documentos de Grano por cada lote recibido
      for (const l of lotes) {
        await Grano.create({
          tipo: l.tipo,
          cantidad: l.cantidad,
          lote: l.lote,
          costoUnitario: l.costoUnitario,
          proveedor: prov.nombre,
          ubicacion: 'ALM-PRINCIPAL',
          estado: 'activo'
        });
      }

      // Actualizar estado de la orden de compra
      oc.estado = 'recibida';
      oc.fechaRecepcion = new Date();
      await oc.save();

      // Crear registro de auditoría
      await Auditoria.create({ 
        usuario: req.user?.email || 'system', 
        accion: 'crear', 
        recurso: 'recepcion', 
        payload: req.body, 
        resultado: 'ok' 
      });
      
      res.json(rec);
    } catch (e) {
      // Crear registro de auditoría para errores
      await Auditoria.create({ 
        usuario: req.user?.email || 'system', 
        accion: 'crear', 
        recurso: 'recepcion', 
        payload: req.body, 
        resultado: 'error', 
        mensaje: e.message 
      });
      res.status(400).json({ error: e.message });
    }
  },
  listar: async (_req, res) => {
    try { res.json(await RecepcionLote.find().populate('ordenCompra proveedor').sort({ createdAt: -1 })); } catch (e) { res.status(500).json({ error: e.message }); }
  }
};
