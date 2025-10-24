const Joi = require('joi');

const idParam = Joi.object({ id: Joi.string().hex().length(24).required() });

module.exports = {
  cliente: {
    crear: Joi.object({ nombre: Joi.string().min(2).required(), ruc: Joi.string().allow(null, ''), email: Joi.string().email().allow(null, ''), telefono: Joi.string().allow(null, ''), direccion: Joi.string().allow(null, ''), estado: Joi.string().valid('activo','inactivo').default('activo') }),
    actualizar: Joi.object({ nombre: Joi.string().min(2), ruc: Joi.string().allow(null, ''), email: Joi.string().email().allow(null, ''), telefono: Joi.string().allow(null, ''), direccion: Joi.string().allow(null, ''), estado: Joi.string().valid('activo','inactivo') }),
    paramsId: idParam
  },
  producto: {
    crear: Joi.object({ sku: Joi.string().required(), nombre: Joi.string().required(), unidad: Joi.string().valid('kg','g','un').default('kg'), activo: Joi.boolean().default(true) }),
    actualizar: Joi.object({ sku: Joi.string(), nombre: Joi.string(), unidad: Joi.string().valid('kg','g','un'), activo: Joi.boolean() }),
    paramsId: idParam
  },
  pedido: {
    crear: Joi.object({ cliente: Joi.string().hex().length(24).required(), items: Joi.array().items(Joi.object({ producto: Joi.string().hex().length(24).required(), cantidad: Joi.number().positive().required(), precio: Joi.number().min(0).required() })).min(1).required() }),
    paramsId: idParam
  },
  factura: {
    emitir: Joi.object({ pedidoId: Joi.string().hex().length(24).required() }),
    paramsId: idParam
  }
};
