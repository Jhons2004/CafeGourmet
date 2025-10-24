const express = require('express');
const router = express.Router();
const { ComboFactory, ComboPremiumFactory } = require('../domain/combos/ComboFactory');
// Endpoint para crear un combo básico
router.post('/crear', (req, res) => {
  const { tipoCafe, cantidad, personalizada, tipoFiltro } = req.body;
  const factory = new ComboFactory();
  const combo = factory.crearCombo(tipoCafe, cantidad, personalizada, tipoFiltro);
  res.json(combo);
});

// Endpoint para crear un combo premium
router.post('/crear-premium', (req, res) => {
  const { tipoCafe, cantidad } = req.body;
  const factory = new ComboPremiumFactory();
  const combo = factory.crearCombo(tipoCafe, cantidad, true, 'metal');
  res.json(combo);
});

module.exports = router;