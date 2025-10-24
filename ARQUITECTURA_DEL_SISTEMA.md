# 🏗️ Arquitectura del Sistema - Café Gourmet

**Versión:** 1.0.0  
**Fecha:** Octubre 25, 2025  
**Patrón Arquitectónico:** MVC + Arquitectura por Capas (3 Capas)

---

## 📋 Índice

1. [Patrón Arquitectónico Principal](#-1-patrón-arquitectónico-principal)
2. [Arquitectura por Capas](#-2-arquitectura-por-capas)
3. [Backend - Patrón MVC](#-3-backend---patrón-mvc)
4. [Frontend - Arquitectura de Componentes](#-4-frontend---arquitectura-de-componentes)
5. [Flujo de Datos Completo](#-5-flujo-de-datos-completo)
6. [Estructura de Directorios](#-6-estructura-de-directorios)

---

## 🎯 1. Patrón Arquitectónico Principal

### **Arquitectura Híbrida: MVC + Arquitectura por Capas**

El sistema Café Gourmet implementa una **arquitectura híbrida** que combina:

1. **Arquitectura por Capas (Layered Architecture)** → Separación en 3 capas
2. **Patrón MVC (Modelo-Vista-Controlador)** → En el backend
3. **Arquitectura de Componentes** → En el frontend (React)

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA GENERAL                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         CAPA 1: PRESENTACIÓN (Frontend)            │   │
│  │              React 18 + Vite                        │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Vistas (Views)                              │  │   │
│  │  │  - 10 Paneles principales                    │  │   │
│  │  │  - Componentes reutilizables                 │  │   │
│  │  │  - App.jsx (Orquestador principal)           │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Capa de Comunicación                        │  │   │
│  │  │  - apiFacade.js (859 líneas)                 │  │   │
│  │  │  - Patrón Facade                             │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↕                                 │
│                      HTTP REST API                           │
│                            ↕                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     CAPA 2: LÓGICA DE NEGOCIO (Backend)           │   │
│  │           Express 5.1.0 + Node.js                  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Controladores (Controllers)                 │  │   │
│  │  │  - Manejo de requests HTTP                   │  │   │
│  │  │  - Validación de inputs                      │  │   │
│  │  │  - Orquestación de servicios                 │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Servicios (Business Logic)                  │  │   │
│  │  │  - Lógica de negocio compleja                │  │   │
│  │  │  - Patrones de diseño                        │  │   │
│  │  │  - Algoritmos de costeo                      │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Rutas (Routes)                              │  │   │
│  │  │  - Definición de endpoints                   │  │   │
│  │  │  - Middleware de autenticación               │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                            ↕                                 │
│                        Mongoose ODM                          │
│                            ↕                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         CAPA 3: DATOS (Base de Datos)             │   │
│  │               MongoDB 8.18.0                       │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Modelos (Models)                            │  │   │
│  │  │  - 26 Esquemas de datos                      │  │   │
│  │  │  - Validaciones de BD                        │  │   │
│  │  │  - Relaciones entre entidades                │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Colecciones MongoDB                         │  │   │
│  │  │  - Documentos JSON                           │  │   │
│  │  │  - Índices optimizados                       │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔷 2. Arquitectura por Capas

### **Capa 1: Presentación (Frontend)**

**Ubicación:** `Frontend/src/`

**Responsabilidades:**
- Renderizar la interfaz de usuario
- Capturar interacciones del usuario
- Comunicarse con el backend vía API REST
- Gestionar estado local de la UI

**Tecnologías:**
- React 18.3.1
- Vite 7.1.3 (build tool)
- CSS3 con variables CSS
- apiFacade.js (Patrón Facade)

**Componentes Principales:**
```
Frontend/src/
├── App.jsx (3,103 líneas)          → Componente raíz, routing, autenticación
├── apiFacade.js (859 líneas)       → Facade para todas las APIs
├── Paneles:
│   ├── InventarioPanel.jsx
│   ├── ProduccionPanel.jsx (387 líneas)
│   ├── ComprasPanel.jsx (630+ líneas)
│   ├── VentasPanel.jsx (680+ líneas)
│   ├── CalidadPanel.jsx (550+ líneas)
│   ├── FinanzasPanel.jsx (450+ líneas)
│   ├── ReportesPanel.jsx
│   ├── panels/ConfigPanel.jsx (400+ líneas)
│   ├── panels/TrazabilidadPanel.jsx (315 líneas)
│   └── panels/StockProductosPanel.jsx (377 líneas)
├── themes.js                       → 16 paletas de colores
└── assets/                         → Imágenes, iconos
```

---

### **Capa 2: Lógica de Negocio (Backend)**

**Ubicación:** `Backend/src/`

**Responsabilidades:**
- Procesar peticiones HTTP
- Validar datos de entrada
- Ejecutar lógica de negocio
- Aplicar reglas de negocio
- Interactuar con la base de datos
- Implementar seguridad (autenticación, autorización)

**Tecnologías:**
- Node.js
- Express 5.1.0
- JWT (jsonwebtoken 9.0.2)
- Joi 18.0.1 (validaciones)
- Helmet 8.1.0 (seguridad)
- bcryptjs 3.0.2 (encriptación)

**Estructura MVC:**
```
Backend/src/
├── routes/                         → Definición de rutas (R de Routing)
├── controllers/                    → Controladores (C de Controller)
├── models/                         → Modelos (M de Model)
├── services/                       → Lógica de negocio
├── middleware/                     → Autenticación, autorización
├── validators/                     → Validaciones con Joi
├── domain/                         → Patrones de diseño
└── app.js                          → Configuración principal
```

---

### **Capa 3: Datos (Base de Datos)**

**Ubicación:** MongoDB (servidor externo)

**Responsabilidades:**
- Almacenar datos persistentes
- Garantizar integridad de datos
- Ejecutar consultas optimizadas
- Gestionar índices

**Tecnologías:**
- MongoDB 8.18.0
- Mongoose 8.18.0 (ODM)

**Esquemas Definidos:** 26 modelos

---

## 🎮 3. Backend - Patrón MVC

### **Modelo (Model) - Capa de Datos**

**Ubicación:** `Backend/src/models/`

**Responsabilidad:** Definir la estructura de datos y reglas de validación en la base de datos.

**26 Modelos Implementados:**

```javascript
Backend/src/models/
├── Usuario.js              → Usuarios del sistema (admin, it, rrhh, operador)
├── Grano.js                → Inventario de granos de café
├── Lote.js                 → Lotes de materias primas
├── Stock.js                → Stock por producto/bodega/ubicación
├── Bodega.js               → Bodegas/almacenes
├── Ubicacion.js            → Ubicaciones dentro de bodegas
├── MovimientoInventario.js → Movimientos de stock (entrada/salida)
├── ReservaStock.js         → Reservas de stock para pedidos
├── ConteoCiclico.js        → Conteos de inventario
├── OrdenProduccion.js      → Órdenes de producción
├── BOM.js                  → Bill of Materials (recetas)
├── Proveedor.js            → Proveedores de materias primas
├── OrdenCompra.js          → Órdenes de compra
├── RecepcionLote.js        → Recepciones de mercancía
├── Cliente.js              → Clientes
├── ProductoTerminado.js    → Productos terminados
├── PedidoVenta.js          → Pedidos de venta
├── Factura.js              → Facturas emitidas
├── StockProducto.js        → Stock de productos terminados
├── ControlCalidadRecepcion.js → QC en recepciones
├── ControlCalidadProceso.js   → QC en proceso
├── NoConformidad.js        → No conformidades de calidad
├── CuentaPorPagar.js       → Cuentas por pagar (CxP)
├── CuentaPorCobrar.js      → Cuentas por cobrar (CxC)
├── Config.js               → Configuración del sistema
└── Auditoria.js            → Log de auditoría
```

**Ejemplo de Modelo:**

```javascript
// Backend/src/models/OrdenProduccion.js
const mongoose = require('mongoose');

const ordenProduccionSchema = new mongoose.Schema({
  codigo: { 
    type: String, 
    unique: true, 
    required: true 
  },
  producto: { 
    type: String, 
    required: true 
  },
  receta: [{
    tipo: String,
    cantidad: Number
  }],
  estado: {
    type: String,
    enum: ['pendiente', 'proceso', 'completada', 'cancelada'],
    default: 'pendiente'
  },
  etapas: [{
    nombre: String,
    estado: String,
    fechaInicio: Date,
    fechaFin: Date
  }],
  consumos: [{
    tipo: String,
    cantidad: Number,
    fecha: Date
  }],
  merma: Number,
  fechaCierre: Date
}, { timestamps: true });

module.exports = mongoose.model('OrdenProduccion', ordenProduccionSchema);
```

---

### **Controlador (Controller) - Lógica de Aplicación**

**Ubicación:** `Backend/src/controllers/`

**Responsabilidad:** Manejar las peticiones HTTP, validar inputs, llamar a servicios y retornar respuestas.

**Controladores Implementados:**

```javascript
Backend/src/controllers/
├── inventario/
│   └── inventarioController.js     → CRUD de inventario
├── produccionController.js         → Gestión de OPs
├── comprasController.js            → Proveedores, OC, recepciones
├── proveedorController.js          → CRUD de proveedores
├── ordenCompraController.js        → Gestión de OC
├── recepcionController.js          → Recepciones de mercancía
├── ventas/
│   ├── clientesController.js       → CRUD de clientes
│   ├── productosController.js      → CRUD de productos
│   ├── pedidosController.js        → Gestión de pedidos
│   └── facturasController.js       → Emisión de facturas
├── calidad/
│   ├── qcRecepcionController.js    → QC en recepciones
│   ├── qcProcesoController.js      → QC en proceso
│   └── ncController.js             → No conformidades
├── finanzas/
│   ├── cxpController.js            → Cuentas por pagar
│   ├── cxcController.js            → Cuentas por cobrar
│   └── tcController.js             → Tipo de cambio
├── reportesController.js           → Reportes y KPIs
├── trazabilidadController.js       → Trazabilidad por lote/OP
├── usuarioController.js            → Gestión de usuarios
└── dashboardController.js          → Dashboard principal
```

**Ejemplo de Controlador:**

```javascript
// Backend/src/controllers/produccionController.js
const OrdenProduccion = require('../models/OrdenProduccion');
const Grano = require('../models/Grano');

exports.crearOP = async (req, res) => {
  try {
    const { producto, receta } = req.body;
    
    // 1. Validar disponibilidad de stock
    for (const item of receta) {
      const grano = await Grano.findOne({ tipo: item.tipo });
      if (!grano || grano.cantidad < item.cantidad) {
        return res.status(400).json({ 
          error: `Stock insuficiente de ${item.tipo}` 
        });
      }
    }
    
    // 2. Generar código único
    const codigo = `OP-${Date.now()}`;
    
    // 3. Crear orden de producción
    const op = new OrdenProduccion({
      codigo,
      producto,
      receta,
      estado: 'pendiente',
      etapas: [
        { nombre: 'Tostado', estado: 'pendiente' },
        { nombre: 'Molido', estado: 'pendiente' },
        { nombre: 'Empaque', estado: 'pendiente' }
      ]
    });
    
    await op.save();
    
    res.status(201).json(op);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listarOPs = async (req, res) => {
  try {
    const ops = await OrdenProduccion.find()
      .sort({ createdAt: -1 });
    res.json(ops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ... más métodos
```

---

### **Vista (View) - Rutas y Endpoints**

**Ubicación:** `Backend/src/routes/`

**Responsabilidad:** Definir las rutas HTTP y asociarlas con controladores. Aplicar middleware de autenticación/autorización.

**Rutas Implementadas:**

```javascript
Backend/src/routes/
├── inventario.js           → /api/inventario/*
├── produccion.js           → /api/produccion/*
├── compras.js              → /api/compras/*
├── ventas.js               → /api/ventas/*
├── calidad.js              → /api/calidad/*
├── finanzas.js             → /api/finanzas/*
├── reportes.js             → /api/reportes/*
├── trazabilidad.js         → /api/trazabilidad/*
└── usuario.js              → /api/usuario/*
```

**Ejemplo de Ruta:**

```javascript
// Backend/src/routes/produccion.js
const express = require('express');
const router = express.Router();
const produccionController = require('../controllers/produccionController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Middleware de autenticación para todas las rutas
router.use(requireAuth);

// Rutas públicas (requieren solo autenticación)
router.get('/', produccionController.listarOPs);
router.post('/crear', produccionController.crearOP);

// Rutas protegidas (requieren rol específico)
router.post('/:id/etapa', 
  requireRole(['admin', 'operador']), 
  produccionController.avanzarEtapa
);

router.post('/:id/cerrar', 
  requireRole(['admin']), 
  produccionController.cerrarOP
);

module.exports = router;
```

**Integración en app.js:**

```javascript
// Backend/src/app.js
const produccionRoutes = require('./routes/produccion');

app.use('/api/produccion', produccionRoutes);
```

---

### **Componentes Adicionales del Backend**

#### **Middleware**

**Ubicación:** `Backend/src/middleware/`

```javascript
middleware/
├── auth.js                 → requireAuth, requireRole
└── validate.js             → Validación de datos con Joi
```

**Ejemplo:**

```javascript
// Backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Sin permisos' });
    }
    next();
  };
};
```

#### **Validadores**

**Ubicación:** `Backend/src/validators/`

```javascript
validators/
├── produccion.js
├── compras.js
├── ventas.js
└── usuario.js
```

**Ejemplo:**

```javascript
// Backend/src/validators/produccion.js
const Joi = require('joi');

exports.crearOPSchema = Joi.object({
  producto: Joi.string().min(3).required(),
  receta: Joi.array().items(
    Joi.object({
      tipo: Joi.string().valid('arabica', 'robusta', 'blend').required(),
      cantidad: Joi.number().min(0).required()
    })
  ).min(1).required()
});
```

#### **Servicios**

**Ubicación:** `Backend/src/services/`

**Lógica de negocio compleja:**

```javascript
services/
├── inventoryCostingService.js  → Algoritmos FIFO, FEFO, Promedio
├── GestorDeInventario.js       → Singleton para inventario
├── ProduccionService.js        → Lógica de producción
└── StockProductoService.js     → Gestión de stock PT
```

---

## 🖥️ 4. Frontend - Arquitectura de Componentes

### **Patrón: Component-Based Architecture**

**Ubicación:** `Frontend/src/`

El frontend sigue una **arquitectura basada en componentes** con React, donde cada panel es un componente independiente.

### **Estructura de Componentes**

```
Frontend/src/
│
├── App.jsx (3,103 líneas)          → COMPONENTE RAÍZ
│   ├── Estado global (user, token, tema)
│   ├── Sistema de routing
│   ├── Autenticación y autorización
│   ├── Sidebar de navegación
│   └── Renderizado condicional de paneles
│
├── apiFacade.js (859 líneas)       → FACADE DE COMUNICACIÓN
│   ├── Manejo automático de tokens
│   ├── Headers de autenticación
│   ├── Manejo de errores 401/403
│   └── Métodos para 10 módulos
│
├── PANELES (Componentes principales)
│   │
│   ├── InventarioPanel.jsx
│   │   ├── Estado: granos[]
│   │   ├── CRUD de granos
│   │   └── Modal de registro
│   │
│   ├── ProduccionPanel.jsx (387 líneas)
│   │   ├── Estado: ops[], etapas[]
│   │   ├── Crear OPs
│   │   ├── Avanzar etapas
│   │   ├── Registrar consumo
│   │   └── Cerrar OPs
│   │
│   ├── ComprasPanel.jsx (630+ líneas)
│   │   ├── 3 Modales:
│   │   │   ├── Proveedores
│   │   │   ├── Órdenes de Compra
│   │   │   └── Recepciones
│   │   └── Integración con apiFacade.compras
│   │
│   ├── VentasPanel.jsx (680+ líneas)
│   │   ├── 4 Modales:
│   │   │   ├── Clientes
│   │   │   ├── Productos
│   │   │   ├── Pedidos
│   │   │   └── Facturas
│   │   └── Cálculo automático de IGV
│   │
│   ├── CalidadPanel.jsx (550+ líneas)
│   │   ├── 3 Modales:
│   │   │   ├── QC Recepciones
│   │   │   ├── QC Proceso
│   │   │   └── No Conformidades
│   │   └── Sistema de métricas (0-10)
│   │
│   ├── FinanzasPanel.jsx (450+ líneas)
│   │   ├── Transacciones (ingresos/egresos)
│   │   ├── Presupuestos
│   │   └── Balance financiero
│   │
│   ├── ReportesPanel.jsx
│   │   ├── Dashboard con KPIs
│   │   ├── Gráficos de tendencias
│   │   └── Reportes por módulo
│   │
│   └── panels/
│       ├── ConfigPanel.jsx (400+ líneas)
│       │   ├── Gestión de usuarios
│       │   ├── Preferencias (temas, bordes, logo)
│       │   └── Cambio de contraseña
│       │
│       ├── TrazabilidadPanel.jsx (315 líneas)
│       │   ├── Búsqueda por lote/OP
│       │   ├── Timeline visual
│       │   └── Color-coding por evento
│       │
│       ├── StockProductosPanel.jsx (377 líneas)
│       │   ├── Dashboard con 4 KPIs
│       │   ├── Tabla de inventario
│       │   └── Modal de movimientos
│       │
│       └── ObservabilidadPanel.jsx
│           └── Monitoreo del sistema
│
├── themes.js                       → 16 PALETAS DE COLORES
│   ├── Light: Espresso, Cappuccino, Latte, Mocha, etc.
│   └── Dark: Midnight, Carbon, Obsidian, etc.
│
└── assets/                         → RECURSOS ESTÁTICOS
    ├── images/
    └── icons/
```

### **Flujo de Comunicación en Frontend**

```
Usuario interactúa
        ↓
Componente (Panel)
        ↓
apiFacade.js (Facade)
        ↓
Fetch API (HTTP Request)
        ↓
Backend (Express)
        ↓
Respuesta JSON
        ↓
apiFacade.js procesa
        ↓
Componente actualiza estado
        ↓
React re-renderiza UI
```

---

## 🔄 5. Flujo de Datos Completo

### **Ejemplo: Crear Orden de Producción**

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND - ProduccionPanel.jsx                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. Usuario llena formulario de OP                           │
│    - Producto: "Café Blend Premium"                         │
│    - Receta: [{tipo: 'arabica', cantidad: 60},              │
│               {tipo: 'robusta', cantidad: 40}]              │
│                                                               │
│ 2. Usuario hace clic en "Crear OP"                          │
│                                                               │
│ 3. Componente llama a apiFacade:                            │
│    const resultado = await apiFacade.produccion.crear({     │
│      producto: "Café Blend Premium",                        │
│      receta: [...]                                          │
│    })                                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    HTTP POST Request
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND - Routes (produccion.js)                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 4. Ruta recibe petición:                                    │
│    POST /api/produccion/crear                               │
│                                                               │
│ 5. Middleware de autenticación:                             │
│    - requireAuth() verifica token JWT                       │
│    - Extrae usuario del token                               │
│                                                               │
│ 6. Llama al controlador:                                    │
│    produccionController.crearOP(req, res)                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND - Controller (produccionController.js)              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 7. Validar datos con Joi                                    │
│                                                               │
│ 8. Verificar stock de materias primas:                      │
│    - Buscar granos en BD                                    │
│    - Comparar cantidad disponible vs requerida              │
│                                                               │
│ 9. Si stock suficiente:                                     │
│    - Generar código único: OP-20251025-001                  │
│    - Crear documento en BD                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND - Model (OrdenProduccion.js)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 10. Mongoose crea documento:                                │
│     {                                                        │
│       codigo: "OP-20251025-001",                            │
│       producto: "Café Blend Premium",                       │
│       receta: [...],                                        │
│       estado: "pendiente",                                  │
│       etapas: [                                             │
│         {nombre: "Tostado", estado: "pendiente"},          │
│         {nombre: "Molido", estado: "pendiente"},           │
│         {nombre: "Empaque", estado: "pendiente"}           │
│       ],                                                    │
│       createdAt: "2025-10-25T10:00:00Z"                    │
│     }                                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ MONGODB - Base de Datos                                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 11. Guardar en colección 'ordenproduccions'                │
│                                                               │
│ 12. Retornar documento guardado con _id                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↑
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND - Controller (produccionController.js)              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 13. Responder con JSON:                                     │
│     res.status(201).json(op)                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    HTTP Response 201
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND - apiFacade.js                                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 14. Procesar respuesta:                                     │
│     - Verificar status 201                                  │
│     - Parsear JSON                                          │
│     - Retornar al componente                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND - ProduccionPanel.jsx                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 15. Actualizar estado local:                                │
│     setOps([...ops, resultado])                             │
│                                                               │
│ 16. Cerrar modal                                            │
│                                                               │
│ 17. Mostrar notificación:                                   │
│     "OP creada exitosamente"                                │
│                                                               │
│ 18. React re-renderiza tabla de OPs                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 6. Estructura de Directorios Completa

### **Vista General**

```
CafeGourmet/
├── Frontend/                       → Capa de Presentación
│   ├── src/
│   │   ├── App.jsx                 → Componente raíz (3,103 líneas)
│   │   ├── apiFacade.js            → Facade de API (859 líneas)
│   │   ├── InventarioPanel.jsx
│   │   ├── ProduccionPanel.jsx
│   │   ├── ComprasPanel.jsx
│   │   ├── VentasPanel.jsx
│   │   ├── CalidadPanel.jsx
│   │   ├── FinanzasPanel.jsx
│   │   ├── ReportesPanel.jsx
│   │   ├── panels/
│   │   │   ├── ConfigPanel.jsx
│   │   │   ├── TrazabilidadPanel.jsx
│   │   │   ├── StockProductosPanel.jsx
│   │   │   └── ObservabilidadPanel.jsx
│   │   ├── themes.js               → 16 paletas de colores
│   │   └── assets/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── Backend/                        → Capa de Lógica + Datos
│   ├── src/
│   │   ├── app.js                  → Servidor Express
│   │   │
│   │   ├── routes/                 → RUTAS (MVC: View/Router)
│   │   │   ├── inventario.js
│   │   │   ├── produccion.js
│   │   │   ├── compras.js
│   │   │   ├── ventas.js
│   │   │   ├── calidad.js
│   │   │   ├── finanzas.js
│   │   │   ├── reportes.js
│   │   │   ├── trazabilidad.js
│   │   │   └── usuario.js
│   │   │
│   │   ├── controllers/            → CONTROLADORES (MVC: Controller)
│   │   │   ├── inventario/
│   │   │   │   └── inventarioController.js
│   │   │   ├── ventas/
│   │   │   │   ├── clientesController.js
│   │   │   │   ├── productosController.js
│   │   │   │   ├── pedidosController.js
│   │   │   │   └── facturasController.js
│   │   │   ├── calidad/
│   │   │   │   ├── qcRecepcionController.js
│   │   │   │   ├── qcProcesoController.js
│   │   │   │   └── ncController.js
│   │   │   ├── finanzas/
│   │   │   │   ├── cxpController.js
│   │   │   │   ├── cxcController.js
│   │   │   │   └── tcController.js
│   │   │   ├── produccionController.js
│   │   │   ├── comprasController.js
│   │   │   ├── reportesController.js
│   │   │   ├── trazabilidadController.js
│   │   │   └── usuarioController.js
│   │   │
│   │   ├── models/                 → MODELOS (MVC: Model)
│   │   │   ├── Usuario.js
│   │   │   ├── Grano.js
│   │   │   ├── Lote.js
│   │   │   ├── Stock.js
│   │   │   ├── Bodega.js
│   │   │   ├── Ubicacion.js
│   │   │   ├── MovimientoInventario.js
│   │   │   ├── ReservaStock.js
│   │   │   ├── ConteoCiclico.js
│   │   │   ├── OrdenProduccion.js
│   │   │   ├── BOM.js
│   │   │   ├── Proveedor.js
│   │   │   ├── OrdenCompra.js
│   │   │   ├── RecepcionLote.js
│   │   │   ├── Cliente.js
│   │   │   ├── ProductoTerminado.js
│   │   │   ├── PedidoVenta.js
│   │   │   ├── Factura.js
│   │   │   ├── StockProducto.js
│   │   │   ├── ControlCalidadRecepcion.js
│   │   │   ├── ControlCalidadProceso.js
│   │   │   ├── NoConformidad.js
│   │   │   ├── CuentaPorPagar.js
│   │   │   ├── CuentaPorCobrar.js
│   │   │   ├── Config.js
│   │   │   └── Auditoria.js
│   │   │
│   │   ├── services/               → SERVICIOS (Lógica de Negocio)
│   │   │   ├── inventoryCostingService.js
│   │   │   ├── GestorDeInventario.js
│   │   │   ├── ProduccionService.js
│   │   │   └── StockProductoService.js
│   │   │
│   │   ├── middleware/             → MIDDLEWARE
│   │   │   ├── auth.js
│   │   │   └── validate.js
│   │   │
│   │   ├── validators/             → VALIDADORES (Joi)
│   │   │   ├── produccion.js
│   │   │   ├── compras.js
│   │   │   ├── ventas.js
│   │   │   ├── calidad.js
│   │   │   ├── finanzas.js
│   │   │   └── usuario.js
│   │   │
│   │   ├── domain/                 → PATRONES DE DISEÑO
│   │   │   ├── facade/
│   │   │   │   └── SistemaCafeFacade.js
│   │   │   ├── strategy/
│   │   │   │   └── PrecioStrategy.js
│   │   │   ├── composite/
│   │   │   │   └── ProductoComposite.js
│   │   │   ├── productos/
│   │   │   │   └── ProductoFactory.js
│   │   │   └── proveedores/
│   │   │       └── ProveedorAdapter.js
│   │   │
│   │   ├── commands/               → PATRÓN COMMAND
│   │   │   ├── ProduccionCommands.js
│   │   │   └── InventarioCommands.js
│   │   │
│   │   ├── observers/              → PATRÓN OBSERVER
│   │   │   ├── ProduccionObserver.js
│   │   │   └── ComprasObserver.js
│   │   │
│   │   ├── permissions/            → RBAC
│   │   │   └── policies.js
│   │   │
│   │   ├── jobs/                   → TAREAS PROGRAMADAS
│   │   │   └── lotesJob.js
│   │   │
│   │   └── uploads/                → ARCHIVOS SUBIDOS
│   │       └── invoices/
│   │
│   ├── .env                        → Variables de entorno
│   └── package.json
│
└── Documentación/
    ├── HISTORIAL_DESARROLLO.md     → Historial de sprints
    ├── FUNCIONALIDADES_Y_FLUJOS.md → Flujos operativos
    ├── PATRONES_DE_DISEÑO.md       → Patrones implementados
    └── ARQUITECTURA_DEL_SISTEMA.md → Este documento
```

---

## 📊 Resumen de Arquitectura

| Aspecto | Detalle |
|---------|---------|
| **Patrón Principal** | MVC + Arquitectura por Capas (3 capas) |
| **Frontend** | Arquitectura de Componentes (React) |
| **Backend** | MVC (Modelo-Vista-Controlador) |
| **Base de Datos** | MongoDB (NoSQL, orientada a documentos) |
| **Comunicación** | REST API (JSON) |
| **Autenticación** | JWT (JSON Web Tokens) |
| **Seguridad** | Helmet, CORS, Rate Limiting, bcrypt |
| **Validación** | Joi (backend), validación en formularios (frontend) |
| **Patrones Adicionales** | Singleton, Factory, Strategy, Facade, Composite, Command, Observer |

---

## 🎯 Ventajas de esta Arquitectura

### ✅ **Separación de Responsabilidades**
- Frontend maneja solo UI
- Backend maneja solo lógica de negocio
- Base de datos maneja solo persistencia

### ✅ **Escalabilidad**
- Cada capa puede escalar independientemente
- Frontend puede ser CDN
- Backend puede tener múltiples instancias
- MongoDB puede usar sharding

### ✅ **Mantenibilidad**
- Código organizado por responsabilidad
- Fácil localizar y corregir bugs
- Cambios en una capa no afectan otras

### ✅ **Testabilidad**
- Cada componente puede testearse aisladamente
- Mocks fáciles de implementar
- Unit tests, integration tests, E2E tests

### ✅ **Reutilización**
- Componentes React reutilizables
- Servicios compartidos
- Modelos bien definidos

### ✅ **Seguridad**
- JWT para autenticación stateless
- RBAC (Role-Based Access Control)
- Validaciones en múltiples capas
- Encriptación de contraseñas

---

## 📝 Conclusión

El **Sistema Café Gourmet** implementa una arquitectura híbrida robusta que combina:

1. ✅ **Arquitectura por Capas** (3 capas: Presentación, Lógica, Datos)
2. ✅ **Patrón MVC** en el backend (26 Modelos, 15+ Controladores, 9 Rutas)
3. ✅ **Arquitectura de Componentes** en el frontend (10 paneles principales)
4. ✅ **11 Patrones de Diseño** adicionales
5. ✅ **REST API** para comunicación
6. ✅ **JWT** para autenticación segura

**Total:**
- **~25,000 líneas de código**
- **3 capas bien definidas**
- **26 modelos de datos**
- **100+ endpoints REST**
- **10 módulos funcionales**

**Estado:** ✅ Arquitectura sólida, escalable y mantenible

---

**Desarrollado con 🏗️ y arquitectura limpia**
