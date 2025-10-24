# 🧪 Guía de Pruebas - Sistema CafeGourmet

## ✅ Servicios Activos

1. **Backend**: http://localhost:3000
2. **Frontend**: http://localhost:5173

## 📋 Pasos para Probar el Flujo Completo

### 1️⃣ Verificar Stock Actual en Base de Datos

```powershell
cd "c:\Desarrollo Web Formularios 2\Backend"
node test-stock.js
```

Esto mostrará:
- Todos los productos terminados registrados
- Todo el stock disponible en el sistema

### 2️⃣ Crear un Producto con Stock Inicial

1. Abre http://localhost:5173 en tu navegador
2. Inicia sesión con:
   - Email: `admin1@cafe.com`
   - Password: (tu contraseña)
3. Ve al panel de **Ventas**
4. Click en **➕ Nuevo Producto**
5. Completa el formulario:
   - SKU: `CAF-001`
   - Nombre: `Café Arábica Premium`
   - Unidad: `kg`
   - **Stock Inicial: `100`** ⚠️ **MUY IMPORTANTE**
6. Click en **Crear Producto**
7. **Abre la consola del navegador (F12)** para ver los logs:
   - ✅ Producto creado
   - ✅ Stock registrado

### 3️⃣ Crear un Cliente

1. En el panel de Ventas, click en **➕ Nuevo Cliente**
2. Completa:
   - Nombre: `Cliente Test`
   - RUC: `12345678901`
   - Email: `cliente@test.com`
   - Teléfono: `555-1234`
   - Dirección: `Calle Test 123`
3. Click en **Crear Cliente**

### 4️⃣ Crear un Pedido

1. Click en **➕ Nuevo Pedido**
2. Selecciona el cliente creado
3. En Items:
   - Producto: Selecciona `Café Arábica Premium`
   - Cantidad: `10` (debe ser menor al stock disponible)
   - Precio: `50`
4. Click en **Crear Pedido**

### 5️⃣ Confirmar el Pedido

1. Busca el pedido en la lista (estado: **BORRADOR**)
2. Click en **✅ Confirmar**
3. El estado debe cambiar a **CONFIRMADO**

### 6️⃣ Despachar el Pedido

1. Con el pedido **CONFIRMADO**, click en **🚚 Despachar**
2. **Abre la consola del navegador (F12)** para ver:
   - 📦 Búsqueda de stock
   - 📦 Documentos encontrados
   - 📦 Stock disponible vs requerido
   - ✅ Descuento exitoso

**Si sale error "Stock insuficiente":**
- Ve a la terminal del Backend (ventana PowerShell)
- Busca los logs que muestran:
  - `📦 Buscando stock para producto...`
  - `📦 Documentos de stock encontrados: X`
  - `📦 Stock total disponible: X, Requerido: X`

### 7️⃣ Verificar Stock Después del Despacho

```powershell
cd "c:\Desarrollo Web Formularios 2\Backend"
node test-stock.js
```

Deberías ver que la cantidad de stock disminuyó en 10 unidades.

### 8️⃣ Emitir Factura

1. Click en **➕ Nueva Factura**
2. Selecciona el pedido **DESPACHADO**
3. Click en **Crear Factura**

## 🔍 Diagnóstico de Problemas

### ❌ Error: "Stock de producto terminado insuficiente"

**Causas posibles:**

1. **No se registró stock inicial al crear el producto**
   - Solución: Verifica en consola del navegador si apareció "✅ Stock registrado"
   - Si no, el producto no tiene stock. Necesitas registrarlo manualmente.

2. **El ID del producto no coincide**
   - Ejecuta `node test-stock.js` para ver los IDs
   - Compara con los IDs en la consola del navegador

3. **La ubicación no coincide**
   - El sistema usa `ALM-PRINCIPAL` por defecto
   - Verifica que el stock se creó en esa ubicación

### 🛠️ Registrar Stock Manualmente (si es necesario)

Si un producto ya existe pero no tiene stock:

```javascript
// En la consola del navegador:
const productoId = "PEGAR_AQUI_EL_ID_DEL_PRODUCTO";
const cantidad = 100;

fetch('/api/inventario/stock-productos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    productoId: productoId,
    cantidad: cantidad,
    ubicacion: 'ALM-PRINCIPAL'
  })
})
.then(r => r.json())
.then(data => console.log('✅ Stock registrado:', data))
.catch(err => console.error('❌ Error:', err));
```

## 📊 Logs Importantes

### Frontend (Consola del Navegador - F12):
- `✅ Producto creado:` - Muestra el producto con su ID
- `✅ Stock registrado:` - Confirma que se creó el stock
- `🚚 Intentando despachar pedido:` - Inicio del despacho
- `❌ Error al despachar:` - Mensaje de error si falla

### Backend (Terminal PowerShell):
- `Servidor corriendo en 127.0.0.1:3000` - Backend activo
- `Conectado a MongoDB` - DB conectada
- `📦 Buscando stock para producto...` - Búsqueda de stock
- `📦 Documentos de stock encontrados: X` - Cantidad de registros
- `📦 Stock total disponible: X` - Total disponible

## 🎯 Flujo Completo Exitoso

```
1. Crear Producto con Stock Inicial (100 kg)
   ↓
2. Crear Cliente
   ↓
3. Crear Pedido (10 kg)
   ↓ Estado: BORRADOR
4. Confirmar Pedido
   ↓ Estado: CONFIRMADO (Reserva creada)
5. Despachar Pedido
   ↓ Estado: DESPACHADO (Stock: 90 kg)
6. Emitir Factura
   ✅ COMPLETADO
```

## 📞 Si Aún Falla

1. Ejecuta `node test-stock.js` y copia la salida
2. Abre la consola del navegador (F12) y copia los errores
3. Abre la terminal del Backend y copia los logs
4. Comparte toda esta información para diagnóstico

---

**Nota:** Los logs de debug (📦, ✅, ❌) son temporales y se pueden quitar una vez que el sistema funcione correctamente.
