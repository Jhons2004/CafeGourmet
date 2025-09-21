const Joi = require('joi');

const idParam = Joi.object({ id: Joi.string().hex().length(24).required() });

module.exports = {
  recepcion: {
    crear: Joi.object({
      recepcion: Joi.string().hex().length(24).required(),
      lote: Joi.string().required(),
      mediciones: Joi.object({ humedad: Joi.number().min(0).max(100).optional(), acidez: Joi.number().min(0).optional(), defectos: Joi.number().min(0).optional() }).optional(),
      resultado: Joi.string().valid('aprobado','rechazado').required(),
      notas: Joi.string().allow('', null)
    })
  },
  proceso: {
    crear: Joi.object({
      op: Joi.string().hex().length(24).required(),
      etapa: Joi.string().required(),
      checklist: Joi.array().items(Joi.object({ nombre: Joi.string().required(), ok: Joi.boolean().required() })).default([]),
      resultado: Joi.string().valid('aprobado','rechazado').required(),
      notas: Joi.string().allow('', null)
    })
  },
  nc: {
    crear: Joi.object({
      recurso: Joi.string().valid('lote','op').required(),
      referencia: Joi.string().required(),
      motivo: Joi.string().required(),
      acciones: Joi.string().allow('', null)
    }),
    paramsId: idParam
  }
};
