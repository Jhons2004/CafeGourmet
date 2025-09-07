// Singleton para el control central de inventario de granos
class GestorDeInventario {
    constructor() {
        if (GestorDeInventario.instance) {
            return GestorDeInventario.instance;
        }
        this.inventario = [];
        GestorDeInventario.instance = this;
    }

    agregarGrano(grano) {
        this.inventario.push(grano);
    }

    actualizarStock(id, cantidad) {
        const grano = this.inventario.find(g => g.id === id);
        if (grano) grano.cantidad = cantidad;
    }

    obtenerInventario() {
        return this.inventario;
    }

    buscarPorTipo(tipo) {
        return this.inventario.filter(g => g.tipo === tipo);
    }

    stockBajo(threshold = 10) {
        return this.inventario.filter(g => g.cantidad <= threshold);
    }
}

module.exports = new GestorDeInventario();
