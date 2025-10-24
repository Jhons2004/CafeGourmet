# Sistema de Gestión y Control de Producción de Café Gourmet

## 🆕 Nuevas Funcionalidades - Módulo de Compras

### Resumen de Implementación

Se ha implementado un módulo completo de **Compras y Gestión de Lotes** que permite:

#### Backend - Nuevas APIs

**Proveedores** (`/api/compras/proveedores`)
- `GET /` - Listar proveedores
- `POST /` - Crear proveedor
- `PATCH /:id` - Actualizar proveedor

**Órdenes de Compra** (`/api/compras/ordenes`)
- `GET /` - Listar órdenes
- `POST /` - Crear orden (estado: borrador)
- `POST /:id/aprobar` - Aprobar orden

**Recepciones de Lotes** (`/api/compras/recepciones`)
- `GET /` - Listar recepciones
- `POST /` - Registrar recepción (incrementa inventario automáticamente)

**Trazabilidad** (`/api/trazabilidad`)
- `GET /lote/:lote` - Rastrear lote desde recepción hasta consumo
- `GET /op/:codigo` - Ver consumos de una orden de producción

#### Modelos de Datos Extendidos

**Grano** (inventario)
- ✅ `lote` - Código de lote del proveedor
- ✅ `costoUnitario` - Costo por kg
- ✅ `proveedor` - Nombre del proveedor
- ✅ `ubicacion` - Almacén (default: ALM-PRINCIPAL)
- ✅ `estado` - activo/inactivo

**Nuevos Modelos**
- ✅ `Proveedor` - Datos de proveedores
- ✅ `OrdenCompra` - OCs con items y estados
- ✅ `RecepcionLote` - Lotes recibidos con costos
- ✅ `Auditoria` - Log de acciones críticas

#### Mejoras Técnicas

**Transacciones Atómicas**
- ✅ Consumo de inventario en Producción ahora es transaccional
- ✅ Recepción de lotes usa transacciones (crear recepción + incrementar inventario + cambiar estado OC)

**Validaciones Joi**
- ✅ Validaciones completas en compras (proveedores, OC, recepciones)
- ✅ Validaciones existentes en producción mejoradas

**Auditoría**
- ✅ Log automático de acciones en proveedores, órdenes, recepciones

**Índices de Base de Datos**
- ✅ `Grano`: por tipo+lote, estado+fecha
- ✅ `OrdenCompra`: por proveedor+fecha, estado+fecha
- ✅ Performance optimizada para consultas comunes

#### Frontend - Nueva Sección Compras

**Interfaz Integrada**
- ✅ Nuevo botón "Ir a Compras" en el menú principal
- ✅ Panel completo de gestión con 3 secciones:

**1. Gestión de Proveedores**
- Formulario para crear proveedores (nombre, RUC, contacto, email)
- Tabla con listado de proveedores activos

**2. Órdenes de Compra**
- Crear OC seleccionando proveedor
- Agregar/quitar items (tipo, cantidad, precio)
- Aprobar órdenes en estado borrador
- Tabla con estado de todas las órdenes

**3. Recepción de Lotes**
- Seleccionar OC aprobada
- Registrar múltiples lotes por recepción
- Capturar: código lote, cantidad real, costo, fecha cosecha, humedad
- **Al registrar**: automáticamente incrementa inventario y marca OC como recibida

#### Flujo Completo de Compras

```
1. Crear Proveedor → 2. Crear OC → 3. Aprobar OC → 4. Recibir Lotes → 5. Inventario Actualizado
```

### Cómo Usar

#### 1. Configurar Proveedores
```
Panel Compras > Proveedores > Llenar formulario > Crear Proveedor
```

#### 2. Crear Orden de Compra
```
Panel Compras > Órdenes > Seleccionar proveedor > Agregar items > Crear Orden
```

#### 3. Aprobar Orden
```
Panel Compras > Órdenes > Botón "Aprobar" en orden borrador
```

#### 4. Recibir Mercancía
```
Panel Compras > Recepciones > Seleccionar OC aprobada > Registrar lotes > Submit
```

#### 5. Verificar Inventario
```
Panel Inventario > Ver granos con lote, costo y proveedor actualizados
```

### Trazabilidad

**Por Lote**: `GET /api/trazabilidad/lote/A-202509-01`
```json
{
  "lote": "A-202509-01",
  "recepcion": {
    "fecha": "2025-09-20",
    "proveedor": "Finca La Colina", 
    "cantidadRecibida": 100,
    "costoUnitario": 3.2
  },
  "inventario": {
    "disponible": 45,
    "consumido": 55
  },
  "produccion": {
    "ordenesRelacionadas": 3,
    "consumos": [...]
  }
}
```

### Seguridad y Roles

**Permisos por Rol**:
- `admin/it`: Acceso completo (crear proveedores, OC, recepciones)
- `operador`: Solo recepciones y consultas
- `rrhh`: Solo consultas

**Auditoría**: Todas las acciones quedan registradas con usuario, fecha y payload.

### Próximos Pasos Sugeridos

1. **Calidad**: Checklist de QC en recepciones
2. **Reportes**: Stock por lote, consumos vs compras
3. **Alertas**: Notificaciones de stock bajo automáticas
4. **Mobile**: App móvil para recepciones en almacén
5. **Costeo**: Costo real por producto terminado

---

## Comandos para Probar

**Inicio**:
```bash
cd "C:\Desarrollo Web Formularios 2\backend"
npm start
```

**Acceso**: http://127.0.0.1:3000
**Credenciales**: admin1@cafe.com / 12345678

**APIs de ejemplo**:
- `GET /api/compras/proveedores`
- `POST /api/compras/proveedores` + `{"nombre":"Finca X"}`
- `GET /api/trazabilidad/lote/LOTE-001`