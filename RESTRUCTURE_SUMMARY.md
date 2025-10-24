# Restructuración Backend-Frontend API

## Resumen de Cambios Realizados

### 1. Backend - Endpoints Añadidos

#### Inventario (`/api/inventario`)
- ✅ **GET /api/inventario/items** - Lista todos los items del inventario
- ✅ **POST /api/inventario/items** - Crea un nuevo item (delegado a `/registrar`)
- Limpieza de rutas duplicadas

#### Usuarios (`/api/usuario`)
- ✅ **GET /api/usuario/me** - Obtiene el perfil del usuario autenticado
- Nuevo controller method `me()` que devuelve el usuario actual basado en el token JWT

### 2. Frontend - API Facade Refactorizado

#### Archivo: `Frontend/src/apiFacade.js`

**Mejoras implementadas:**
- ✅ Helper `authHeaders(token)` centralizado para autenticación
- ✅ Manejo de errores con `throw new Error()` para propagación
- ✅ Validación de respuestas HTTP con `if (!res.ok)`
- ✅ Soporte de tokens en TODOS los endpoints

**Endpoints actualizados:**

```javascript
// Inventario
fetchGranos(token)          // GET /api/inventario/items
registrarGrano(form, token) // POST /api/inventario/items
actualizarGrano(id, cantidad, token) // POST /api/inventario/actualizar

// Finanzas
getFinanzas(token)          // GET /api/finanzas/cxp + /cxc
addFinanza(finanza, token)  // POST /api/finanzas/cxp o /cxc
fetchAging(token)           // GET /api/finanzas/aging
fetchTC(token, force)       // GET /api/finanzas/tc

// Usuarios/Config
getUsuarios(token)          // GET /api/usuario
addUsuario(usuario, token)  // POST /api/usuario/registrar
getMe(token)                // GET /api/usuario/me

// Auth
login(credentials)          // POST /api/usuario/login
resetPassword(data)         // POST /api/usuario/reset-password-simple
```

### 3. Paneles Frontend Actualizados

#### FinanzasPanel (`Frontend/src/panels/FinanzasPanel.jsx`)
- ✅ Añadido prop `token`
- ✅ Actualizado `useEffect` para usar `apiFacade.getFinanzas(token)`
- ✅ Actualizado `handleAddFinanza` para usar `apiFacade.addFinanza(finanza, token)`

#### ConfigPanel (`Frontend/src/panels/ConfigPanel.jsx`)
- ✅ Añadido prop `token`
- ✅ Actualizado `useEffect` para usar `apiFacade.getUsuarios(token)`
- ✅ Actualizado `handleAddUsuario` para usar `apiFacade.addUsuario(usuario, token)`

#### App.jsx
- ✅ Actualizado renderizado de `<FinanzasPanel token={token} />`
- ✅ Actualizado renderizado de `<ConfigPanel token={token} />`

### 4. Fixes de Bugs

#### Backend
- ✅ **inventarioController.js**: Corregido `getGranos()` → `getInventarioGranos()`
- ✅ **inventario.js**: Eliminadas rutas duplicadas para `/items`
- ✅ **.env**: Eliminado `HOST` duplicado

### 5. Estructura de Respuestas Consistente

Todas las respuestas del backend ahora siguen el patrón:

```javascript
// Éxito
{ 
  mensaje: "Operación exitosa",
  data: { /* ... */ }
}

// Error
{
  error: "Descripción del error",
  detalles: "Mensaje técnico"
}
```

## Estado de los Servidores

### Backend
- **Puerto:** 3000
- **Host:** 0.0.0.0 (accesible desde red local)
- **MongoDB:** Conectado a `mongodb://127.0.0.1:27017/cafe_gourmet`
- **Usuarios admin:** `admin1@cafe.com`, `admin2@cafe.com` (precargados)

### Frontend
- **Puerto:** 5173
- **URLs:** 
  - Local: http://localhost:5173/
  - Network: http://192.168.50.236:5173/
- **Build tool:** Vite 7.1.3

## Endpoints Disponibles

### Inventario
```
GET    /api/inventario              - Ver inventario completo
GET    /api/inventario/items        - Alias para ver items
POST   /api/inventario/registrar    - Registrar nuevo grano
POST   /api/inventario/items        - Alias para registrar
POST   /api/inventario/actualizar   - Actualizar stock
GET    /api/inventario/stock        - Stock consolidado
GET    /api/inventario/kardex       - Kardex y valorización
```

### Producción
```
GET    /api/produccion              - Listar órdenes de producción
POST   /api/produccion/crear        - Crear nueva OP
POST   /api/produccion/:id/etapa    - Avanzar etapa
POST   /api/produccion/:id/consumo  - Registrar consumo
POST   /api/produccion/:id/cerrar   - Cerrar OP
```

### Compras
```
GET    /api/compras/proveedores     - Listar proveedores
POST   /api/compras/proveedores     - Crear proveedor
GET    /api/compras/ordenes         - Listar órdenes de compra
POST   /api/compras/ordenes         - Crear orden de compra
GET    /api/compras/recepciones     - Listar recepciones
POST   /api/compras/recepciones     - Crear recepción
```

### Ventas
```
GET    /api/ventas/clientes         - Listar clientes
POST   /api/ventas/clientes         - Crear cliente
GET    /api/ventas/productos        - Listar productos terminados
POST   /api/ventas/productos        - Crear producto
GET    /api/ventas/pedidos          - Listar pedidos
POST   /api/ventas/pedidos          - Crear pedido
GET    /api/ventas/facturas         - Listar facturas
POST   /api/ventas/facturas         - Emitir factura
```

### Calidad
```
GET    /api/calidad/recepciones     - Control de calidad en recepciones
POST   /api/calidad/recepciones     - Crear QC de recepción
GET    /api/calidad/proceso         - Control de calidad en proceso
POST   /api/calidad/proceso         - Crear QC de proceso
GET    /api/calidad/nc              - No conformidades
POST   /api/calidad/nc              - Crear NC
POST   /api/calidad/nc/:id/cerrar   - Cerrar NC
```

### Finanzas
```
GET    /api/finanzas/cxp            - Cuentas por pagar
POST   /api/finanzas/cxp            - Crear cuenta por pagar
POST   /api/finanzas/cxp/:id/pago   - Registrar pago
GET    /api/finanzas/cxc            - Cuentas por cobrar
POST   /api/finanzas/cxc            - Crear cuenta por cobrar
POST   /api/finanzas/cxc/:id/cobro  - Registrar cobro
GET    /api/finanzas/aging          - Análisis de antigüedad
GET    /api/finanzas/tc             - Tipo de cambio (Banguat)
```

### Reportes
```
GET    /api/reportes/kpis           - KPIs del sistema
GET    /api/reportes/ventas-diarias - Ventas por día
GET    /api/reportes/merma          - Reporte de mermas
```

### Usuarios
```
POST   /api/usuario/registrar       - Registrar nuevo usuario
POST   /api/usuario/login           - Iniciar sesión
GET    /api/usuario/me              - Perfil del usuario actual
GET    /api/usuario                 - Listar usuarios (admin)
POST   /api/usuario/reset-password-simple - Cambiar contraseña
GET    /api/usuario/permisos        - Permisos del rol actual
```

### Salud
```
GET    /api/health                  - Estado del servidor y DB
```

## Comandos para Iniciar

### Backend
```powershell
cd 'c:\Desarrollo Web Formularios 2\backend'
npm start
```

### Frontend
```powershell
cd 'c:\Desarrollo Web Formularios 2\Frontend'
npm run dev
```

## Próximos Pasos Recomendados

1. **Testing end-to-end**: Verificar cada módulo desde el frontend
2. **Validación de permisos**: Asegurar que los roles tienen acceso correcto
3. **Manejo de errores**: Mejorar mensajes de error en el frontend
4. **Loading states**: Añadir indicadores de carga en paneles
5. **Optimización**: Implementar debouncing y memoización donde sea necesario

---

**Fecha de restructuración:** 2025-10-11  
**Status:** ✅ Completado
