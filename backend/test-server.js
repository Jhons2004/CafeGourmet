const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Conexión básica a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/cafe_gourmet')
    .then(() => {
        console.log('MongoDB conectado');
    })
    .catch(err => {
        console.error('Error MongoDB:', err);
    });

app.use(express.json());

// Endpoint de prueba simple
app.get('/api/health', (req, res) => {
    console.log('Request recibida en /api/health');
    res.json({ ok: true, message: 'Server running' });
});

app.get('/', (req, res) => {
    console.log('Request recibida en /');
    res.json({ message: 'Test server running' });
});

const PORT = 3001;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Test server corriendo en 127.0.0.1:${PORT}`);
});

// Manejo de errores
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});