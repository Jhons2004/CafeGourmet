const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();

console.log('1. Iniciando servidor...');

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cafe_gourmet';
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('2. Conectado a MongoDB');
    })
    .catch(err => {
        console.error('Error al conectar a MongoDB:', err);
    });

console.log('3. Configurando middlewares básicos...');
app.use(cors());
app.use(express.json());

console.log('4. Configurando rutas básicas...');

// Endpoint de salud simple
app.get('/api/health', (req, res) => {
    console.log('Request recibida en /api/health');
    const dbState = mongoose.connection.readyState;
    res.json({ ok: true, db: dbState, message: 'Server running' });
});

app.get('/', (req, res) => {
    console.log('Request recibida en /');
    res.json({ message: 'Server running' });
});

console.log('5. Cargando rutas de inventario...');
try {
    const inventarioRoutes = require('./routes/inventario');
    app.use('/api/inventario', inventarioRoutes);
    console.log('✓ Rutas de inventario cargadas');
} catch (err) {
    console.error('❌ Error cargando rutas de inventario:', err.message);
}

console.log('6. Cargando rutas de usuario...');
try {
    const usuarioRoutes = require('./routes/usuario');
    app.use('/api/usuario', usuarioRoutes);
    console.log('✓ Rutas de usuario cargadas');
} catch (err) {
    console.error('❌ Error cargando rutas de usuario:', err.message);
}

console.log('7. Cargando rutas de producción...');
try {
    const produccionRoutes = require('./routes/produccion');
    app.use('/api/produccion', produccionRoutes);
    console.log('✓ Rutas de producción cargadas');
} catch (err) {
    console.error('❌ Error cargando rutas de producción:', err.message);
}

console.log('8. Cargando rutas de compras...');
try {
    const comprasRoutes = require('./routes/compras');
    app.use('/api/compras', comprasRoutes);
    console.log('✓ Rutas de compras cargadas');
} catch (err) {
    console.error('❌ Error cargando rutas de compras:', err.message);
}

console.log('9. Cargando rutas de trazabilidad...');
try {
    const trazabilidadRoutes = require('./routes/trazabilidad');
    app.use('/api/trazabilidad', trazabilidadRoutes);
    console.log('✓ Rutas de trazabilidad cargadas');
} catch (err) {
    console.error('❌ Error cargando rutas de trazabilidad:', err.message);
}

console.log('10. Configurando archivos estáticos...');
const distDir = path.resolve(__dirname, '../../Frontend/dist');
app.use(express.static(distDir));

app.get(/^\/(?!api).*$/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
});

console.log('11. Iniciando servidor...');
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const server = app.listen(PORT, HOST, () => {
    console.log(`✓ Servidor corriendo en ${HOST}:${PORT}`);
});

// Logs de errores
server.on('error', (err) => {
    console.error('❌ Error del servidor HTTP:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
});