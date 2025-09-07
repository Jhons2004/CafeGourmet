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
    // Auto-consumo: validar y aplicar receta antes de completar la etapa (solo una vez por etapa)
    const etapaRef = op.etapas.find(e => e.nombre === etapaNombre);
    if (!etapaRef) throw new Error('Etapa no válida');

    const requiereAutoConsumo = (etapaNombre === 'Tostado' || etapaNombre === 'Molido');
    if (requiereAutoConsumo && !etapaRef.consumoAplicado) {
      const items = (op.receta || []).map(i => ({ tipo: i.tipo, cantidad: i.cantidad }));
      if (items.length) {
        // Validar stock suficiente de forma previa
        await this._validarStock(items);
        // Consumir inventario (FIFO por fechaRegistro)
        await this._consumirInventario(items);
        op.consumos.push(...items);
        etapaRef.consumoAplicado = true;
        await op.save();
      }
    }

    const cmd = new AvanzarEtapaCommand(op, etapaNombre);
    const result = await cmd.execute();
    this.subject.notify('ETAPA_COMPLETADA', { codigo: op.codigo, etapa: etapaNombre });
    return result;
  }

  async registrarConsumo(id, items) {
    const op = await OrdenProduccion.findById(id);
    if (!op) throw new Error('OP no encontrada');

    const reduceInventario = async (consumos) => {
      await this._validarStock(consumos);
      return this._consumirInventario(consumos);
    };

    const cmd = new RegistrarConsumoCommand(op, items, reduceInventario);
    return cmd.execute();
  }

  async _consumirInventario(consumos) {
    // Consolidar por tipo
    const requeridos = consumos.reduce((acc, it) => {
      acc[it.tipo] = (acc[it.tipo] || 0) + Number(it.cantidad || 0);
      return acc;
    }, {});

    const tipos = Object.keys(requeridos);
    // Consumir FIFO por documento (fechaRegistro asc)
    for (const tipo of tipos) {
      let restante = requeridos[tipo];
      if (restante <= 0) continue;
      const docs = await Grano.find({ tipo }).sort({ fechaRegistro: 1 });
      for (const d of docs) {
        if (restante <= 0) break;
        const disponible = Number(d.cantidad || 0);
        if (disponible <= 0) continue;
        const tomar = Math.min(disponible, restante);
        d.cantidad = disponible - tomar;
        restante -= tomar;
        await d.save();
      }
      // Si queda restante, significa que no había stock suficiente (debería estar validado arriba)
      if (restante > 0) {
        throw new Error(`Stock insuficiente durante consumo: ${tipo} faltan ${restante}`);
      }
    }

    // Verificar stock bajo por tipo total restante (<=10)
    const totales = await Grano.aggregate([
      { $match: { tipo: { $in: tipos } } },
      { $group: { _id: '$tipo', total: { $sum: '$cantidad' } } }
    ]);
    const bajos = totales
      .filter(t => (t.total || 0) <= 10)
      .map(t => ({ tipo: t._id, cantidad: t.total }));
    if (bajos.length) this.subject.notify('CONSUMO_REGISTRADO', { items: bajos, stockBajo: true });
  }

  async _validarStock(consumos) {
    // Consolidar requeridos por tipo
    const requeridos = consumos.reduce((acc, it) => {
      const cant = Number(it.cantidad || 0);
      if (cant > 0) acc[it.tipo] = (acc[it.tipo] || 0) + cant;
      return acc;
    }, {});
    const tipos = Object.keys(requeridos);
    if (tipos.length === 0) return true;

    const totales = await Grano.aggregate([
      { $match: { tipo: { $in: tipos } } },
      { $group: { _id: '$tipo', total: { $sum: '$cantidad' } } }
    ]);
    const mapa = Object.fromEntries(totales.map(t => [t._id, Number(t.total || 0)]));
    const faltantes = [];
    for (const tipo of tipos) {
      const req = Number(requeridos[tipo] || 0);
      const disp = Number(mapa[tipo] || 0);
      if (disp < req) faltantes.push({ tipo, faltante: req - disp });
    }
    if (faltantes.length) {
      const msg = faltantes.map(f => `${f.tipo} faltan ${f.faltante}`).join(', ');
      throw new Error(`Stock insuficiente: ${msg}`);
    }
    return true;
  }

  async cerrarOP(id, merma = 0) {
    const op = await OrdenProduccion.findById(id);
    if (!op) throw new Error('OP no encontrada');
    const cmd = new CerrarOPCommand(op, merma);
    return cmd.execute();
  }
}

module.exports = new ProduccionService();
