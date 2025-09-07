const Grano = require('../models/Grano');

module.exports = {
    registrarGrano: async (req, res) => {
        try {
            const { tipo, cantidad, proveedor } = req.body;
            const grano = new Grano({ tipo, cantidad, proveedor });
            await grano.save();
            res.json({ mensaje: 'Grano registrado', grano });
        } catch (err) {
            res.status(400).json({ error: 'Error al registrar grano', detalles: err.message });
        }
    },
    actualizarStock: async (req, res) => {
        try {
            const { id, cantidad } = req.body;
            const grano = await Grano.findById(id);
            if (!grano) return res.status(404).json({ error: 'Grano no encontrado' });
            grano.cantidad = cantidad;
            await grano.save();
            res.json({ mensaje: 'Stock actualizado', grano });
        } catch (err) {
            res.status(400).json({ error: 'Error al actualizar stock', detalles: err.message });
        }
    },
    verInventario: async (req, res) => {
        try {
            const inventario = await Grano.find();
            res.json(inventario);
        } catch (err) {
            res.status(500).json({ error: 'Error al obtener inventario', detalles: err.message });
        }
    }
};
