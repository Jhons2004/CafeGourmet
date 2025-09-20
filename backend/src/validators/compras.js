const Joi = require('joi');

const tipos = ['arabica','robusta','blend'];

exports.proveedor = {
  crear: Joi.object({
    nombre: Joi.string().min(2).max(120).required(),
    ruc: Joi.string().allow(null, ''),
    contacto: Joi.string().allow(null, ''),
    telefono: Joi.string().allow(null, ''),
    direccion: Joi.string().allow(null, ''),
    email: Joi.string().email().allow(null, '')
  }),
  actualizar: Joi.object({
    nombre: Joi.string().min(2).max(120),
    ruc: Joi.string().allow(null, ''),
    contacto: Joi.string().allow(null, ''),
    telefono: Joi.string().allow(null, ''),
    direccion: Joi.string().allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    activo: Joi.boolean()
  }),
  paramsId: Joi.object({ id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required() })
};

exports.ordenCompra = {
  crear: Joi.object({
    proveedor: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    items: Joi.array().min(1).items(Joi.object({
      tipo: Joi.string().valid(...tipos).required(),
      cantidad: Joi.number().positive().required(),
      precioUnitario: Joi.number().positive().required()
    })).required()
  }),
  aprobar: Joi.object({ aprobar: Joi.boolean().valid(true).required() }),
  paramsId: Joi.object({ id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required() })
};

exports.recepcion = {
  crear: Joi.object({
    ordenCompra: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    lotes: Joi.array().min(1).items(Joi.object({
      tipo: Joi.string().valid(...tipos).required(),
      cantidad: Joi.number().positive().required(),
      costoUnitario: Joi.number().positive().required(),
      lote: Joi.string().min(1).required(),
      fechaCosecha: Joi.date().optional(),
      humedad: Joi.number().min(0).max(100).optional()
    })).required(),
    observaciones: Joi.string().allow('', null)
  })
};
