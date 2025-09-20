const produccion = require('../services/ProduccionService');

module.exports = {
  crear: async (req, res) => {
    try {
      const { producto, receta } = req.body;
      const op = await produccion.crearOP({ producto, receta });
      res.json(op);
    } catch (e) { res.status(400).json({ error: e.message }); }
  },
  listar: async (req, res) => {
    try {
      const { page = 1, pageSize = 10, estado, producto } = req.query;
      const { data, total } = await produccion.listarOP({ page: Number(page), pageSize: Number(pageSize), estado, producto });
      res.json({ data, total, page: Number(page), pageSize: Number(pageSize) });
    } catch (e) { res.status(500).json({ error: e.message }); }
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
