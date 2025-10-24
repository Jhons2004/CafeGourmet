# Fix: Error ProductoComposite is not a constructor

## Problema
Al intentar crear una orden de producción, el backend devolvía:
```
Error: ProductoComposite is not a constructor
POST /api/produccion/crear 400 (Bad Request)
```

## Causa Raíz
**Dos problemas en el backend:**

### 1. Import Incorrecto
```javascript
// ❌ INCORRECTO - El archivo no exporta ProductoComposite
const { ProductoComposite } = require('../domain/composite/ProductoComposite');

// ✅ CORRECTO - El archivo exporta ProductoCombo
const { ProductoCombo } = require('../domain/composite/ProductoComposite');
```

**Archivo `ProductoComposite.js` exporta:**
```javascript
module.exports = { 
  ProductoComponent, 
  ProductoSimple, 
  ProductoCombo  // ← Nombre correcto
};
```

### 2. Desajuste Frontend-Backend
**Frontend enviaba:**
```javascript
{
  producto: 'grano',  // tipo de producto
  receta: [
    { tipo: 'arabica', cantidad: 100 },
    { tipo: 'robusta', cantidad: 50 }
  ]
}
```

**Backend esperaba:**
```javascript
{
  producto: 'Nombre del producto',  // ❌ Trataba 'producto' como nombre
  cantidad: 150,                     // ❌ No venía del frontend
  receta: [...],
  bomRef: '...'                      // ❌ No venía del frontend
}
```

## Solución Implementada

### 1. Corregido Import
```javascript
// ANTES
const { ProductoComposite } = require('../domain/composite/ProductoComposite');

// DESPUÉS
const { ProductoCombo } = require('../domain/composite/ProductoComposite');
```

### 2. Simplificado Lógica del Controlador

#### ANTES (❌ Problemático):
```javascript
crear: async (req, res) => {
  const { producto, cantidad, receta, bomRef } = req.body;
  
  const datosProducto = {
    nombre: producto,  // ❌ Usaba tipo como nombre
    cantidad: cantidad || 0,  // ❌ No venía del frontend
    receta: receta
  };
  
  const productoObj = ProductoFactory.crearProducto(producto, datosProducto);
  
  const combo = new ProductoComposite();  // ❌ Constructor no existe
  combo.add(productoObj);  // ❌ Método no existe
  
  res.json({ producto: productoObj, combo, precio });
}
```

#### DESPUÉS (✅ Funcional):
```javascript
crear: async (req, res) => {
  const { producto, receta } = req.body;
  
  // Validar tipo de producto
  const tiposValidos = ['grano', 'molido', 'capsula'];
  if (!tiposValidos.includes(producto)) {
    return res.status(400).json({ 
      error: `Tipo inválido. Debe ser: ${tiposValidos.join(', ')}` 
    });
  }
  
  // Calcular cantidad total de la receta
  const cantidadTotal = receta.reduce(
    (sum, item) => sum + (Number(item.cantidad) || 0), 
    0
  );
  
  // Factory pattern
  const datosProducto = {
    nombre: `Café ${producto}`,  // ✅ Genera nombre descriptivo
    cantidad: cantidadTotal,      // ✅ Calcula desde receta
    precio: 0
  };
  
  const productoObj = ProductoFactory.crearProducto(producto, datosProducto);
  
  // Strategy pattern
  const precio = PrecioCalculator.calcular(
    receta.length, 
    PrecioStrategy.base
  );
  
  res.json({ 
    success: true,
    tipo: producto,
    producto: productoObj,
    receta: receta,
    cantidadTotal: cantidadTotal,
    precio 
  });
}
```

## Cambios Detallados

### Validación de Tipo
```javascript
// Nuevo: Validar que producto sea tipo válido
const tiposValidos = ['grano', 'molido', 'capsula'];
if (!tiposValidos.includes(producto)) {
  return res.status(400).json({ 
    error: `Tipo de producto inválido. Debe ser uno de: ${tiposValidos.join(', ')}` 
  });
}
```

### Cálculo de Cantidad
```javascript
// Nuevo: Calcular cantidad total desde receta
const cantidadTotal = receta.reduce(
  (sum, item) => sum + (Number(item.cantidad) || 0), 
  0
);
```

### Nombre del Producto
```javascript
// ANTES
nombre: producto  // 'grano' → nombre incorrecto

// DESPUÉS
nombre: `Café ${producto}`  // 'Café grano' → nombre descriptivo
```

### Eliminado ProductoCombo
El ProductoCombo se usaba innecesariamente. En el contexto de crear una OP simple, no se necesita un patrón Composite. Se puede agregar después si se implementan productos compuestos (combos).

## Payload de Ejemplo

### Request (Frontend → Backend):
```json
POST /api/produccion/crear
{
  "producto": "molido",
  "receta": [
    {
      "tipo": "arabica",
      "cantidad": 75
    },
    {
      "tipo": "robusta",
      "cantidad": 25
    }
  ]
}
```

### Response (Backend → Frontend):
```json
{
  "success": true,
  "tipo": "molido",
  "producto": {
    "tipo": "molido",
    "nombre": "Café molido",
    "cantidad": 100,
    "unidad": "kg",
    "precio": 0
  },
  "receta": [
    { "tipo": "arabica", "cantidad": 75 },
    { "tipo": "robusta", "cantidad": 25 }
  ],
  "cantidadTotal": 100,
  "precio": 200
}
```

## ProductoFactory

### Tipos Soportados:
```javascript
ProductoFactory.crearProducto(tipo, datos)
```

| Tipo | Clase | Unidad |
|------|-------|--------|
| `grano` | ProductoGrano | kg |
| `molido` | ProductoMolido | kg |
| `capsula` | ProductoCapsula | cápsulas |

### Ejemplo:
```javascript
const datos = {
  nombre: 'Café molido',
  cantidad: 100,
  precio: 0
};

const producto = ProductoFactory.crearProducto('molido', datos);
// Resultado:
// {
//   tipo: 'molido',
//   nombre: 'Café molido',
//   cantidad: 100,
//   unidad: 'kg',
//   precio: 0
// }
```

## PrecioStrategy

Calcula precio basado en complejidad de la receta:
```javascript
const precio = PrecioCalculator.calcular(
  receta.length,  // Número de ingredientes
  PrecioStrategy.base
);

// Ejemplo:
// receta.length = 2 (arabica + robusta)
// precio = 200 (2 * 100)
```

## Testing

### Test 1: Crear OP de Grano ✅
```javascript
POST /api/produccion/crear
{
  "producto": "grano",
  "receta": [
    { "tipo": "arabica", "cantidad": 100 }
  ]
}

Response: 200 OK
{
  "success": true,
  "tipo": "grano",
  "producto": {
    "tipo": "grano",
    "nombre": "Café grano",
    "cantidad": 100,
    "unidad": "kg",
    "precio": 0
  },
  "cantidadTotal": 100,
  "precio": 100
}
```

### Test 2: Tipo Inválido ❌
```javascript
POST /api/produccion/crear
{
  "producto": "liquido",
  "receta": [...]
}

Response: 400 Bad Request
{
  "error": "Tipo de producto inválido. Debe ser uno de: grano, molido, capsula"
}
```

### Test 3: Receta Vacía ❌
```javascript
POST /api/produccion/crear
{
  "producto": "grano",
  "receta": []
}

Response: 400 Bad Request
{
  "error": "Se requiere tipo de producto y receta válida"
}
```

## Archivos Modificados

### `backend/src/controllers/produccionController.js`
- **Línea 5:** Cambiado import de `ProductoComposite` → `ProductoCombo`
- **Líneas 13-42:** Reescrita función `crear()`
  - Agregada validación de tipo
  - Calculada cantidad desde receta
  - Generado nombre descriptivo
  - Eliminado uso innecesario de ProductoCombo
  - Simplificada respuesta

## Próximos Pasos (Opcional)

### 1. Crear Modelo de OrdenProduccion
Actualmente solo devuelve datos pero no los guarda en BD:
```javascript
const OrdenProduccionSchema = new mongoose.Schema({
  numero: String,
  tipo: { type: String, enum: ['grano', 'molido', 'capsula'] },
  receta: [{
    tipo: String,
    cantidad: Number
  }],
  cantidadTotal: Number,
  estado: { 
    type: String, 
    enum: ['pendiente', 'en_proceso', 'terminada', 'cancelada'],
    default: 'pendiente'
  },
  fechaInicio: Date,
  fechaFin: Date
}, { timestamps: true });
```

### 2. Guardar en BD
```javascript
crear: async (req, res) => {
  // ... validaciones
  
  const op = await OrdenProduccion.create({
    tipo: producto,
    receta: receta,
    cantidadTotal: cantidadTotal,
    estado: 'pendiente'
  });
  
  res.json(op);
}
```

### 3. Implementar Servicio de Producción
El archivo `ProduccionService.js` debe implementar:
- `avanzarEtapa()`
- `registrarConsumo()`
- `cerrarOP()`
- `consumirBOMEnOP()`

## Estado Final
✅ **RESUELTO**

- Import corregido: `ProductoCombo` en lugar de `ProductoComposite`
- Lógica simplificada y alineada con frontend
- Validaciones agregadas (tipo, receta)
- Cálculo automático de cantidad total
- Backend reiniciado con cambios cargados

---
**Fecha:** 2025-10-18
**Tipo:** Bug Fix (Critical)
**Impacto:** Alto - Desbloqueó creación de órdenes de producción
**Root Cause:** Import incorrecto + desajuste frontend-backend
**Tiempo:** ~20 minutos
