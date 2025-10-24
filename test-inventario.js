// Script de prueba para verificar el endpoint de inventario
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

async function testInventario() {
    try {
        console.log('🔍 Probando endpoint de inventario...\n');
        
        // 1. Login para obtener token
        console.log('1️⃣ Haciendo login...');
        const loginRes = await fetch(`${BASE_URL}/usuario/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin1@cafe.com',
                password: 'admin123'
            })
        });
        
        const loginData = await loginRes.json();
        
        if (!loginData.token) {
            console.error('❌ Error al obtener token:', loginData);
            return;
        }
        
        console.log('✅ Login exitoso, token obtenido\n');
        const token = loginData.token;
        
        // 2. Obtener inventario
        console.log('2️⃣ Obteniendo inventario...');
        const invRes = await fetch(`${BASE_URL}/inventario/items`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const granos = await invRes.json();
        
        if (invRes.status !== 200) {
            console.error('❌ Error al obtener inventario:', granos);
            return;
        }
        
        console.log(`✅ Inventario obtenido: ${granos.length} granos\n`);
        console.log('📦 Granos en inventario:');
        granos.forEach((g, i) => {
            console.log(`   ${i+1}. ${g.tipo.toUpperCase()} - ${g.cantidad} kg - ${g.proveedor}`);
        });
        
        console.log('\n✨ Prueba completada exitosamente!');
        
    } catch (err) {
        console.error('❌ Error en la prueba:', err.message);
    }
}

testInventario();
