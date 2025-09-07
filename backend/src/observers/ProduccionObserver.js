class ProduccionSubject {
  constructor() { this.observers = []; }
  subscribe(obs) { this.observers.push(obs); }
  unsubscribe(obs) { this.observers = this.observers.filter(o => o !== obs); }
  notify(evento, payload) {
    for (const o of this.observers) {
      try { o.update(evento, payload); } catch {}
    }
  }
}

class CalidadObserver {
  update(evento, payload) {
    if (evento === 'ETAPA_COMPLETADA') {
      console.log(`[Calidad] Etapa completada: ${payload.etapa} en ${payload.codigo}`);
    }
  }
}

class ComprasObserver {
  update(evento, payload) {
    if (evento === 'CONSUMO_REGISTRADO' && payload.stockBajo && payload.items?.length) {
      console.log('[Compras] Alerta stock bajo para:', payload.items.map(i => `${i.tipo}(${i.cantidad})`).join(', '));
    }
  }
}

module.exports = { ProduccionSubject, CalidadObserver, ComprasObserver };
