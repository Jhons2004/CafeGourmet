const StockProducto = require('../models/StockProducto');

module.exports = {
  async ingresar({ productoId, cantidad, ubicacion = 'ALM-PRINCIPAL', lotePT = null }) {
    if (!productoId || !cantidad || cantidad <= 0) return;
    const doc = new StockProducto({ producto: productoId, cantidad, ubicacion, lotePT });
    await doc.save();
    return doc;
  },

  async despachar(items, ubicacion = 'ALM-PRINCIPAL') {
    // items: [{ productoId, cantidad }]
    for (const it of items) {
      let restante = Number(it.cantidad || 0);
      if (restante <= 0) continue;
      const docs = await StockProducto.find({ producto: it.productoId, ubicacion }).sort({ fechaIngreso: 1 });
      for (const d of docs) {
        if (restante <= 0) break;
        const disp = Number(d.cantidad || 0);
        if (disp <= 0) continue;
        const tomar = Math.min(disp, restante);
        d.cantidad = disp - tomar;
        restante -= tomar;
        await d.save();
      }
      if (restante > 0) throw new Error('Stock de producto terminado insuficiente');
    }
    return true;
  }
};
