// backend/src/domain/productos/ProductoFactory.js
// Patrón Factory Method para productos de café

class Producto {
  constructor({ tipo, nombre, cantidad, unidad, precio }) {
    this.tipo = tipo;
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.unidad = unidad || 'kg';
    this.precio = precio || 0;
  }
}

class ProductoGrano extends Producto {
  constructor(datos) {
    super({ ...datos, tipo: 'grano' });
  }
}

class ProductoMolido extends Producto {
  constructor(datos) {
    super({ ...datos, tipo: 'molido' });
  }
}

class ProductoCapsula extends Producto {
  constructor(datos) {
    super({ ...datos, tipo: 'capsula', unidad: 'cápsulas' });
  }
}

class ProductoFactory {
  static crearProducto(tipo, datos) {
    switch (tipo) {
      case 'grano':
        return new ProductoGrano(datos);
      case 'molido':
        return new ProductoMolido(datos);
      case 'capsula':
        return new ProductoCapsula(datos);
      default:
        throw new Error('Tipo de producto no soportado: ' + tipo);
    }
  }
}

module.exports = { ProductoFactory, ProductoGrano, ProductoMolido, ProductoCapsula, Producto };