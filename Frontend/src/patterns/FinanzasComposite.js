// Composite para manejar lista de finanzas
export class FinanzasComposite {
  constructor() {
    this.items = [];
  }
  setItems(items) {
    this.items = items;
  }
  getTotal() {
    return this.items.reduce((acc, item) => acc + (item.monto || 0), 0);
  }
}
