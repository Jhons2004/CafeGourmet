# Fix: Campo de Estado de Órdenes Corregido

## Problema
Al intentar aprobar una orden, el backend devolvía:
```
Error: Solo borrador puede aprobarse
```

## Causa Raíz
**Desajuste entre frontend y backend:**
- **Frontend** estaba buscando campo `oc.aprobada` (booleano que NO existe)
- **Backend** usa campo `oc.estado` (string con múltiples valores)

### Modelo Real (Backend):
```javascript
OrdenCompraSchema = {
  estado: { 
    type: String, 
    enum: ['borrador', 'aprobada', 'recibida', 'cancelada'], 
    default: 'borrador' 
  },
  fechaAprobacion: { type: Date },
  fechaRecepcion: { type: Date }
}
```

### Lógica de Aprobación (Backend):
```javascript
// ordenCompraController.js
aprobar: async (req, res) => {
  const oc = await OrdenCompra.findById(id);
  
  // ❌ Validación que estaba fallando
  if (oc.estado !== 'borrador') {
    return res.status(400).json({ 
      error: 'Solo borrador puede aprobarse' 
    });
  }
  
  // ✅ Si es borrador, cambia a aprobada
  oc.estado = 'aprobada';
  oc.fechaAprobacion = new Date();
  await oc.save();
}
```

## Solución Implementada

### 1. Corregido Render de Órdenes
**ANTES:**
```javascript
backgroundColor: oc.aprobada ? '#e8f5e9' : '#fff3e0'  // ❌ Campo no existe
{oc.aprobada ? '✅ APROBADA' : '⏳ PENDIENTE'}       // ❌ Solo 2 estados
{!oc.aprobada && <button>Aprobar</button>}           // ❌ Muestra botón incorrecto
```

**DESPUÉS:**
```javascript
const esAprobada = oc.estado === 'aprobada';
const esBorrador = oc.estado === 'borrador';

// Colores según estado
let bgColor = '#fff';
if (esAprobada) bgColor = '#e8f5e9';        // Verde claro
else if (esBorrador) bgColor = '#fff3e0';   // Naranja claro
else if (oc.estado === 'recibida') bgColor = '#e3f2fd';  // Azul claro
else if (oc.estado === 'cancelada') bgColor = '#ffebee'; // Rojo claro

// Badge con 4 estados posibles
{esAprobada ? '✅ APROBADA' : 
 esBorrador ? '📝 BORRADOR' : 
 oc.estado === 'recibida' ? '📦 RECIBIDA' : 
 '❌ CANCELADA'}

// Botón solo visible en estado BORRADOR
{esBorrador && <button>✓ Aprobar</button>}
```

### 2. Corregido Selector de Recepciones
**ANTES:**
```javascript
ordenes.filter(o => o.aprobada)      // ❌ Campo no existe
ordenes.filter(o => !o.aprobada)     // ❌ Incluye todos los otros estados
```

**DESPUÉS:**
```javascript
// Solo órdenes APROBADAS son seleccionables
ordenes.filter(o => o.estado === 'aprobada')

// Resto de estados no disponibles
ordenes.filter(o => o.estado !== 'aprobada')

// Con iconos por estado
{o.estado === 'borrador' ? '📝' : 
 o.estado === 'recibida' ? '📦' : 
 '❌'} {proveedor} - {o.estado}
```

## Estados de Orden de Compra

### Diagrama de Flujo:
```
📝 BORRADOR (default)
    ↓ [Aprobar] ← Solo desde aquí se puede aprobar
✅ APROBADA
    ↓ [Crear Recepción]
📦 RECIBIDA
    
❌ CANCELADA (terminal)
```

### Tabla de Estados:

| Estado | Color Badge | Color Fondo | Icono | Botón "Aprobar" | Puede Recepcionar |
|--------|-------------|-------------|-------|-----------------|-------------------|
| `borrador` | 🟠 #ff9800 | #fff3e0 | 📝 | ✅ Visible | ❌ No |
| `aprobada` | 🟢 #4caf50 | #e8f5e9 | ✅ | ❌ Oculto | ✅ Sí |
| `recibida` | 🔵 #2196f3 | #e3f2fd | 📦 | ❌ Oculto | ❌ No |
| `cancelada` | 🔴 #f44336 | #ffebee | ❌ | ❌ Oculto | ❌ No |

## Reglas de Negocio

### Backend Validations:
1. ✅ Solo estado `borrador` puede cambiar a `aprobada`
2. ✅ Solo estado `aprobada` puede crear recepciones
3. ✅ Al aprobar, se crea automáticamente una Cuenta por Pagar
4. ✅ Cuando se crea recepción, el backend debería cambiar a `recibida`

### Frontend Filters:
1. ✅ Botón "Aprobar" solo visible en estado `borrador`
2. ✅ Selector de recepciones solo muestra estado `aprobada`
3. ✅ Advertencia si no hay órdenes aprobadas
4. ✅ Estados no aprobadas se muestran deshabilitadas con su estado actual

## Flujo Completo Corregido

### Paso 1: Crear Orden
```javascript
POST /api/compras/ordenes
{
  proveedor: "507f...",
  items: [...]
}

// Respuesta
{
  _id: "68e02fb4...",
  estado: "borrador",  // ← Default
  ...
}
```
**Frontend muestra:** 📝 BORRADOR (fondo naranja) + Botón "✓ Aprobar"

### Paso 2: Aprobar Orden
```javascript
POST /api/compras/ordenes/68e02fb4.../aprobar
{ aprobar: true }

// Backend valida:
if (oc.estado !== 'borrador') throw Error('Solo borrador puede aprobarse');

// Respuesta
{
  _id: "68e02fb4...",
  estado: "aprobada",  // ← Cambiado
  fechaAprobacion: "2025-10-18T...",
  ...
}
```
**Frontend muestra:** ✅ APROBADA (fondo verde) + Sin botón

### Paso 3: Crear Recepción
```javascript
// Frontend: Selector de órdenes
ordenes.filter(o => o.estado === 'aprobada')  // ← Solo estas se pueden seleccionar

POST /api/compras/recepciones
{
  ordenCompra: "68e02fb4...",
  lotes: [...]
}

// Backend valida:
const orden = await OrdenCompra.findById(ordenCompra);
if (orden.estado !== 'aprobada') throw Error('La orden debe estar aprobada');

// Respuesta: Recepción creada ✅
```
**Nota:** El backend debería actualizar la orden a estado `recibida` después de crear la recepción.

## Testing

### Test 1: Aprobar Orden en Borrador ✅
```
1. Crear orden → Estado: "borrador"
2. Frontend muestra: 📝 BORRADOR + botón "Aprobar"
3. Click "Aprobar"
4. Backend cambia estado → "aprobada"
5. Frontend actualiza: ✅ APROBADA (sin botón)
```

### Test 2: Intentar Aprobar Orden Ya Aprobada ❌
```
1. Orden ya está en estado "aprobada"
2. Frontend NO muestra botón "Aprobar" (correcto)
3. Si manualmente se llama al endpoint:
   → Backend rechaza: "Solo borrador puede aprobarse"
```

### Test 3: Selector de Recepciones
```
Órdenes en BD:
- OC-001: estado "borrador"    → NO aparece en selector
- OC-002: estado "aprobada"    → SÍ aparece con ✅
- OC-003: estado "recibida"    → NO aparece (o deshabilitada)
- OC-004: estado "cancelada"   → NO aparece (o deshabilitada)

Selector muestra:
[Seleccionar orden aprobada]
✅ OC-002 - Proveedor X - arabica, robusta
───────────────────────────
⏳ No Disponibles
  📝 OC-001 - Proveedor Y - borrador
  📦 OC-003 - Proveedor Z - recibida
  ❌ OC-004 - Proveedor W - cancelada
```

## Cambios en Archivos

### `Frontend/src/ComprasPanel.jsx`

#### Líneas 307-360 (aprox): Render de Órdenes
```javascript
// ANTES
backgroundColor: oc.aprobada ? '#e8f5e9' : '#fff3e0'

// DESPUÉS
const esAprobada = oc.estado === 'aprobada';
const esBorrador = oc.estado === 'borrador';
// ... lógica para 4 estados
```

#### Líneas 605-635 (aprox): Selector de Recepciones
```javascript
// ANTES
ordenes.filter(o => o.aprobada)

// DESPUÉS
ordenes.filter(o => o.estado === 'aprobada')
```

## Mejora Futura Recomendada

### Backend: Auto-actualizar estado a "recibida"
```javascript
// En recepcionController.js
crear: async (req, res) => {
  // ... crear recepción
  
  // ✅ Actualizar estado de la orden
  await OrdenCompra.findByIdAndUpdate(
    ordenCompra,
    { 
      estado: 'recibida',
      fechaRecepcion: new Date()
    }
  );
}
```

## Estado Final
✅ **CORREGIDO Y FUNCIONAL**

- Frontend ahora usa `oc.estado` correctamente
- Los 4 estados se muestran con colores e iconos distintos
- Botón "Aprobar" solo visible en estado `borrador`
- Selector de recepciones filtrado por estado `aprobada`
- Validaciones del backend ahora pasan correctamente

---
**Fecha:** 2025-10-18
**Tipo:** Bug Fix (Critical)
**Impacto:** Alto - Desbloqueó aprobación de órdenes
**Root Cause:** Desajuste frontend/backend en campo de estado
**Tiempo:** ~15 minutos
