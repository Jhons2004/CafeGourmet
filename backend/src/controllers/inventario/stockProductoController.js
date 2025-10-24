const StockProductoService = require('../../services/StockProductoService');

module.exports = {
  ingresar: async (req, res) => {
    try {
      console.log('🔵 [stockProductoController.ingresar] Recibida petición:', req.body);
      
      const { productoId, cantidad, ubicacion, lotePT } = req.body;
      
      // Validaciones
      if (!productoId) {
        console.error('❌ ProductoId no proporcionado');
        return res.status(400).json({ error: 'productoId es requerido' });
      }
      
      if (!cantidad || cantidad <= 0) {
        console.error('❌ Cantidad inválida:', cantidad);
        return res.status(400).json({ error: 'cantidad debe ser mayor a 0' });
      }
      
      console.log(`✅ Registrando stock: ProductoId=${productoId}, Cantidad=${cantidad}, Ubicacion=${ubicacion || 'ALM-PRINCIPAL'}`);
      
      const doc = await StockProductoService.ingresar({ productoId, cantidad, ubicacion, lotePT });
      
      console.log('✅ Stock registrado exitosamente:', doc);
      
      res.json(doc);
    } catch (e) {
      console.error('❌ Error al registrar stock:', e.message);
      res.status(400).json({ error: e.message });
    }
  }
};
