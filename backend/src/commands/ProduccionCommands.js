class Command {
  async execute() {}
  async undo() {}
}

class AvanzarEtapaCommand extends Command {
  constructor(op, etapaNombre) { super(); this.op = op; this.etapaNombre = etapaNombre; this.prev = null; }
  async execute() {
    const etapa = this.op.etapas.find(e => e.nombre === this.etapaNombre);
    if (!etapa) throw new Error('Etapa no encontrada');
    this.prev = etapa.estado;
    etapa.estado = 'completada';
    const todas = this.op.etapas.every(e => e.estado === 'completada');
    if (todas) { this.op.estado = 'completada'; this.op.fechaCierre = new Date(); }
    await this.op.save();
    return this.op;
  }
  async undo() {
    const etapa = this.op.etapas.find(e => e.nombre === this.etapaNombre);
    if (etapa && this.prev) { etapa.estado = this.prev; await this.op.save(); }
  }
}

class RegistrarConsumoCommand extends Command {
  constructor(op, items, reducerCb) { super(); this.op = op; this.items = items; this.reducerCb = reducerCb; }
  async execute() {
    this.op.consumos.push(...this.items.map(i => ({ tipo: i.tipo, cantidad: i.cantidad })));
    await this.op.save();
    if (this.reducerCb) await this.reducerCb(this.items);
    return this.op;
  }
}

class CerrarOPCommand extends Command {
  constructor(op, merma = 0) { super(); this.op = op; this.merma = merma; }
  async execute() {
    this.op.estado = 'completada';
    this.op.merma = this.merma;
    this.op.fechaCierre = new Date();
    await this.op.save();
    return this.op;
  }
}

module.exports = { AvanzarEtapaCommand, RegistrarConsumoCommand, CerrarOPCommand };
