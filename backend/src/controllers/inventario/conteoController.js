const ConteoCiclico = require('../../models/ConteoCiclico');
const { registrarMovimiento } = require('../../services/inventoryCostingService');
const Stock = require('../../models/Stock');
const mongoose = require('mongoose');

module.exports = {
  crear: async (req,res) => {
    try {
      const conteo = new ConteoCiclico({ lineas: req.body.lineas || [], notas: req.body.notas || '', usuario: req.user?.email || '' });
      await conteo.save();
      res.json(conteo);
    } catch(err){ res.status(400).json({ error: err.message }); }
  },
  cerrar: async (req,res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const conteo = await ConteoCiclico.findById(req.params.id).session(session);
      if(!conteo) throw new Error('Conteo no encontrado');
      if(conteo.estado === 'CERRADO') throw new Error('Ya cerrado');
      for (const linea of conteo.lineas) {
        const stockDocs = await Stock.find({ productoRef: linea.productoRef, tipoProducto: linea.tipoProducto, bodega: linea.bodega, ubicacion: linea.ubicacion, lote: linea.lote }).session(session);
        const qtyActual = stockDocs.reduce((acc,s)=> acc + s.cantidad,0);
        linea.diferencia = linea.cantidadFisica - qtyActual;
        if (linea.diferencia !== 0) {
          const tipoMov = linea.diferencia > 0 ? 'AJUSTE_POS' : 'AJUSTE_NEG';
          const cantidadAbs = Math.abs(linea.diferencia);
            await registrarMovimiento({ tipo: tipoMov, productoRef: linea.productoRef, tipoProducto: linea.tipoProducto, lote: linea.lote, bodegaOrigen: linea.bodega, ubicacionOrigen: linea.ubicacion, cantidad: cantidadAbs, metodoCosteo: 'PROMEDIO', notas: 'Ajuste conteo '+conteo.codigo });
          linea.ajusteGenerado = true;
        }
      }
      conteo.estado = 'CERRADO';
      await conteo.save({ session });
      await session.commitTransaction();
      res.json(conteo);
    } catch(err){
      await session.abortTransaction();
      res.status(400).json({ error: err.message });
    } finally { session.endSession(); }
  },
  listar: async (_req,res) => {
    const list = await ConteoCiclico.find().sort({ createdAt: -1 }).limit(100);
    res.json(list);
  }
};
