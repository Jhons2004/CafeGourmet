const Auditoria = require('../models/Auditoria');

function audit(resource, action) {
  return async (req, res, next) => {
    const start = Date.now();
    const usuario = req.user?.email || req.user?.id || 'anon';
    const payload = { params: req.params, body: req.body };
    const event = { usuario, recurso: resource, accion: action, payload, resultado: 'ok', mensaje: null };

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);
    const finalize = async (resultado, mensaje) => {
      try {
        await Auditoria.create({ ...event, resultado, mensaje, duracionMs: Date.now() - start });
      } catch { /* noop */ }
    };

    res.json = (data) => { finalize('ok', null); return originalJson(data); };
    res.send = (data) => { finalize('ok', null); return originalSend(data); };

    res.on('finish', () => {
      if (res.statusCode >= 400) finalize('error', `HTTP ${res.statusCode}`);
    });
    next();
  };
}

module.exports = { audit };
