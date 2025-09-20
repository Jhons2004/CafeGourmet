const Joi = require('joi');

const roles = ['admin','it','rrhh','operador'];

exports.registrar = Joi.object({
  nombre: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().max(120).required(),
  password: Joi.string().min(8).max(128).required(),
  rol: Joi.string().valid(...roles).default('operador')
});

exports.login = Joi.object({
  email: Joi.string().email().max(120).required(),
  password: Joi.string().min(8).max(128).required()
});

exports.actualizarRol = Joi.object({
  rol: Joi.string().valid(...roles).required()
});

exports.forgotPassword = Joi.object({
  email: Joi.string().email().max(120).required()
});

exports.resetPassword = Joi.object({
  nuevaPassword: Joi.string().min(8).max(128).required()
});

exports.resetPasswordSimple = Joi.object({
  email: Joi.string().email().max(120).required(),
  nuevaPassword: Joi.string().min(8).max(128).required()
});

exports.paramsId = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});