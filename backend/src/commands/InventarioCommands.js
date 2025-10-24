// Command para operaciones de inventario con deshacer
class Command {
    execute() {}
    undo() {}
}

class AgregarGranoCommand extends Command {
    constructor(gestor, grano) {
        super();
        this.gestor = gestor;
        this.grano = grano;
    }
    execute() {
        this.gestor.agregarGrano(this.grano);
    }
    undo() {
        this.gestor.inventario = this.gestor.inventario.filter(g => g.id !== this.grano.id);
    }
}

class ActualizarStockCommand extends Command {
    constructor(gestor, id, nuevaCantidad) {
        super();
        this.gestor = gestor;
        this.id = id;
        this.nuevaCantidad = nuevaCantidad;
        this.anterior = null;
    }
    execute() {
        const grano = this.gestor.inventario.find(g => g.id === this.id);
        if (grano) {
            this.anterior = grano.cantidad;
            grano.cantidad = this.nuevaCantidad;
        }
    }
    undo() {
        const grano = this.gestor.inventario.find(g => g.id === this.id);
        if (grano && this.anterior !== null) {
            grano.cantidad = this.anterior;
        }
    }
}

module.exports = { AgregarGranoCommand, ActualizarStockCommand };
