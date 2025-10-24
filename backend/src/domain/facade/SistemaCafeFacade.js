// backend/src/domain/facade/SistemaCafeFacade.js
// Patrón Facade para simplificar operaciones del sistema de café

const { ProductoFactory } = require('../productos/ProductoFactory');
const { GestorDeInventario } = require('../inventario/GestorDeInventario');
const { ProveedorAdapter } = require('../proveedores/ProveedorAdapter');

class SistemaCafeFacade {
  constructor() {
    this.inventario = GestorDeInventario.getInstance();
  }

  crearProducto(tipo, datos) {
    // Usa el Factory Method
    const producto = ProductoFactory.crearProducto(tipo, datos);
    this.inventario.agregarProducto(producto);
    return producto;
  }

  registrarProveedorExterno(proveedorExterno) {
    // Usa el Adapter
    const adapter = new ProveedorAdapter(proveedorExterno);
    const proveedorInterno = adapter.toProveedorInterno();
    // Aquí podrías guardar el proveedor en la base de datos o en memoria
    // this.inventario.agregarProveedor(proveedorInterno); // Si existe método
    return proveedorInterno;
  }

  obtenerInventario() {
    return this.inventario.obtenerInventario();
  }
}

module.exports = { SistemaCafeFacade };