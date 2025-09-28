const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const app = express();

const inventarioRoutes = require('./routes/inventario');
const produccionRoutes = require('./routes/produccion');
const usuarioRoutes = require('./routes/usuario');
const comprasRoutes = require('./routes/compras');
const trazabilidadRoutes = require('./routes/trazabilidad');
const ventasRoutes = require('./routes/ventas');
const calidadRoutes = require('./routes/calidad');
const reportesRoutes = require('./routes/reportes');
const finanzasRoutes = require('./routes/finanzas');
const tcController = require('./controllers/finanzas/tcController');
const { schedule: scheduleLotesJob } = require('./jobs/lotesJob');

// Conexión a MongoDB configurable por entorno
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cafe_gourmet';
mongoose.connect(MONGODB_URI)
    .then(() => {
    console.log('Conectado a MongoDB');
    })
    .catch(err => {
        console.error('Error al conectar a MongoDB:', err);
    });

app.use(cors());
app.use(express.json());
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(morgan('dev'));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300, // limite generoso para uso interno
}));


app.use('/api/inventario', inventarioRoutes);
app.use('/api/produccion', produccionRoutes);
app.use('/api/usuario', usuarioRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/trazabilidad', trazabilidadRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/calidad', calidadRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/finanzas', finanzasRoutes);

// Endpoint de salud para ver estado del backend/db
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState; // 1 conectado
    res.json({ ok: true, db: dbState });
});

// Servir uploads estáticos (adjuntos, facturas, etc.)
const uploadsDir = path.resolve(__dirname, '../uploads');
// Asegurar carpeta de uploads
try { require('fs').mkdirSync(path.join(uploadsDir, 'invoices'), { recursive: true }); } catch {}
app.use('/uploads', express.static(uploadsDir));

// Servir frontend (build de Vite) desde dist
const distDir = path.resolve(__dirname, '../../Frontend/dist');
app.use(express.static(distDir));

// Para rutas no-API, entregar index.html del frontend (SPA fallback)
app.get(/^\/(?!api).*$/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
});

// (El bloque duplicado de estáticos fue removido para evitar conflictos)

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const server = app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en ${HOST}:${PORT}`);
    // Precalentar y programar actualización de tipo de cambio
    tcController.precalentar();
    tcController.schedule();
    scheduleLotesJob();
});

// Logs adicionales para diagnosticar caídas
server.on('error', (err) => {
    console.error('Error del servidor HTTP:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    // No exit on unhandled rejection
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // No exit on uncaught exception for now
});
