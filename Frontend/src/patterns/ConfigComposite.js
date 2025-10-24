// Composite para manejar lista de usuarios/configuración
export class ConfigComposite {
  constructor() {
    this.items = [];
  }
  setItems(items) {
    this.items = items;
  }
  getCount() {
    return this.items.length;
  }
}
