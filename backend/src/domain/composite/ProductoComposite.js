// backend/src/domain/composite/ProductoComposite.js
// Patrón Composite para productos compuestos (ej. combos)

class ProductoComponent {
  getNombre() { throw new Error('Método no implementado'); }
  getCantidad() { throw new Error('Método no implementado'); }
  getPrecio() { throw new Error('Método no implementado'); }
}

class ProductoSimple extends ProductoComponent {
  constructor({ nombre, cantidad, precio }) {
    super();
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.precio = precio;
  }
  getNombre() { return this.nombre; }
  getCantidad() { return this.cantidad; }
  getPrecio() { return this.precio; }
}

class ProductoCombo extends ProductoComponent {
  constructor(nombre) {
    super();
    this.nombre = nombre;
    this.productos = [];
  }
  agregar(producto) {
    this.productos.push(producto);
  }
  getNombre() { return this.nombre; }
  getCantidad() { return this.productos.reduce((sum, p) => sum + p.getCantidad(), 0); }
  getPrecio() { return this.productos.reduce((sum, p) => sum + p.getPrecio(), 0); }
  getDetalle() {
    return this.productos.map(p => ({ nombre: p.getNombre(), cantidad: p.getCantidad(), precio: p.getPrecio() }));
  }
}

module.exports = { ProductoComponent, ProductoSimple, ProductoCombo };