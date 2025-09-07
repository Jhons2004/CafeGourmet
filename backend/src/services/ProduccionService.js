const OrdenProduccion = require('../models/OrdenProduccion');
const Grano = require('../models/Grano');
const { ProduccionSubject, CalidadObserver, ComprasObserver } = require('../observers/ProduccionObserver');
const { AvanzarEtapaCommand, RegistrarConsumoCommand, CerrarOPCommand } = require('../commands/ProduccionCommands');

class ProduccionService {
  constructor() {
    this.subject = new ProduccionSubject();
    this.subject.subscribe(new CalidadObserver());
    this.subject.subscribe(new ComprasObserver());
  }

  async crearOP({ producto, receta }) {
    const op = new OrdenProduccion({ producto, receta });
    await op.save();
    return op;
  }

  async listarOP() {
    return OrdenProduccion.find().sort({ fechaCreacion: -1 });
  }

  async avanzarEtapa(id, etapaNombre) {
    const op = await OrdenProduccion.findById(id);
    if (!op) throw new Error('OP no encontrada');
    const cmd = new AvanzarEtapaCommand(op, etapaNombre);
    const result = await cmd.execute();
    // Auto-consumo: aplicar receta en Tostado o Molido (solo una vez por etapa)
    const etapaRef = op.etapas.find(e => e.nombre === etapaNombre);
    if ((etapaNombre === 'Tostado' || etapaNombre === 'Molido') && etapaRef && !etapaRef.consumoAplicado) {
      const items = (op.receta || []).map(i => ({ tipo: i.tipo, cantidad: i.cantidad }));
      if (items.length) {
        await this._consumirInventario(items);
        op.consumos.push(...items);
        etapaRef.consumoAplicado = true;
        await op.save();
      }
    }
    this.subject.notify('ETAPA_COMPLETADA', { codigo: op.codigo, etapa: etapaNombre });
    return result;
  }

  async registrarConsumo(id, items) {
    const op = await OrdenProduccion.findById(id);
    if (!op) throw new Error('OP no encontrada');

    const reduceInventario = async (consumos) => this._consumirInventario(consumos);

    const cmd = new RegistrarConsumoCommand(op, items, reduceInventario);
    return cmd.execute();
  }

  async _consumirInventario(consumos) {
    const bajos = [];
    for (const c of consumos) {
      const g = await Grano.findOne({ tipo: c.tipo }).sort({ fechaRegistro: 1 });
      if (!g) continue;
      g.cantidad = Math.max(0, (g.cantidad || 0) - c.cantidad);
      await g.save();
      if (g.cantidad <= 10) bajos.push({ tipo: g.tipo, cantidad: g.cantidad });
    }
    if (bajos.length) this.subject.notify('CONSUMO_REGISTRADO', { items: bajos, stockBajo: true });
  }

  async cerrarOP(id, merma = 0) {
    const op = await OrdenProduccion.findById(id);
    if (!op) throw new Error('OP no encontrada');
    const cmd = new CerrarOPCommand(op, merma);
    return cmd.execute();
  }
}

module.exports = new ProduccionService();
