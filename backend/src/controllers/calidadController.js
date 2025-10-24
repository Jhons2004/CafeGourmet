// Controller de Calidad con integración de patrones
const RecepcionLote = require('../models/RecepcionLote');
const Auditoria = require('../models/Auditoria');
const InventarioObserver = require('../domain/InventarioObserver');
const PrecioStrategy = require('../domain/PrecioStrategy');
const SistemaCafeFacade = require('../domain/SistemaCafeFacade');

module.exports = {
  recepcionar: async (req, res) => {
    try {
      // Facade para lógica de negocio
      const facade = new SistemaCafeFacade();
      const recepcion = await facade.recepcionarLote(req.body);
      // Observer para notificar cambios
      InventarioObserver.notify('recepcionLote', recepcion);
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'recepcionar', recurso: 'calidad', payload: req.body, resultado: 'ok' });
      res.json(recepcion);
    } catch (e) {
      await Auditoria.create({ usuario: req.user?.email || 'system', accion: 'recepcionar', recurso: 'calidad', payload: req.body, resultado: 'error', mensaje: e.message });
      res.status(400).json({ error: e.message });
    }
  },
  evaluar: async (req, res) => {
    try {
      // Strategy para evaluación de calidad
      const strategy = new PrecioStrategy(req.body.tipo);
      const resultado = strategy.evaluarCalidad(req.body);
      res.json({ resultado });
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};
