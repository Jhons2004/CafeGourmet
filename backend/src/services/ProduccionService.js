const mongoose = require('mongoose');
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

  async listarOP({ page = 1, pageSize = 10, estado, producto } = {}) {
    const query = {};
    if (estado) query.estado = estado;
    if (producto) query.producto = new RegExp(producto, 'i');
    const total = await OrdenProduccion.countDocuments(query);
    const data = await OrdenProduccion.find(query)
      .sort({ fechaCreacion: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    return { data, total };
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
        // Transacción atómica para validar y consumir
        await this._consumoTransaccional(items, async () => {
          op.consumos.push(...items);
          etapaRef.consumoAplicado = true;
          await op.save();
        });
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
      return this._consumoTransaccional(consumos, async () => {
        // side effects on OP are handled by command
      });
    };

    const cmd = new RegistrarConsumoCommand(op, items, reduceInventario);
    return cmd.execute();
  }

  async _consumoTransaccional(consumos, afterConsumeCallback) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await this._validarStock(consumos, session);
      await this._consumirInventario(consumos, session);
      if (afterConsumeCallback) await afterConsumeCallback();
      await session.commitTransaction();
      return true;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  async _consumirInventario(consumos, session) {
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
  const docs = await Grano.find({ tipo }).sort({ fechaRegistro: 1 }).session(session || null);
      for (const d of docs) {
        if (restante <= 0) break;
        const disponible = Number(d.cantidad || 0);
        if (disponible <= 0) continue;
        const tomar = Math.min(disponible, restante);
        d.cantidad = disponible - tomar;
        restante -= tomar;
        await d.save({ session });
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
    ]).session(session || null);
    const bajos = totales
      .filter(t => (t.total || 0) <= 10)
      .map(t => ({ tipo: t._id, cantidad: t.total }));
    if (bajos.length) this.subject.notify('CONSUMO_REGISTRADO', { items: bajos, stockBajo: true });
  }

  async _validarStock(consumos, session) {
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
    ]).session(session || null);
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
