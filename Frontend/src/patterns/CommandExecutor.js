// Command para ejecutar acciones
export class CommandExecutor {
  execute(fn) {
    if (typeof fn === 'function') {
      fn();
    }
  }
}
