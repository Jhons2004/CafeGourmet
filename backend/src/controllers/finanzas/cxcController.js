const CxC = require('../../models/CuentaPorCobrar');

module.exports = {
	listar: async (req, res) => {
		try {
			const docs = await CxC.find().populate('cliente', 'nombre ruc').populate('factura', 'numero total').lean();
			res.json(docs);
		} catch (e) { res.status(500).json({ error: e.message }); }
	},
	crear: async (req, res) => {
		try {
			const { clienteId, facturaId, fechaVencimiento, moneda = 'GTQ', monto } = req.body;
			const doc = await CxC.create({ cliente: clienteId, factura: facturaId || undefined, fechaVencimiento, moneda, monto, saldo: monto, estado: 'pendiente' });
			res.status(201).json(doc);
		} catch (e) { res.status(400).json({ error: e.message }); }
	},
	cobrar: async (req, res) => {
		try {
			const { id } = req.params; const { monto } = req.body;
			const doc = await CxC.findById(id); if (!doc) return res.status(404).json({ error: 'No encontrado' });
			if (doc.estado === 'cobrado' || doc.estado === 'anulado') return res.status(400).json({ error: 'No se puede cobrar' });
			doc.cobros.push({ monto });
			doc.saldo = Number((doc.saldo - Number(monto)).toFixed(2));
			if (doc.saldo <= 0) { doc.estado = 'cobrado'; doc.saldo = 0; } else { doc.estado = 'parcial'; }
			await doc.save();
			res.json(doc);
		} catch (e) { res.status(400).json({ error: e.message }); }
	},
	anular: async (req, res) => {
		try {
			const { id } = req.params; const doc = await CxC.findById(id); if (!doc) return res.status(404).json({ error: 'No encontrado' });
			doc.estado = 'anulado'; await doc.save(); res.json(doc);
		} catch (e) { res.status(400).json({ error: e.message }); }
	}
};

