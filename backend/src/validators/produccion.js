const Joi = require('joi');

const tipos = ['arabica', 'robusta', 'blend'];
const etapas = ['Tostado', 'Molido', 'Empaque'];
const estados = ['pendiente', 'en_proceso', 'completada', 'cancelada'];

exports.crear = Joi.object({
  producto: Joi.string().min(2).max(120).required(),
  receta: Joi.array().items(Joi.object({
    tipo: Joi.string().valid(...tipos).required(),
    cantidad: Joi.number().positive().required()
  })).default([])
});

exports.etapaBody = Joi.object({
  etapa: Joi.string().valid(...etapas).required()
});

exports.consumoBody = Joi.object({
  items: Joi.array().min(1).items(Joi.object({
    tipo: Joi.string().valid(...tipos).required(),
    cantidad: Joi.number().positive().required()
  })).required()
});

exports.cerrarBody = Joi.object({
  merma: Joi.number().min(0).default(0)
});

exports.paramsId = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

exports.listarQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
  estado: Joi.string().valid(...estados).optional(),
  producto: Joi.string().min(1).max(120).optional()
});
