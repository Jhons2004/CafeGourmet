const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/registrar', usuarioController.registrar);
router.post('/login', usuarioController.login);
// Recuperación de contraseña
router.post('/forgot-password', usuarioController.forgotPassword);
router.post('/reset-password/:token', usuarioController.resetPassword);
// Cambio simple de contraseña (sin token)
router.post('/reset-password-simple', usuarioController.resetPasswordSimple);

module.exports = router;
