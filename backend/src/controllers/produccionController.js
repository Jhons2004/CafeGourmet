const produccion = require('../services/ProduccionService');

module.exports = {
  crear: async (req, res) => {
    try {
      const { producto, receta } = req.body;
      const op = await produccion.crearOP({ producto, receta });
      res.json(op);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  listar: async (_req, res) => {
    try { res.json(await produccion.listarOP()); } catch (e) { res.status(500).json({ error: e.message }); }
  },
  etapa: async (req, res) => {
    try {
      const { id } = req.params; const { etapa } = req.body;
      res.json(await produccion.avanzarEtapa(id, etapa));
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  consumo: async (req, res) => {
    try {
      const { id } = req.params; const { items } = req.body; // [{tipo, cantidad}]
      res.json(await produccion.registrarConsumo(id, items));
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  cerrar: async (req, res) => {
    try {
      const { id } = req.params; const { merma = 0 } = req.body;
      res.json(await produccion.cerrarOP(id, merma));
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
};
