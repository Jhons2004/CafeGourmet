# Feature: Aprobación de Órdenes de Compra

## Problema Resuelto
Al intentar crear una recepción, el backend rechazaba con:
```
Error: La orden de compra debe estar aprobada
```

## Causa
El backend implementa una regla de negocio: **solo se pueden recepcionar órdenes de compra que hayan sido previamente aprobadas**. El frontend no tenía funcionalidad para aprobar órdenes.

## Solución Implementada

### 1. Función de Aprobación
```javascript
const handleAprobarOrden = async (ordenId) => {
  try {
    setLoading(true);
    await apiFacade.compras.ordenes.aprobar(ordenId, { aprobar: true });
    mostrarMensaje('Orden de compra aprobada exitosamente');
    cargarOrdenes();
  } catch (err) {
    mostrarMensaje(err.message || 'Error al aprobar orden', 'error');
  } finally {
    setLoading(false);
  }
};
```

### 2. Visualización Mejorada de Órdenes

#### Estados Visuales:
- **✅ APROBADA** - Badge verde, fondo verde claro (#e8f5e9)
- **⏳ PENDIENTE** - Badge naranja, fondo naranja claro (#fff3e0)

#### Botón de Aprobación:
- Visible solo en órdenes pendientes
- Texto: "✓ Aprobar"
- Clase: `btn--success`
- Se oculta automáticamente después de aprobar

```jsx
<div style={{ backgroundColor: oc.aprobada ? '#e8f5e9' : '#fff3e0' }}>
  <span style={{ 
    backgroundColor: oc.aprobada ? '#4caf50' : '#ff9800',
    color: 'white'
  }}>
    {oc.aprobada ? '✅ APROBADA' : '⏳ PENDIENTE'}
  </span>
  
  {!oc.aprobada && (
    <button onClick={() => handleAprobarOrden(oc._id)}>
      ✓ Aprobar
    </button>
  )}
</div>
```

### 3. Modal de Recepción Mejorado

#### Filtrado Inteligente:
El selector de órdenes ahora muestra:
1. **Órdenes aprobadas** (seleccionables) - con ✅
2. **Órdenes pendientes** (deshabilitadas) - en un optgroup separado

```jsx
<select>
  <option value="">Seleccionar orden aprobada</option>
  
  {/* Solo órdenes aprobadas son seleccionables */}
  {ordenes.filter(o => o.aprobada).map(o => (
    <option key={o._id} value={o._id}>
      ✅ {proveedor} - {items}
    </option>
  ))}
  
  {/* Órdenes pendientes se muestran pero están deshabilitadas */}
  <optgroup label="⏳ Pendientes de Aprobación (No disponibles)">
    {ordenes.filter(o => !o.aprobada).map(o => (
      <option disabled>
        {proveedor} - Debe aprobarse primero
      </option>
    ))}
  </optgroup>
</select>
```

#### Advertencia Visual:
Si no hay órdenes aprobadas, se muestra un mensaje destacado:
```jsx
{ordenes.filter(o => o.aprobada).length === 0 && (
  <div style={{ background: '#fff3e0', color: '#f57c00' }}>
    ⚠️ No hay órdenes aprobadas. Primero debes aprobar una orden 
    de compra antes de crear una recepción.
  </div>
)}
```

## Flujo de Trabajo Actualizado

### Antes (❌ No funcionaba):
1. Crear orden de compra
2. ~~Intentar crear recepción~~ → ERROR: "orden debe estar aprobada"

### Ahora (✅ Funciona):
1. **Crear orden de compra** → Estado: ⏳ PENDIENTE (fondo naranja)
2. **Aprobar orden** (click botón "✓ Aprobar") → Estado: ✅ APROBADA (fondo verde)
3. **Crear recepción** → Selector muestra solo órdenes aprobadas
4. **Completar recepción** → ✅ Exitoso

## Modelo de Datos

### Orden de Compra (Backend):
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  proveedor: "507f...", // ObjectId o populated object
  items: [
    {
      tipo: "arabica",
      cantidad: 100,
      precioUnitario: 15.50
    }
  ],
  aprobada: false, // ← Campo clave
  createdAt: "2025-10-18T10:30:00.000Z"
}
```

### Payload de Aprobación:
```javascript
POST /api/compras/ordenes/:id/aprobar
{
  "aprobar": true
}
```

## Reglas de Negocio

### Backend (recepcionController.js):
```javascript
// Validación antes de crear recepción
const orden = await OrdenCompra.findById(ordenCompra);
if (!orden.aprobada) {
  throw new Error('La orden de compra debe estar aprobada');
}
```

### Frontend:
- ✅ Solo mostrar órdenes aprobadas en selector de recepciones
- ✅ Deshabilitar selector si no hay órdenes aprobadas
- ✅ Mostrar advertencia visual
- ✅ Indicadores visuales de estado (colores + badges)

## Permisos

Según `routes/compras.js`:
```javascript
router.post('/ordenes/:id/aprobar', 
  requireAuth, 
  requireRole('admin','it'), // ← Solo admin e IT pueden aprobar
  validate(v.ordenCompra.paramsId, 'params'),
  validate(v.ordenCompra.aprobar),
  ocCtrl.aprobar
);
```

**Nota:** Si el usuario no tiene rol `admin` o `it`, el backend rechazará la aprobación.

## Testing

### Caso 1: Flujo Completo Exitoso
1. ✅ Login como admin/it
2. ✅ Crear orden de compra → Aparece con badge ⏳ PENDIENTE
3. ✅ Click "✓ Aprobar" → Badge cambia a ✅ APROBADA, botón desaparece
4. ✅ Click "➕ Nueva Recepción" → Orden aparece en selector con ✅
5. ✅ Crear recepción → Exitoso

### Caso 2: Sin Órdenes Aprobadas
1. ✅ Crear orden pero NO aprobarla
2. ✅ Click "➕ Nueva Recepción"
3. ✅ Selector muestra mensaje: "No hay órdenes aprobadas"
4. ✅ Orden aparece en optgroup "Pendientes" (deshabilitada)
5. ✅ No se puede seleccionar

### Caso 3: Permisos Insuficientes
1. ✅ Login como operador (no admin/it)
2. ✅ Ver órdenes pendientes
3. ❌ Botón "Aprobar" presente pero el backend rechaza con 403 Forbidden
4. 💡 **Mejora futura:** Ocultar botón si usuario no tiene permisos

## Mejoras Visuales

### Colores del Sistema:
| Estado | Badge BG | Card BG | Color Texto |
|--------|----------|---------|-------------|
| Aprobada | #4caf50 (verde) | #e8f5e9 (verde claro) | white |
| Pendiente | #ff9800 (naranja) | #fff3e0 (naranja claro) | white |

### Iconografía:
- ✅ Aprobada
- ⏳ Pendiente
- ✓ Aprobar (botón)
- ⚠️ Advertencia

## API Endpoints Utilizados

```
GET  /api/compras/ordenes          → Listar (con campo aprobada)
POST /api/compras/ordenes/:id/aprobar → Aprobar orden
POST /api/compras/recepciones      → Crear recepción (requiere orden aprobada)
```

## Archivos Modificados

### `Frontend/src/ComprasPanel.jsx`
**Líneas modificadas:** ~300-350, 545-570

**Cambios:**
1. ✅ Agregada función `handleAprobarOrden()`
2. ✅ Actualizado render de órdenes con estados visuales
3. ✅ Agregado botón "Aprobar" condicional
4. ✅ Filtrado de selector en modal de recepción
5. ✅ Agregado mensaje de advertencia
6. ✅ Agregado optgroup para órdenes pendientes

## Estado Final
✅ **COMPLETO Y FUNCIONAL**

- Frontend muestra estados de aprobación
- Botón de aprobación operativo
- Selector de recepciones filtrado
- UX mejorada con indicadores visuales
- Mensajes claros para el usuario

---
**Fecha:** 2025-10-18
**Tipo:** Feature + Bug Fix
**Impacto:** Alto (desbloqueó funcionalidad de recepciones)
**Tiempo:** ~20 minutos
