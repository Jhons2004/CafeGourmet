const RecepcionLote = require('../models/RecepcionLote');
const OrdenProduccion = require('../models/OrdenProduccion');
const Grano = require('../models/Grano');

module.exports = {
  // Trazabilidad completa de un lote desde recepción hasta consumo
  porLote: async (req, res) => {
    try {
      const { lote } = req.params;
      
      // 1. Buscar recepción original del lote
      const recepcion = await RecepcionLote.findOne({ 
        'lotes.lote': lote 
      }).populate('proveedor ordenCompra');
      
      const loteInfo = recepcion?.lotes.find(l => l.lote === lote);
      
      // 2. Buscar documentos de inventario con este lote
      const inventario = await Grano.find({ lote }).sort({ fechaRegistro: 1 });
      
      // 3. Buscar consumos en órdenes de producción
      const consumos = await OrdenProduccion.find({
        'consumos.tipo': loteInfo?.tipo || '',
        fechaCreacion: { $gte: recepcion?.fechaRecepcion || new Date('2000-01-01') }
      }).sort({ fechaCreacion: 1 });
      
      // 4. Calcular balance
      const recibido = loteInfo?.cantidad || 0;
      const disponible = inventario.reduce((sum, g) => sum + (g.cantidad || 0), 0);
      const consumido = recibido - disponible;
      
      res.json({
        lote,
        recepcion: {
          fecha: recepcion?.fechaRecepcion,
          proveedor: recepcion?.proveedor?.nombre,
          ordenCompra: recepcion?.ordenCompra?.numero,
          tipo: loteInfo?.tipo,
          cantidadRecibida: recibido,
          costoUnitario: loteInfo?.costoUnitario,
          humedad: loteInfo?.humedad
        },
        inventario: {
          documentos: inventario.length,
          disponible,
          consumido
        },
        produccion: {
          ordenesRelacionadas: consumos.length,
          consumos: consumos.map(op => ({
            codigo: op.codigo,
            producto: op.producto,
            estado: op.estado,
            fechaCreacion: op.fechaCreacion,
            consumoTotal: op.consumos
              .filter(c => c.tipo === loteInfo?.tipo)
              .reduce((sum, c) => sum + c.cantidad, 0)
          }))
        }
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  // Trazabilidad de una OP específica
  porOP: async (req, res) => {
    try {
      const { codigo } = req.params;
      const op = await OrdenProduccion.findOne({ codigo });
      
      if (!op) return res.status(404).json({ error: 'OP no encontrada' });
      
      // Buscar lotes consumidos (aproximación por tipo y fecha)
      const lotesConsumidos = [];
      for (const consumo of op.consumos) {
        const granos = await Grano.find({
          tipo: consumo.tipo,
          fechaRegistro: { $lte: consumo.fecha || op.fechaCreacion },
          lote: { $ne: null }
        }).sort({ fechaRegistro: 1 }).limit(5);
        
        lotesConsumidos.push({
          tipo: consumo.tipo,
          cantidad: consumo.cantidad,
          fecha: consumo.fecha,
          lotesProbables: granos.map(g => ({
            lote: g.lote,
            proveedor: g.proveedor,
            fechaRegistro: g.fechaRegistro
          }))
        });
      }
      
      res.json({
        ordenProduccion: {
          codigo: op.codigo,
          producto: op.producto,
          estado: op.estado,
          fechaCreacion: op.fechaCreacion,
          fechaCierre: op.fechaCierre
        },
        receta: op.receta,
        consumos: lotesConsumidos,
        etapas: op.etapas,
        merma: op.merma
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
};