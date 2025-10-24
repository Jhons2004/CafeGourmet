// Abstract Factory para combos de café gourmet
class Cafe {
  constructor(tipo, cantidad) {
    this.tipo = tipo;
    this.cantidad = cantidad;
  }
}
class Taza {
  constructor(personalizada = false) {
    this.personalizada = personalizada;
  }
}
class Filtro {
  constructor(tipo = 'papel') {
    this.tipo = tipo;
  }
}
class Combo {
  constructor(cafe, taza, filtro) {
    this.cafe = cafe;
    this.taza = taza;
    this.filtro = filtro;
  }
}
class ComboFactory {
  crearCafe(tipo, cantidad) {
    return new Cafe(tipo, cantidad);
  }
  crearTaza(personalizada) {
    return new Taza(personalizada);
  }
  crearFiltro(tipo) {
    return new Filtro(tipo);
  }
  crearCombo(tipoCafe, cantidad, personalizada, tipoFiltro) {
    return new Combo(
      this.crearCafe(tipoCafe, cantidad),
      this.crearTaza(personalizada),
      this.crearFiltro(tipoFiltro)
    );
  }
}
// Ejemplo de fábrica extendida para combos premium
class ComboPremiumFactory extends ComboFactory {
  crearTaza() {
    return new Taza(true); // Siempre personalizada
  }
  crearFiltro() {
    return new Filtro('metal'); // Filtro premium
  }
}
module.exports = { ComboFactory, ComboPremiumFactory, Combo, Cafe, Taza, Filtro };