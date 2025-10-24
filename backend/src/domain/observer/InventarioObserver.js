// backend/src/domain/observer/InventarioObserver.js
// Patrón Observer para alertas de inventario bajo

class Observer {
  update(data) { throw new Error('Método update no implementado'); }
}

class InventarioSubject {
  constructor() {
    this.observers = [];
    this.stock = {};
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  removeObserver(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }
  setStock(tipo, cantidad) {
    this.stock[tipo] = cantidad;
    if (cantidad <= 5) {
      this.notify({ tipo, cantidad });
    }
  }
  notify(data) {
    this.observers.forEach(o => o.update(data));
  }
}

class StockBajoAlert extends Observer {
  update(data) {
    // Aquí podrías enviar email, log, o actualizar UI
    console.log(`Alerta: Stock bajo para ${data.tipo} (${data.cantidad})`);
  }
}

module.exports = { InventarioSubject, StockBajoAlert, Observer };