// Controller de Combos con integración de patrones
const Combo = require('../models/Combo');
const ProductoFactory = require('../domain/ProductoFactory');
const ProductoComposite = require('../domain/ProductoComposite');
const SistemaCafeFacade = require('../domain/SistemaCafeFacade');

module.exports = {
  crear: async (req, res) => {
    try {
      // Factory para crear productos
      const cafe = ProductoFactory.crearProducto(req.body.tipoCafe, req.body.cantidad);
      const taza = ProductoFactory.crearProducto('taza', req.body.personalizada);
      const filtro = ProductoFactory.crearProducto('filtro', req.body.tipoFiltro);
      // Composite para agrupar productos
      const combo = new ProductoComposite([cafe, taza, filtro]);
      // Facade para lógica de negocio
      const facade = new SistemaCafeFacade();
      const resultado = await facade.crearCombo(combo);
      res.json(resultado);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  crearPremium: async (req, res) => {
    try {
      // Factory y Composite para combo premium
      const cafe = ProductoFactory.crearProducto(req.body.tipoCafe, req.body.cantidad, true);
      const taza = ProductoFactory.crearProducto('taza', true);
      const filtro = ProductoFactory.crearProducto('filtro', 'metal');
      const combo = new ProductoComposite([cafe, taza, filtro]);
      const facade = new SistemaCafeFacade();
      const resultado = await facade.crearComboPremium(combo);
      res.json(resultado);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};
