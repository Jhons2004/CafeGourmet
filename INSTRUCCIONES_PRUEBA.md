# 🎯 INSTRUCCIONES PARA PROBAR EL SISTEMA

## ✅ ESTADO ACTUAL
- ✅ Backend corriendo en: http://localhost:3000
- ✅ Frontend corriendo en: http://localhost:5173
- ✅ MongoDB conectado
- ✅ Logs detallados activados

## 📋 PASOS PARA CREAR Y DESPACHAR PEDIDOS CORRECTAMENTE

### 1️⃣ ABRIR LA APLICACIÓN
Abre tu navegador en: **http://localhost:5173**

### 2️⃣ INICIAR SESIÓN
- Email: `admin1@cafe.com` o `admin2@cafe.com`
- Password: (la que configuraste)

### 3️⃣ IR AL PANEL DE VENTAS
- Haz clic en "Ventas" en el menú lateral

### 4️⃣ CREAR UN CLIENTE (si no tienes)
1. Haz clic en el botón "➕ Nuevo Cliente"
2. Llena los datos:
   - Nombre: `Cliente Prueba`
   - RUC: `12345678901`
   - Email: `cliente@test.com`
   - Teléfono: `555-1234`
3. Haz clic en "Crear Cliente"

### 5️⃣ CREAR UN PRODUCTO CON STOCK ⚠️ IMPORTANTE
1. Haz clic en el botón "➕ Nuevo Producto"
2. Llena los datos:
   - SKU: `CAFE-001`
   - Nombre: `Café Arábica Premium`
   - Unidad: `kg`
   - **Stock Inicial: `1000`** ⚠️ **NO DEJES ESTO EN 0**
3. Haz clic en "Crear Producto"
4. **VERIFICA EN LA CONSOLA DEL NAVEGADOR (F12):**
   - Debe aparecer: `✅ Producto creado: {...}`
   - Debe aparecer: `✅ Stock registrado: {...}`

### 6️⃣ VERIFICAR EN LA VENTANA DEL BACKEND
En la ventana de PowerShell del Backend debes ver:
```
🔵 [stockProductoController.ingresar] Recibida petición: { productoId: '...', cantidad: 1000, ubicacion: 'ALM-PRINCIPAL' }
✅ Producto encontrado: Café Arábica Premium (SKU: CAFE-001)
✅ Stock registrado exitosamente. ID: ...
```

### 7️⃣ CREAR UN PEDIDO
1. Haz clic en "➕ Nuevo Pedido"
2. Selecciona el cliente que creaste
3. En items:
   - Producto: Selecciona "Café Arábica Premium"
   - Cantidad: `10` (mucho menos que el stock de 1000)
   - Precio: `50`
4. Haz clic en "Crear Pedido"

### 8️⃣ CONFIRMAR EL PEDIDO
1. En la lista de pedidos, busca el que acabas de crear (estado: "pendiente")
2. Haz clic en el botón **"Confirmar"**
3. El estado debe cambiar a "confirmado" (color amarillo)

### 9️⃣ DESPACHAR EL PEDIDO ✅ ESTO AHORA DEBE FUNCIONAR
1. Haz clic en el botón **"Despachar"**
2. **VERIFICA EN LA CONSOLA DEL NAVEGADOR:**
   - Debe aparecer: `🚚 Intentando despachar pedido: ...`
3. **VERIFICA EN LA VENTANA DEL BACKEND:**
   ```
   📦 Buscando stock para producto ..., cantidad requerida: 10
   📦 Documentos de stock encontrados: 1
     - Stock ID: ..., Cantidad disponible: 1000
   📦 Stock total disponible: 1000, Requerido: 10
   📦 Descontado 10 unidades del stock ..., restante en stock: 990
   ```
4. El estado debe cambiar a "despachado" (color verde)
5. ✅ **YA NO DEBE APARECER EL ERROR "Stock insuficiente"**

### 🔟 EMITIR FACTURA
1. Haz clic en "➕ Nueva Factura"
2. Selecciona el pedido despachado
3. Fecha de emisión: (hoy)
4. Haz clic en "Emitir Factura"

## 🐛 SI SIGUE FALLANDO

### Verificar que el stock se registró:
Ejecuta en una terminal:
```powershell
cd "c:\Desarrollo Web Formularios 2\Backend"
node test-stock.js
```

Debe mostrar:
```
📦 PRODUCTOS TERMINADOS:
  1. Café Arábica Premium (SKU: CAFE-001)

📊 STOCK DISPONIBLE:
  - Producto: Café Arábica Premium | Cantidad: 1000 | Ubicación: ALM-PRINCIPAL
```

### Si NO aparece stock:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network"
3. Crea un producto nuevo con stock inicial
4. Busca la petición a `/api/inventario/stock-productos`
5. Verifica la respuesta

### Logs a revisar:
- **Consola del navegador (F12)**: Ver errores JavaScript y respuestas del servidor
- **Ventana PowerShell Backend**: Ver logs del servidor y procesamiento de stock
- **Ventana PowerShell Frontend**: Ver si hay errores de compilación

## 📞 PROBLEMAS COMUNES

### Error: "Stock de producto terminado insuficiente"
**Causa**: El producto no tiene stock registrado
**Solución**: Asegúrate de poner un número > 0 en "Stock Inicial" al crear el producto

### Error: "Producto no encontrado"
**Causa**: El ID del producto no existe en la base de datos
**Solución**: Vuelve a crear el producto desde cero

### No aparecen los logs en el backend
**Causa**: La ventana del backend se cerró o hay un error
**Solución**: Revisa que las 2 ventanas de PowerShell estén abiertas

## 🎉 SI TODO FUNCIONA CORRECTAMENTE VERÁS:
1. ✅ Producto creado con stock
2. ✅ Pedido creado en estado "pendiente"
3. ✅ Pedido confirmado en estado "confirmado"
4. ✅ Pedido despachado en estado "despachado" (SIN ERRORES)
5. ✅ Factura emitida correctamente
6. ✅ El stock disminuyó de 1000 a 990

---
**Última actualización**: $(Get-Date)
