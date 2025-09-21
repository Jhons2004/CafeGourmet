const Joi = require('joi');

const id = Joi.string().length(24).hex();

module.exports = {
	paramsId: Joi.object({ id: id.required() }),
	cxp: {
		crear: Joi.object({
			proveedorId: id.required(),
			ordenCompraId: id.optional(),
			fechaVencimiento: Joi.date().required(),
			moneda: Joi.string().valid('GTQ','USD').default('GTQ'),
			monto: Joi.number().positive().required()
		}),
		pago: Joi.object({ monto: Joi.number().positive().required() }),
		factura: Joi.object({
			numero: Joi.string().allow('', null),
			fecha: Joi.date().optional(),
			adjuntoUrl: Joi.string().uri().allow('', null),
			observaciones: Joi.string().allow('', null),
			tcUsado: Joi.number().positive().allow(null)
		})
	},
	cxc: {
		crear: Joi.object({
			clienteId: id.required(),
			facturaId: id.optional(),
			fechaVencimiento: Joi.date().required(),
			moneda: Joi.string().valid('GTQ','USD').default('GTQ'),
			monto: Joi.number().positive().required()
		}),
		cobro: Joi.object({ monto: Joi.number().positive().required() })
	}
};

