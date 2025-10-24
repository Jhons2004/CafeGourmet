// Command Pattern for Cafe Gourmet System
// Allows encapsulation of operations as objects, supporting undo/redo and flexible execution

class Command {
  execute() { throw new Error('execute() must be implemented'); }
  undo() { throw new Error('undo() must be implemented'); }
}

// Example: Register Grain Command
class RegistrarGranoCommand extends Command {
  constructor(grano, gestorInventario) {
    super();
    this.grano = grano;
    this.gestorInventario = gestorInventario;
    this.prevState = null;
  }
  async execute() {
    this.prevState = await this.gestorInventario.getGranos();
    await this.gestorInventario.registrarGrano(this.grano);
  }
  async undo() {
    await this.gestorInventario.setGranos(this.prevState);
  }
}

// Example: Update Stock Command
class ActualizarStockCommand extends Command {
  constructor(granoId, cantidad, gestorInventario) {
    super();
    this.granoId = granoId;
    this.cantidad = cantidad;
    this.gestorInventario = gestorInventario;
    this.prevCantidad = null;
  }
  async execute() {
    this.prevCantidad = await this.gestorInventario.getCantidad(this.granoId);
    await this.gestorInventario.actualizarCantidad(this.granoId, this.cantidad);
  }
  async undo() {
    await this.gestorInventario.actualizarCantidad(this.granoId, this.prevCantidad);
  }
}

// Invoker to manage commands
class CommandManager {
  constructor() {
    this.history = [];
    this.redoStack = [];
  }
  async executeCommand(cmd) {
    await cmd.execute();
    this.history.push(cmd);
    this.redoStack = [];
  }
  async undo() {
    const cmd = this.history.pop();
    if (cmd) {
      await cmd.undo();
      this.redoStack.push(cmd);
    }
  }
  async redo() {
    const cmd = this.redoStack.pop();
    if (cmd) {
      await cmd.execute();
      this.history.push(cmd);
    }
  }
}

module.exports = {
  Command,
  RegistrarGranoCommand,
  ActualizarStockCommand,
  CommandManager
};
