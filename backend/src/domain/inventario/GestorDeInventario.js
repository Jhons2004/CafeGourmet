// GestorDeInventario Singleton para control central de inventario
class GestorDeInventario {
  constructor() {
    if (GestorDeInventario._instance) {
      return GestorDeInventario._instance;
    }
    this.granos = [];
    this.productosTerminados = [];
    GestorDeInventario._instance = this;
  }

  agregarGrano(grano) {
    this.granos.push(grano);
  }

  actualizarGrano(id, cantidad) {
    const g = this.granos.find(x => x.id === id);
    if (g) g.cantidad = cantidad;
  }

  agregarProductoTerminado(prod) {
    this.productosTerminados.push(prod);
  }

  actualizarProductoTerminado(id, cantidad) {
    const p = this.productosTerminados.find(x => x.id === id);
    if (p) p.cantidad = cantidad;
  }

  getInventarioGranos() {
    return this.granos;
  }

  getInventarioProductosTerminados() {
    return this.productosTerminados;
  }

  static getInstance() {
    if (!GestorDeInventario._instance) {
      GestorDeInventario._instance = new GestorDeInventario();
    }
    return GestorDeInventario._instance;
  }
}

module.exports = GestorDeInventario;
