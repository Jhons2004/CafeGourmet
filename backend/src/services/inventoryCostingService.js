const Stock = require('../models/Stock');
const MovimientoInventario = require('../models/MovimientoInventario');

async function obtenerStock({ productoRef, tipoProducto, lote, loteRef, bodega, ubicacion, metodoCosteo }) {
  let stock = await Stock.findOne({ productoRef, tipoProducto, lote, loteRef, bodega, ubicacion });
  if (!stock) {
    stock = new Stock({ productoRef, tipoProducto, lote, loteRef, bodega, ubicacion, cantidad: 0, costoPromedio: 0, metodoCosteo });
  }
  return stock;
}

function aplicarCosteoPromedio(stock, movimiento) {
  const { tipo, cantidad, costoUnitario } = movimiento;
  if (['ENTRADA','AJUSTE_POS'].includes(tipo)) {
    const totalAnterior = stock.cantidad * stock.costoPromedio;
    const totalNuevo = totalAnterior + (cantidad * costoUnitario);
    stock.cantidad += cantidad;
    stock.costoPromedio = stock.cantidad > 0 ? totalNuevo / stock.cantidad : 0;
  } else if (['SALIDA','AJUSTE_NEG'].includes(tipo)) {
    stock.cantidad -= cantidad;
    if (stock.cantidad < 0) stock.cantidad = 0; // evitar negativo temporal
  } else if (tipo === 'TRANSFERENCIA') {
    // handled externally as SALIDA + ENTRADA
  }
}

function aplicarCosteoFIFO(stock, movimiento) {
  const { tipo, cantidad, costoUnitario } = movimiento;
  if (['ENTRADA','AJUSTE_POS'].includes(tipo)) {
    stock.capasFIFO.push({ cantidad, costoUnitario, restante: cantidad });
    stock.cantidad += cantidad;
  } else if (['SALIDA','AJUSTE_NEG'].includes(tipo)) {
    let restante = cantidad;
    const consumidas = [];
    for (const capa of stock.capasFIFO) {
      if (restante <= 0) break;
      if (capa.restante === 0) continue;
      const tomar = Math.min(capa.restante, restante);
      capa.restante -= tomar;
      restante -= tomar;
      stock.cantidad -= tomar;
      consumidas.push({ cantidad: tomar, costoUnitario: capa.costoUnitario });
    }
    movimiento.capasConsumidas = consumidas;
    // Recalcular costoPromedio como referencia informativa (promedio ponderado de capas restantes)
    const totalValor = stock.capasFIFO.reduce((acc,c) => acc + (c.restante * c.costoUnitario),0);
    const totalQty = stock.capasFIFO.reduce((acc,c) => acc + c.restante,0);
    stock.costoPromedio = totalQty > 0 ? totalValor / totalQty : 0;
  }
  // Limpiar capas vacías para evitar crecimiento infinito
  stock.capasFIFO = stock.capasFIFO.filter(c => c.restante > 0);
}

const Lote = require('../models/Lote');

async function elegirLoteParaSalida(productoRef, tipoProducto) {
  // Selección FEFO: lote con fechaCaducidad más próxima y no vencido; si ninguno, por fechaIngreso
  const hoy = new Date();
  const candidatos = await Lote.find({ productoRef, tipoProducto, estado: 'ACTIVO' })
    .sort({ fechaCaducidad: 1, fechaIngreso: 1 })
    .limit(20);
  const noVencidos = candidatos.filter(c => !c.fechaCaducidad || c.fechaCaducidad >= hoy);
  return (noVencidos[0] || candidatos[0]) || null;
}

async function registrarMovimiento(data) {
  const { tipo, productoRef, tipoProducto, lote=null, loteRef=null, bodegaOrigen, bodegaDestino, ubicacionOrigen, ubicacionDestino, cantidad, costoUnitario=0, metodoCosteo='PROMEDIO', notas='', usuario='' } = data;

  if (cantidad <= 0) throw new Error('Cantidad debe ser > 0');
  if (tipo === 'TRANSFERENCIA') {
    if (!bodegaOrigen || !bodegaDestino || !ubicacionOrigen || !ubicacionDestino) throw new Error('Transferencia requiere bodegas y ubicaciones origen/destino');
  }

  let movimientosGenerados = [];

  // Para transferencia, tratamos como salida + entrada separadas para costeo correcto.
  if (tipo === 'TRANSFERENCIA') {
    const salida = await registrarMovimiento({ tipo: 'SALIDA', productoRef, tipoProducto, lote, bodegaOrigen, ubicacionOrigen, cantidad, metodoCosteo, notas: 'Parte de TRANSFERENCIA', usuario });
    const costoReferencia = salida.costoUnitario; // promedio o ponderado
    const entrada = await registrarMovimiento({ tipo: 'ENTRADA', productoRef, tipoProducto, lote, bodegaDestino, ubicacionDestino, cantidad, costoUnitario: costoReferencia, metodoCosteo, notas: 'Parte de TRANSFERENCIA', usuario });
    return { transferencia: true, movimientos: [salida, entrada] };
  }

  // Determinar claves de stock (origen o destino según tipo)
  const bodega = ['ENTRADA','AJUSTE_POS'].includes(tipo) ? bodegaDestino || bodegaOrigen : bodegaOrigen || bodegaDestino;
  const ubicacion = ['ENTRADA','AJUSTE_POS'].includes(tipo) ? ubicacionDestino || ubicacionOrigen : ubicacionOrigen || ubicacionDestino;
  if (!bodega || !ubicacion) throw new Error('Bodega y ubicación requeridas');

  let loteRefFinal = loteRef;
  if (['SALIDA','AJUSTE_NEG'].includes(tipo)) {
    // Validar loteRef si viene y caducidad
    if (loteRefFinal) {
      const loteDoc = await Lote.findById(loteRefFinal);
      if (loteDoc && loteDoc.fechaCaducidad && loteDoc.fechaCaducidad < new Date()) {
        throw new Error('Lote caducado');
      }
    } else {
      // Elegir lote automáticamente (FEFO) si existe en lotes activos
      const elegido = await elegirLoteParaSalida(productoRef, tipoProducto);
      if (elegido) loteRefFinal = elegido._id;
    }
  }

  const stock = await obtenerStock({ productoRef, tipoProducto, lote, loteRef: loteRefFinal, bodega, ubicacion, metodoCosteo });
  const movimiento = new MovimientoInventario({ tipo, productoRef, tipoProducto, lote, loteRef: loteRefFinal, bodegaOrigen, bodegaDestino, ubicacionOrigen, ubicacionDestino, cantidad, costoUnitario, metodoCosteo, notas, usuario });

  if (metodoCosteo === 'PROMEDIO') {
    if (['SALIDA','AJUSTE_NEG'].includes(tipo)) {
      movimiento.costoUnitario = stock.costoPromedio;
    }
    aplicarCosteoPromedio(stock, movimiento);
  } else if (metodoCosteo === 'FIFO') {
    if (['SALIDA','AJUSTE_NEG'].includes(tipo)) {
      // capasConsumidas llenará el array y calcularemos un costoUnitario promedio del movimiento
    }
    aplicarCosteoFIFO(stock, movimiento);
    if (['SALIDA','AJUSTE_NEG'].includes(tipo)) {
      const totalValor = (movimiento.capasConsumidas || []).reduce((acc,c)=> acc + c.cantidad * c.costoUnitario,0);
      const totalQty = (movimiento.capasConsumidas || []).reduce((acc,c)=> acc + c.cantidad,0);
      movimiento.costoUnitario = totalQty > 0 ? totalValor / totalQty : 0;
    }
  }

  await stock.save();
  await movimiento.save();
  return movimiento;
}

module.exports = { registrarMovimiento };
