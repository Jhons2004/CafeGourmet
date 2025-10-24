// backend/src/domain/strategy/PrecioStrategy.js
// Patrón Strategy para cálculo de precio de productos

class PrecioStrategy {
  calcular(producto) {
    throw new Error('Método calcular no implementado');
  }
}

class PrecioPorKilo extends PrecioStrategy {
  calcular(producto) {
    // Ejemplo: precio base por kilo
    return producto.cantidad * 25;
  }
}

class PrecioPremium extends PrecioStrategy {
  calcular(producto) {
    // Ejemplo: precio premium con recargo
    return producto.cantidad * 40;
  }
}

class PrecioPersonalizado extends PrecioStrategy {
  calcular(producto) {
    // Ejemplo: precio personalizado según atributos
    let base = producto.cantidad * 30;
    if (producto.personalizada) base += 10;
    if (producto.tipoFiltro === 'metal') base += 5;
    return base;
  }
}

class CalculadoraPrecio {
  constructor(strategy) {
    this.strategy = strategy;
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  calcular(producto) {
    return this.strategy.calcular(producto);
  }
}

module.exports = { PrecioStrategy, PrecioPorKilo, PrecioPremium, PrecioPersonalizado, CalculadoraPrecio };