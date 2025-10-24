// Controller de Dashboard/Reportes con integración de patrones
const Factura = require('../models/Factura');
const PedidoVenta = require('../models/PedidoVenta');
const StockProducto = require('../models/StockProducto');
const OrdenProduccion = require('../models/OrdenProduccion');
const Grano = require('../models/Grano');
const SistemaCafeFacade = require('../domain/SistemaCafeFacade');

module.exports = {
  kpis: async (_req, res) => {
    try {
      // Facade para lógica de KPIs
      const facade = new SistemaCafeFacade();
      const kpis = await facade.obtenerKPIs();
      res.json(kpis);
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  ventasDiarias: async (req, res) => {
    try {
      const facade = new SistemaCafeFacade();
      const ventas = await facade.obtenerVentasDiarias(req.query.days);
      res.json(ventas);
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  mermaProduccion: async (req, res) => {
    try {
      const facade = new SistemaCafeFacade();
      const merma = await facade.obtenerMermaProduccion(req.query.days);
      res.json(merma);
    } catch (e) { res.status(500).json({ error: e.message }); }
  }
};
