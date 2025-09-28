const Lote = require('../models/Lote');

async function revisarLotesCaducados() {
  const ahora = new Date();
  const result = await Lote.updateMany({ estado: 'ACTIVO', fechaCaducidad: { $lt: ahora } }, { $set: { estado: 'BLOQUEADO' } });
  if (result.modifiedCount) {
    console.log(`[LotesJob] Lotes bloqueados por caducidad: ${result.modifiedCount}`);
  }
}

function schedule() {
  // Ejecutar al iniciar y luego cada 6 horas
  revisarLotesCaducados().catch(e=>console.error('[LotesJob] Error inicial', e));
  setInterval(() => revisarLotesCaducados().catch(e=>console.error('[LotesJob] Error ciclo', e)), 6 * 60 * 60 * 1000);
}

module.exports = { schedule };