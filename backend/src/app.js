const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const inventarioRoutes = require('./routes/inventario');
const produccionRoutes = require('./routes/produccion');
const usuarioRoutes = require('./routes/usuario');

// Conexión a MongoDB (opciones deprecadas eliminadas)
mongoose.connect('mongodb://localhost:27017/cafe_gourmet')
    .then(() => {
        console.log('Conectado a MongoDB');
    })
    .catch(err => {
        console.error('Error al conectar a MongoDB:', err);
    });

app.use(cors());
app.use(express.json());


app.use('/api/inventario', inventarioRoutes);
app.use('/api/produccion', produccionRoutes);
app.use('/api/usuario', usuarioRoutes);

// Endpoint de salud para ver estado del backend/db
app.get('/api/health', (req, res) => {
    const dbState = mongoose.connection.readyState; // 1 conectado
    res.json({ ok: true, db: dbState });
});

// Servir frontend (build de Vite) desde dist
const distDir = path.resolve(__dirname, '../../Frontend/dist');
app.use(express.static(distDir));

// Para rutas no-API, entregar index.html del frontend (SPA fallback)
app.get(/^\/(?!api).*$/, (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
});

// (El bloque duplicado de estáticos fue removido para evitar conflictos)

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Logs adicionales para diagnosticar caídas
server.on('error', (err) => {
    console.error('Error del servidor HTTP:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
