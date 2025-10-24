const Joi = require('joi');

exports.registrarGrano = Joi.object({
  tipo: Joi.string().valid('arabica','robusta','blend').required(),
  cantidad: Joi.number().min(0).required(),
  proveedor: Joi.string().min(2).max(120).required()
});

exports.actualizarStock = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  cantidad: Joi.number().min(0).required()
});
