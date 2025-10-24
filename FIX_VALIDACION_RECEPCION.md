# Fix: Error de Validación en Recepciones

## Problema
Al intentar crear una recepción, el backend devolvía:
```
API Error [/api/compras/recepciones]: Error: Validación falló
POST http://192.168.56.1:5173/api/compras/recepciones 400 (Bad Request)
```

## Causa Raíz
El frontend solo enviaba `tipo` y `cantidad` para cada lote, pero el validador del backend (`validators/compras.js`) requiere:

**Campos Requeridos:**
- `tipo` ✅
- `cantidad` ✅
- `costoUnitario` ❌ (faltaba)
- `lote` ❌ (faltaba - número de lote)

**Campos Opcionales:**
- `fechaCosecha`
- `humedad`

## Solución Implementada

### 1. Estado Inicial Actualizado
```javascript
// ANTES
lotes: [{ tipo: 'arabica', cantidad: '' }]

// DESPUÉS
lotes: [{ tipo: 'arabica', cantidad: '', costoUnitario: '', lote: '', fechaCosecha: '', humedad: '' }]
```

### 2. Función handleOrdenChange Mejorada
Ahora pre-llena el `costoUnitario` con el `precioUnitario` de la orden:
```javascript
lotes: orden.items.map(item => ({
  tipo: item.tipo,
  cantidad: item.cantidad || '',
  costoUnitario: item.precioUnitario || '', // ✅ Nuevo
  lote: '', // Usuario debe ingresar
  fechaCosecha: '',
  humedad: ''
}))
```

### 3. Función handleCrearRecepcion Completa
Ahora envía todos los campos requeridos:
```javascript
lotes: newRecepcion.lotes.map(l => ({
  tipo: l.tipo,
  cantidad: Number(l.cantidad),
  costoUnitario: Number(l.costoUnitario), // ✅ Nuevo
  lote: l.lote, // ✅ Nuevo
  fechaCosecha: l.fechaCosecha || undefined, // ✅ Nuevo (opcional)
  humedad: l.humedad ? Number(l.humedad) : undefined // ✅ Nuevo (opcional)
}))
```

### 4. Formulario HTML Expandido
Nuevo diseño con 3 filas de campos por lote:

**Fila 1:** Tipo + Cantidad (con validación visual)
**Fila 2:** Costo Unitario + Número de Lote (ambos requeridos)
**Fila 3:** Fecha Cosecha + Humedad (opcionales)

#### Características del Formulario:
- ✅ Campos requeridos marcados con asterisco (*)
- ✅ Labels descriptivos con unidades
- ✅ Placeholders informativos
- ✅ Pre-llenado automático de `cantidad` y `costoUnitario` desde orden
- ✅ Validación visual si cantidad excede lo ordenado
- ✅ Diseño en grid responsive
- ✅ Cards individuales por lote con bordes
- ✅ Numeración de lotes (#1, #2, etc.)

### 5. Función agregarLoteRecepcion
```javascript
// ANTES
{ tipo: 'arabica', cantidad: '' }

// DESPUÉS
{ tipo: 'arabica', cantidad: '', costoUnitario: '', lote: '', fechaCosecha: '', humedad: '' }
```

## Validación Backend (Recordatorio)
Según `validators/compras.js`:

```javascript
exports.recepcion = {
  crear: Joi.object({
    ordenCompra: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    lotes: Joi.array().min(1).items(Joi.object({
      tipo: Joi.string().valid('arabica','robusta','blend').required(),
      cantidad: Joi.number().positive().required(),
      costoUnitario: Joi.number().positive().required(), // ✅
      lote: Joi.string().min(1).required(), // ✅
      fechaCosecha: Joi.date().optional(), // ✅
      humedad: Joi.number().min(0).max(100).optional() // ✅
    })).required(),
    observaciones: Joi.string().allow('', null)
  })
};
```

## Flujo de Trabajo Actualizado

1. **Usuario selecciona orden de compra** → 
2. **Sistema pre-llena lotes con:**
   - ✅ `tipo` (de orden)
   - ✅ `cantidad` (de orden)
   - ✅ `costoUnitario` (de precioUnitario de orden)
3. **Usuario completa:**
   - ✅ `lote` (número de lote - requerido)
   - ⚪ `fechaCosecha` (opcional)
   - ⚪ `humedad` (opcional)
4. **Sistema valida:**
   - ✅ Todos los campos requeridos presentes
   - ✅ Tipos de dato correctos
   - ✅ Advertencia visual si cantidad > ordenada
5. **Backend acepta la recepción** ✅

## Ejemplo de Payload Correcto

```json
{
  "ordenCompra": "507f1f77bcf86cd799439011",
  "lotes": [
    {
      "tipo": "arabica",
      "cantidad": 100,
      "costoUnitario": 15.50,
      "lote": "LOT-2025-001",
      "fechaCosecha": "2025-01-15",
      "humedad": 12.5
    },
    {
      "tipo": "robusta",
      "cantidad": 50,
      "costoUnitario": 12.00,
      "lote": "LOT-2025-002"
    }
  ],
  "observaciones": "Recepción sin problemas"
}
```

## Testing
1. ✅ Navegar a panel de Compras
2. ✅ Crear una orden de compra con al menos 1 item
3. ✅ Click en "➕ Nueva Recepción"
4. ✅ Seleccionar la orden creada
5. ✅ Verificar pre-llenado de tipo, cantidad y costo
6. ✅ Ingresar número de lote (requerido)
7. ✅ (Opcional) Ingresar fecha de cosecha y humedad
8. ✅ Guardar
9. ✅ Verificar que no hay error de validación
10. ✅ Verificar que la recepción aparece en la lista

## Archivos Modificados
- `Frontend/src/ComprasPanel.jsx` (líneas 54-650 aprox)
  - Estado `newRecepcion`
  - Función `handleOrdenChange`
  - Función `handleCrearRecepcion`
  - Función `agregarLoteRecepcion`
  - Formulario HTML de recepciones

## Estado
✅ **RESUELTO** - El frontend ahora envía todos los campos requeridos por el backend.

---
**Fecha:** 2025-10-18
**Impacto:** Crítico (bloqueaba creación de recepciones)
**Tiempo de resolución:** ~15 minutos
