// backend/src/domain/proveedores/ProveedorAdapter.js
// Patrón Adapter para integrar proveedores externos

// Ejemplo de proveedor externo con formato diferente
class ProveedorExterno {
  constructor({ nombre, contacto, telefono, direccion, productos }) {
    this.nombre = nombre;
    this.contacto = contacto;
    this.telefono = telefono;
    this.direccion = direccion;
    this.productos = productos; // [{ nombre, tipo, cantidad }]
  }
  obtenerDatos() {
    return {
      nombre: this.nombre,
      contacto: this.contacto,
      telefono: this.telefono,
      direccion: this.direccion,
      productos: this.productos
    };
  }
}

// Adapter para convertir proveedor externo al formato interno
class ProveedorAdapter {
  constructor(proveedorExterno) {
    this.proveedorExterno = proveedorExterno;
  }
  toProveedorInterno() {
    const datos = this.proveedorExterno.obtenerDatos();
    return {
      nombre: datos.nombre,
      contacto: datos.contacto,
      telefono: datos.telefono,
      direccion: datos.direccion,
      productos: (datos.productos || []).map(p => ({
        tipo: p.tipo,
        nombre: p.nombre,
        cantidad: p.cantidad
      }))
    };
  }
}

module.exports = { ProveedorExterno, ProveedorAdapter };