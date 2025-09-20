module.exports = function validate(schema, property = 'body') {
  return (req, res, next) => {
    const data = req[property];
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: 'Validación falló', detalles: error.details.map(d => ({ path: d.path.join('.'), message: d.message })) });
    }
    req[property] = value;
    next();
  };
};