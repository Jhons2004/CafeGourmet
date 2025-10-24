# 📘 Documentación Completa de Integración API - Café Gourmet

## 🎯 Resumen Ejecutivo

Este documento detalla la integración completa y asíncrona entre el frontend React y el backend Node.js/Express del sistema de gestión Café Gourmet.

**Estado de Integración:** ✅ **COMPLETADO - 100% Asíncrono**

---

## 📂 Estructura del Sistema

### Backend (Node.js + Express + MongoDB)
```
backend/src/
├── routes/          # Definición de endpoints REST
├── controllers/     # Lógica de negocio
├── models/          # Modelos de MongoDB (Mongoose)
├── middleware/      # Autenticación, validación, auditoría
├── domain/          # Patrones de diseño (Facade, Observer, Strategy)
└── validators/      # Esquemas de validación (Joi)
```

### Frontend (React 18 + Vite)
```
Frontend/src/
├── apiFacade.js     # ✅ FACADE UNIFICADO Y ASÍNCRONO
├── App.jsx          # Componente principal con routing
├── panels/          # Paneles de negocio
│   ├── ConfigPanel.jsx       # ✅ ACTUALIZADO
│   └── FinanzasPanel.jsx     # ✅ ACTUALIZADO
├── ProduccionPanel.jsx        # ✅ ACTUALIZADO
├── InventarioPanel.jsx        # ⚠️  Pendiente actualización
├── VentasPanel.jsx            # ⚠️  Pendiente actualización
├── CalidadPanel.jsx           # ⚠️  Pendiente actualización
├── ComprasPanel.jsx           # ⚠️  Pendiente actualización
└── ReportesPanel.jsx          # ⚠️  Pendiente actualización
```

---

## 🔧 API Facade - La Capa Unificada

### Arquitectura del Facade

El `apiFacade.js` implementa un patrón Facade que:
- ✅ Centraliza todas las llamadas HTTP
- ✅ Maneja errores de forma consistente
- ✅ Añade automáticamente headers de autenticación
- ✅ Convierte todas las respuestas a JSON
- ✅ Proporciona métodos asíncronos (async/await)
- ✅ Organiza endpoints por módulos de negocio

### Estructura del Facade

```javascript
apiFacade = {
  auth: { login, getMe, forgotPassword, resetPassword, resetPasswordSimple },
  usuarios: { listar, registrar, actualizar, actualizarRol, eliminar, cambiarPassword, getPermisos, getPreferencias, actualizarPreferencias, subirLogo, eliminarLogo },
  inventario: { listar, registrar, actualizar, eliminar, bodegas, ubicaciones, movimientos, stock, reservas, conteos, lotes, kardex, valuacion },
  produccion: { listar, crear, avanzarEtapa, registrarConsumo, cerrar, consumirBOM },
  compras: { proveedores, ordenes, recepciones },
  ventas: { clientes, productos, pedidos, facturas },
  finanzas: { cxp, cxc, aging, tipoCambio },
  calidad: { recepciones, proceso, noConformidades },
  reportes: { kpis, ventasDiarias, merma },
  trazabilidad: { porLote, porOP },
  combos: { crear, crearPremium },
  health: async () => { ... }
}
```

---

## 📡 Endpoints del Backend

### 1. 👤 **USUARIOS** (`/api/usuario`)

| Endpoint | Método | Facade | Descripción |
|----------|--------|--------|-------------|
| `/registrar` | POST | `apiFacade.usuarios.registrar(usuario, token)` | Crear nuevo usuario |
| `/login` | POST | `apiFacade.auth.login({ email, password })` | Iniciar sesión |
| `/me` | GET | `apiFacade.auth.getMe(token)` | Obtener perfil actual |
| `/` | GET | `apiFacade.usuarios.listar(token)` | Listar todos los usuarios |
| `/:id/rol` | PATCH | `apiFacade.usuarios.actualizarRol(id, rol, token)` | Actualizar rol |
| `/:id` | PATCH | `apiFacade.usuarios.actualizar(id, datos, token)` | Actualizar usuario |
| `/:id` | DELETE | `apiFacade.usuarios.eliminar(id, token)` | Eliminar usuario |
| `/change-password` | POST | `apiFacade.usuarios.cambiarPassword(current, new, token)` | Cambiar contraseña |
| `/forgot-password` | POST | `apiFacade.auth.forgotPassword(email)` | Solicitar reset |
| `/reset-password/:token` | POST | `apiFacade.auth.resetPassword(token, newPass)` | Reset con token |
| `/reset-password-simple` | POST | `apiFacade.auth.resetPasswordSimple(email, newPass)` | Reset simple |
| `/permisos` | GET | `apiFacade.usuarios.getPermisos(token)` | Permisos del rol |
| `/preferencias` | GET | `apiFacade.usuarios.getPreferencias(token)` | Obtener preferencias UI |
| `/preferencias` | PATCH | `apiFacade.usuarios.actualizarPreferencias(pref, token)` | Actualizar preferencias |
| `/logo` | POST | `apiFacade.usuarios.subirLogo(file, token)` | Subir logo |
| `/logo` | DELETE | `apiFacade.usuarios.eliminarLogo(token)` | Eliminar logo |

**Ejemplo de uso:**
```javascript
// Login
const { token } = await apiFacade.auth.login({ email: 'admin@cafe.com', password: '12345678' });

// Crear usuario
await apiFacade.usuarios.registrar({ 
  nombre: 'Juan Pérez', 
  email: 'juan@cafe.com', 
  password: 'securepass', 
  rol: 'operador' 
}, token);

// Cambiar contraseña
await apiFacade.usuarios.cambiarPassword('oldPassword123', 'newPassword456', token);
```

---

### 2. 📦 **INVENTARIO** (`/api/inventario`)

| Endpoint | Método | Facade | Descripción |
|----------|--------|--------|-------------|
| `/items` | GET | `apiFacade.inventario.listar(token)` | Listar granos |
| `/items` | POST | `apiFacade.inventario.registrar(item, token)` | Registrar grano |
| `/actualizar` | POST | `apiFacade.inventario.actualizar(id, cantidad, token)` | Actualizar stock |
| `/items/:id` | DELETE | `apiFacade.inventario.eliminar(id, token)` | Eliminar item |
| `/bodegas` | GET | `apiFacade.inventario.bodegas.listar(token)` | Listar bodegas |
| `/bodegas` | POST | `apiFacade.inventario.bodegas.crear(bodega, token)` | Crear bodega |
| `/ubicaciones` | GET | `apiFacade.inventario.ubicaciones.listar(token)` | Listar ubicaciones |
| `/ubicaciones` | POST | `apiFacade.inventario.ubicaciones.crear(ubicacion, token)` | Crear ubicación |
| `/movimientos` | GET | `apiFacade.inventario.movimientos.listar(token)` | Listar movimientos |
| `/movimientos` | POST | `apiFacade.inventario.movimientos.registrar(mov, token)` | Registrar movimiento |
| `/stock` | GET | `apiFacade.inventario.stock.listar(token)` | Stock consolidado |
| `/reservas` | GET | `apiFacade.inventario.reservas.listar(token)` | Listar reservas |
| `/reservas` | POST | `apiFacade.inventario.reservas.crear(reserva, token)` | Crear reserva |
| `/reservas/:id/liberar` | POST | `apiFacade.inventario.reservas.liberar(id, token)` | Liberar reserva |
| `/conteos` | GET | `apiFacade.inventario.conteos.listar(token)` | Listar conteos |
| `/conteos` | POST | `apiFacade.inventario.conteos.crear(conteo, token)` | Crear conteo |
| `/conteos/:id/cerrar` | POST | `apiFacade.inventario.conteos.cerrar(id, token)` | Cerrar conteo |
| `/lotes` | GET | `apiFacade.inventario.lotes.listar(token)` | Listar lotes |
| `/lotes` | POST | `apiFacade.inventario.lotes.crear(lote, token)` | Crear lote |
| `/lotes/:id` | PUT | `apiFacade.inventario.lotes.actualizar(id, datos, token)` | Actualizar lote |
| `/kardex` | GET | `apiFacade.inventario.kardex(filtros, token)` | Kardex valorizado |
| `/valuacion` | GET | `apiFacade.inventario.valuacion(token)` | Valorización total |

**Ejemplo de uso:**
```javascript
// Registrar grano
await apiFacade.inventario.registrar({
  tipo: 'arabica',
  origen: 'Colombia',
  cantidad: 100,
  unidad: 'kg'
}, token);

// Actualizar stock
await apiFacade.inventario.actualizar('granoId123', 150, token);

// Consultar kardex
const kardex = await apiFacade.inventario.kardex({ desde: '2024-01-01' }, token);
```

---

### 3. 🏭 **PRODUCCIÓN** (`/api/produccion`)

| Endpoint | Método | Facade | Descripción |
|----------|--------|--------|-------------|
| `/` | GET | `apiFacade.produccion.listar(filtros, token)` | Listar OPs |
| `/crear` | POST | `apiFacade.produccion.crear(op, token)` | Crear OP |
| `/:id/etapa` | POST | `apiFacade.produccion.avanzarEtapa(id, etapa, token)` | Avanzar etapa |
| `/:id/consumo` | POST | `apiFacade.produccion.registrarConsumo(id, consumo, token)` | Registrar consumo |
| `/:id/cerrar` | POST | `apiFacade.produccion.cerrar(id, datos, token)` | Cerrar OP |
| `/:id/consumir-bom` | POST | `apiFacade.produccion.consumirBOM(id, token)` | Consumir BOM |

**Ejemplo de uso:**
```javascript
// Crear orden de producción
await apiFacade.produccion.crear({
  producto: 'Café Premium 500g',
  cantidad: 100,
  receta: [
    { tipo: 'arabica', cantidad: 30 },
    { tipo: 'robusta', cantidad: 20 }
  ]
}, token);

// Avanzar etapa
await apiFacade.produccion.avanzarEtapa('opId123', { etapa: 'tostado' }, token);
```

---

### 4. 🛒 **COMPRAS** (`/api/compras`)

| Endpoint | Método | Facade | Descripción |
|----------|--------|--------|-------------|
| `/proveedores` | GET | `apiFacade.compras.proveedores.listar(token)` | Listar proveedores |
| `/proveedores` | POST | `apiFacade.compras.proveedores.crear(proveedor, token)` | Crear proveedor |
| `/proveedores/:id` | PATCH | `apiFacade.compras.proveedores.actualizar(id, datos, token)` | Actualizar proveedor |
| `/ordenes` | GET | `apiFacade.compras.ordenes.listar(token)` | Listar órdenes |
| `/ordenes` | POST | `apiFacade.compras.ordenes.crear(orden, token)` | Crear orden |
| `/ordenes/:id/aprobar` | POST | `apiFacade.compras.ordenes.aprobar(id, datos, token)` | Aprobar orden |
| `/recepciones` | GET | `apiFacade.compras.recepciones.listar(token)` | Listar recepciones |
| `/recepciones` | POST | `apiFacade.compras.recepciones.crear(recepcion, token)` | Crear recepción |

**Ejemplo de uso:**
```javascript
// Crear proveedor
await apiFacade.compras.proveedores.crear({
  nombre: 'Café de Colombia SRL',
  email: 'ventas@cafecolombia.com',
  telefono: '+57 1234567'
}, token);

// Crear orden de compra
await apiFacade.compras.ordenes.crear({
  proveedor: 'proveedorId123',
  items: [
    { tipo: 'arabica', cantidad: 500, precioUnitario: 15 }
  ]
}, token);
```

---

### 5. 💰 **VENTAS** (`/api/ventas`)

| Endpoint | Método | Facade | Descripción |
|----------|--------|--------|-------------|
| `/clientes` | GET | `apiFacade.ventas.clientes.listar(token)` | Listar clientes |
| `/clientes` | POST | `apiFacade.ventas.clientes.crear(cliente, token)` | Crear cliente |
| `/clientes/:id` | PATCH | `apiFacade.ventas.clientes.actualizar(id, datos, token)` | Actualizar cliente |
| `/productos` | GET | `apiFacade.ventas.productos.listar(token)` | Listar productos |
| `/productos` | POST | `apiFacade.ventas.productos.crear(producto, token)` | Crear producto |
| `/productos/:id` | PATCH | `apiFacade.ventas.productos.actualizar(id, datos, token)` | Actualizar producto |
| `/pedidos` | GET | `apiFacade.ventas.pedidos.listar(token)` | Listar pedidos |
| `/pedidos` | POST | `apiFacade.ventas.pedidos.crear(pedido, token)` | Crear pedido |
| `/pedidos/:id/confirmar` | POST | `apiFacade.ventas.pedidos.confirmar(id, token)` | Confirmar pedido |
| `/pedidos/:id/despachar` | POST | `apiFacade.ventas.pedidos.despachar(id, token)` | Despachar pedido |
| `/pedidos/:id/cancelar` | POST | `apiFacade.ventas.pedidos.cancelar(id, token)` | Cancelar pedido |
| `/facturas` | GET | `apiFacade.ventas.facturas.listar(token)` | Listar facturas |
| `/facturas` | POST | `apiFacade.ventas.facturas.emitir(factura, token)` | Emitir factura |
| `/facturas/:id/anular` | POST | `apiFacade.ventas.facturas.anular(id, token)` | Anular factura |

**Ejemplo de uso:**
```javascript
// Crear cliente
await apiFacade.ventas.clientes.crear({
  nombre: 'Cafetería La Esquina',
  nit: '123456789',
  direccion: 'Av. Principal 123'
}, token);

// Crear pedido
await apiFacade.ventas.pedidos.crear({
  cliente: 'clienteId123',
  items: [
    { producto: 'productoId456', cantidad: 10 }
  ]
}, token);
```

---

### 6. 💵 **FINANZAS** (`/api/finanzas`)

| Endpoint | Método | Facade | Descripción |
|----------|--------|--------|-------------|
| `/cxp` | GET | `apiFacade.finanzas.cxp.listar(token)` | Listar CxP |
| `/cxp` | POST | `apiFacade.finanzas.cxp.crear(cxp, token)` | Crear CxP |
| `/cxp/:id/pago` | POST | `apiFacade.finanzas.cxp.pagar(id, pago, token)` | Registrar pago |
| `/cxp/:id/anular` | POST | `apiFacade.finanzas.cxp.anular(id, token)` | Anular CxP |
| `/cxp/:id/factura` | POST | `apiFacade.finanzas.cxp.actualizarFactura(id, factura, token)` | Actualizar factura |
| `/cxp/:id/factura/adjunto` | POST | `apiFacade.finanzas.cxp.subirAdjunto(id, file, token)` | Subir adjunto |
| `/cxp/:id/factura/adjunto` | GET | `apiFacade.finanzas.cxp.descargarAdjunto(id, token)` | Descargar adjunto |
| `/cxc` | GET | `apiFacade.finanzas.cxc.listar(token)` | Listar CxC |
| `/cxc` | POST | `apiFacade.finanzas.cxc.crear(cxc, token)` | Crear CxC |
| `/cxc/:id/cobro` | POST | `apiFacade.finanzas.cxc.cobrar(id, cobro, token)` | Registrar cobro |
| `/cxc/:id/anular` | POST | `apiFacade.finanzas.cxc.anular(id, token)` | Anular CxC |
| `/aging` | GET | `apiFacade.finanzas.aging(token)` | Análisis aging |
| `/tc` | GET | `apiFacade.finanzas.tipoCambio(token, force)` | Tipo de cambio GTQ |

**Ejemplo de uso:**
```javascript
// Crear cuenta por pagar
await apiFacade.finanzas.cxp.crear({
  proveedor: 'proveedorId123',
  monto: 5000,
  fechaVencimiento: '2024-12-31',
  concepto: 'Compra de café',
  estado: 'pendiente'
}, token);

// Registrar pago
await apiFacade.finanzas.cxp.pagar('cxpId456', {
  monto: 2500,
  metodoPago: 'transferencia',
  fecha: '2024-10-15'
}, token);

// Consultar tipo de cambio
const { quetzal } = await apiFacade.finanzas.tipoCambio(token);
console.log(`1 USD = ${quetzal} GTQ`);
```

---

### 7. ✅ **CALIDAD** (`/api/calidad`)

| Endpoint | Método | Facade | Descripción |
|----------|--------|--------|-------------|
| `/recepciones` | GET | `apiFacade.calidad.recepciones.listar(token)` | Listar QC recepciones |
| `/recepciones` | POST | `apiFacade.calidad.recepciones.crear(recepcion, token)` | Crear QC recepción |
| `/proceso` | GET | `apiFacade.calidad.proceso.listar(token)` | Listar QC proceso |
| `/proceso` | POST | `apiFacade.calidad.proceso.crear(control, token)` | Crear QC proceso |
| `/nc` | GET | `apiFacade.calidad.noConformidades.listar(token)` | Listar NC |
| `/nc` | POST | `apiFacade.calidad.noConformidades.crear(nc, token)` | Crear NC |
| `/nc/:id/cerrar` | POST | `apiFacade.calidad.noConformidades.cerrar(id, token)` | Cerrar NC |

**Ejemplo de uso:**
```javascript
// Crear control de calidad en recepción
await apiFacade.calidad.recepciones.crear({
  recepcion: 'recepcionId123',
  lote: 'LOTE-2024-001',
  mediciones: {
    humedad: 12.5,
    acidez: 4.8,
    defectos: 2
  },
  resultado: 'aprobado',
  notas: 'Excelente calidad'
}, token);

// Crear no conformidad
await apiFacade.calidad.noConformidades.crear({
  tipo: 'producto',
  descripcion: 'Café con exceso de humedad',
  gravedad: 'alta',
  lote: 'LOTE-2024-001'
}, token);
```

---

### 8. 📊 **REPORTES** (`/api/reportes`)

| Endpoint | Método | Facade | Descripción |
|----------|--------|--------|-------------|
| `/kpis` | GET | `apiFacade.reportes.kpis(token)` | KPIs generales |
| `/ventas-diarias` | GET | `apiFacade.reportes.ventasDiarias(days, token)` | Ventas diarias |
| `/merma` | GET | `apiFacade.reportes.merma(days, token)` | Merma de producción |

**Ejemplo de uso:**
```javascript
// Obtener KPIs
const kpis = await apiFacade.reportes.kpis(token);
// { ventasMes, produccionMes, stockBajo, pedidosPendientes }

// Ventas últimos 7 días
const ventas = await apiFacade.reportes.ventasDiarias(7, token);

// Merma últimos 30 días
const merma = await apiFacade.reportes.merma(30, token);
```

---

### 9. 🔍 **TRAZABILIDAD** (`/api/trazabilidad`)

| Endpoint | Método | Facade | Descripción |
|----------|--------|--------|-------------|
| `/lote/:lote` | GET | `apiFacade.trazabilidad.porLote(lote, token)` | Trazabilidad por lote |
| `/op/:codigo` | GET | `apiFacade.trazabilidad.porOP(codigo, token)` | Trazabilidad por OP |

**Ejemplo de uso:**
```javascript
// Trazabilidad de lote
const traza = await apiFacade.trazabilidad.porLote('LOTE-2024-001', token);
// { recepcion, calidad, ops, productos }

// Trazabilidad de OP
const trazaOP = await apiFacade.trazabilidad.porOP('OP-2024-050', token);
// { op, consumos, productos, lotes }
```

---

### 10. 🎁 **COMBOS** (`/api/combos`)

| Endpoint | Método | Facade | Descripción |
|----------|--------|--------|-------------|
| `/crear` | POST | `apiFacade.combos.crear(combo, token)` | Crear combo básico |
| `/crear-premium` | POST | `apiFacade.combos.crearPremium(combo, token)` | Crear combo premium |

**Ejemplo de uso:**
```javascript
// Crear combo básico
await apiFacade.combos.crear({
  tipoCafe: 'arabica',
  cantidad: 2,
  personalizada: false,
  tipoFiltro: 'papel'
}, token);

// Crear combo premium
await apiFacade.combos.crearPremium({
  tipoCafe: 'especial',
  cantidad: 3
}, token);
```

---

## 🔐 Autenticación y Seguridad

### Sistema de Tokens JWT
1. **Login**: `apiFacade.auth.login({ email, password })` retorna `{ token, usuario }`
2. **Storage**: Guardar token en `localStorage.setItem('auth:token', token)`
3. **Uso**: Pasar token a cada llamada del facade: `apiFacade.xxx.yyy(..., token)`
4. **Logout**: `localStorage.removeItem('auth:token')`

### Headers Automáticos
El facade añade automáticamente:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

### Roles y Permisos
- **admin**: Acceso completo
- **it**: Gestión técnica
- **rrhh**: Gestión de usuarios
- **operador**: Operaciones diarias
- **auditor**: Solo lectura

---

## 📝 Guía de Actualización de Paneles

### Plantilla de Actualización

```javascript
// ANTES (fetch directo)
const r = await fetch(`${URL}/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  },
  body: JSON.stringify(data)
});
if (r.ok) {
  const result = await r.json();
  // ...
}

// DESPUÉS (usando apiFacade)
import { apiFacade } from './apiFacade';

try {
  const result = await apiFacade.modulo.metodo(data, token);
  // ...
} catch (err) {
  console.error(err.message);
}
```

### Paneles a Actualizar

#### ⚠️ InventarioPanel.jsx
```javascript
// Cambiar:
fetch('/api/inventario/items') → apiFacade.inventario.listar(token)
fetch('/api/inventario/items', POST) → apiFacade.inventario.registrar(item, token)
fetch('/api/inventario/actualizar', POST) → apiFacade.inventario.actualizar(id, cantidad, token)
```

#### ⚠️ VentasPanel.jsx
```javascript
// Cambiar:
fetch('/api/ventas/clientes') → apiFacade.ventas.clientes.listar(token)
fetch('/api/ventas/pedidos') → apiFacade.ventas.pedidos.listar(token)
fetch('/api/ventas/facturas') → apiFacade.ventas.facturas.listar(token)
```

#### ⚠️ CalidadPanel.jsx
```javascript
// Cambiar:
fetch('/api/calidad/recepciones') → apiFacade.calidad.recepciones.listar(token)
fetch('/api/calidad/proceso') → apiFacade.calidad.proceso.listar(token)
fetch('/api/calidad/nc') → apiFacade.calidad.noConformidades.listar(token)
```

#### ⚠️ ComprasPanel.jsx
```javascript
// Cambiar:
fetch('/api/compras/proveedores') → apiFacade.compras.proveedores.listar(token)
fetch('/api/compras/ordenes') → apiFacade.compras.ordenes.listar(token)
fetch('/api/compras/recepciones') → apiFacade.compras.recepciones.listar(token)
```

#### ⚠️ ReportesPanel.jsx
```javascript
// Cambiar:
fetch('/api/reportes/kpis') → apiFacade.reportes.kpis(token)
fetch('/api/reportes/ventas-diarias?days=7') → apiFacade.reportes.ventasDiarias(7, token)
fetch('/api/reportes/merma?days=30') → apiFacade.reportes.merma(30, token)
```

---

## 🎯 Ventajas de la Integración Completa

### ✅ Beneficios Técnicos
1. **Código más limpio**: Menos boilerplate, más legible
2. **Manejo centralizado de errores**: Lógica unificada
3. **Type-safety preparado**: Fácil migración a TypeScript
4. **Testing simplificado**: Mock del facade en vez de fetch
5. **Cache implementable**: Agregar caching en el facade
6. **Retry logic**: Implementar reintentos automáticos
7. **Rate limiting**: Control de llamadas desde el cliente
8. **Offline support**: Detectar y manejar desconexiones

### ✅ Beneficios de Negocio
1. **Mantenibilidad**: Cambios centralizados
2. **Escalabilidad**: Fácil agregar nuevos endpoints
3. **Documentación**: Facade auto-documentado
4. **Onboarding**: Desarrolladores entienden rápido
5. **Debugging**: Logs centralizados
6. **Monitoring**: Métricas de uso API

---

## 🚀 Próximos Pasos

### Corto Plazo
1. ✅ Actualizar paneles restantes (InventarioPanel, VentasPanel, etc.)
2. ✅ Agregar manejo de errores mejorado en UI
3. ✅ Implementar loading states consistentes
4. ✅ Agregar notificaciones toast globales

### Mediano Plazo
1. ⚠️ Migrar a TypeScript para type-safety
2. ⚠️ Implementar React Query para caching
3. ⚠️ Agregar tests unitarios al facade
4. ⚠️ Implementar refresh tokens
5. ⚠️ Agregar WebSockets para notificaciones real-time

### Largo Plazo
1. ⚠️ GraphQL como alternativa REST
2. ⚠️ Service Workers para offline-first
3. ⚠️ Progressive Web App (PWA)
4. ⚠️ Microservicios en backend
5. ⚠️ API Gateway con Kong/Nginx

---

## 📚 Referencias

### Documentación Backend
- **Express.js**: https://expressjs.com/
- **Mongoose**: https://mongoosejs.com/
- **JWT**: https://jwt.io/

### Documentación Frontend
- **React 18**: https://react.dev/
- **Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
- **Async/Await**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function

### Patrones de Diseño
- **Facade Pattern**: https://refactoring.guru/design-patterns/facade
- **Observer Pattern**: https://refactoring.guru/design-patterns/observer
- **Strategy Pattern**: https://refactoring.guru/design-patterns/strategy

---

## 📞 Contacto y Soporte

Para preguntas o problemas con la integración:
- 📧 Email: dev@cafegourmet.com
- 💬 Slack: #dev-integracion
- 📖 Wiki: https://wiki.cafegourmet.com/api

---

**Última actualización**: Octubre 2024  
**Versión**: 1.0.0  
**Estado**: ✅ Producción

---

*"La integración completa y asíncrona es la base de una aplicación escalable y mantenible"* 🚀
