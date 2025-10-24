const CxP = require('../../models/CuentaPorPagar');
const tc = require('./tcController');
const path = require('path');
const fs = require('fs');

module.exports = {
	listar: async (req, res) => {
		try {
			const docs = await CxP.find().populate('proveedor', 'nombre ruc').populate('ordenCompra', 'numero total').lean();
			res.json(docs);
		} catch (e) { res.status(500).json({ error: e.message }); }
	},
	crear: async (req, res) => {
		try {
			const { proveedorId, ordenCompraId, fechaVencimiento, moneda = 'GTQ', monto } = req.body;
			const doc = await CxP.create({ proveedor: proveedorId, ordenCompra: ordenCompraId || undefined, fechaVencimiento, moneda, monto, saldo: monto, estado: 'pendiente' });
			res.status(201).json(doc);
		} catch (e) { res.status(400).json({ error: e.message }); }
	},
	pagar: async (req, res) => {
		try {
			const { id } = req.params; const { monto } = req.body;
			const doc = await CxP.findById(id); if (!doc) return res.status(404).json({ error: 'No encontrado' });
			if (doc.estado === 'pagado' || doc.estado === 'anulado') return res.status(400).json({ error: 'No se puede pagar' });
			doc.pagos.push({ monto });
			doc.saldo = Number((doc.saldo - Number(monto)).toFixed(2));
			if (doc.saldo <= 0) { doc.estado = 'pagado'; doc.saldo = 0; } else { doc.estado = 'parcial'; }
			await doc.save();
			res.json(doc);
		} catch (e) { res.status(400).json({ error: e.message }); }
	},
	anular: async (req, res) => {
		try {
			const { id } = req.params; const doc = await CxP.findById(id); if (!doc) return res.status(404).json({ error: 'No encontrado' });
			doc.estado = 'anulado'; await doc.save(); res.json(doc);
		} catch (e) { res.status(400).json({ error: e.message }); }
	},
	actualizarFactura: async (req, res) => {
		try {
			const { id } = req.params;
			const { numero, fecha, adjuntoUrl, observaciones, tcUsado } = req.body;
			const doc = await CxP.findById(id); if (!doc) return res.status(404).json({ error: 'No encontrado' });
			let tcFinal = tcUsado;
			let tcFuente = undefined;
			let tcFecha = undefined;
			if ((tcFinal === undefined || tcFinal === null) && doc.moneda === 'USD') {
				try {
					const data = await tc.getCached(false);
					// Preferir compra para CxP; si no viene, usar referencia o venta
					tcFinal = data.compra || data.referencia || data.venta || undefined;
					if (tcFinal !== undefined) { tcFuente = data.fuente || 'Banguat'; tcFecha = data.fecha ? new Date(data.fecha) : new Date(); }
				} catch (e) {
					// si falla, dejamos tcFinal como undefined
				}
			}
			// Merge incremental: no perder otros campos existentes de facturaProveedor
			doc.facturaProveedor = {
				...(doc.facturaProveedor || {}),
				...(numero !== undefined ? { numero } : {}),
				...(fecha !== undefined ? { fecha } : {}),
				...(adjuntoUrl !== undefined ? { adjuntoUrl } : {}),
				...(observaciones !== undefined ? { observaciones } : {}),
				...(tcFinal !== undefined ? { tcUsado: tcFinal } : {}),
				...(tcFuente !== undefined ? { tcFuente } : {}),
				...(tcFecha !== undefined ? { tcFecha } : {})
			};
			await doc.save();
			res.json(doc);
		} catch (e) { res.status(400).json({ error: e.message }); }
	}
,
	descargarAdjunto: async (req, res) => {
		try {
			const { id } = req.params;
			const doc = await CxP.findById(id).lean();
			if (!doc) return res.status(404).json({ error: 'No encontrado' });
			const adj = doc.facturaProveedor && doc.facturaProveedor.adjuntoUrl;
			if (!adj) return res.status(404).json({ error: 'Sin adjunto' });
			// Mapear /uploads/... a ruta física
			const baseUploads = path.resolve(__dirname, '../../../uploads');
			const rel = String(adj).replace(/^\/?uploads\//, '');
			const abs = path.join(baseUploads, rel);
			if (!abs.startsWith(baseUploads)) return res.status(400).json({ error: 'Ruta inválida' });
			if (!fs.existsSync(abs)) return res.status(404).json({ error: 'Archivo no encontrado' });
			return res.sendFile(abs);
		} catch (e) { res.status(500).json({ error: e.message }); }
	}
};

