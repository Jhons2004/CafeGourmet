# ✅ Checklist de Pruebas de Funcionalidad - Semana Oct 18-25

## Sistema Café Gourmet - Testing Manual

---

## 📋 Setup Inicial

- [ ] Backend corriendo en `127.0.0.1:3000`
- [ ] Frontend corriendo en `localhost:5173`
- [ ] MongoDB conectado
- [ ] Navegador con DevTools abierto (F12)
- [ ] Postman/Thunder Client instalado (opcional)

---

## 🔐 DÍA 1: AUTENTICACIÓN (4 horas)

### Login Exitoso
- [ ] Ir a página de login
- [ ] Ingresar `admin1@cafe.com` / `admin123`
- [ ] Click en "Iniciar Sesión"
- [ ] ✅ Verificar redirección a dashboard
- [ ] ✅ Verificar token en localStorage (F12 → Application → Local Storage)
- [ ] ✅ Verificar mensaje de bienvenida

### Login Fallido
- [ ] Intentar login con email inválido
- [ ] ✅ Verificar mensaje de error
- [ ] ✅ Verificar que NO se guarda token
- [ ] Intentar login con password incorrecta
- [ ] ✅ Verificar mensaje de error apropiado

### Logout
- [ ] Click en botón "Cerrar Sesión"
- [ ] ✅ Verificar redirección a login
- [ ] ✅ Verificar que token se eliminó de localStorage
- [ ] Intentar acceder a página protegida
- [ ] ✅ Verificar redirección a login

### Persistencia de Sesión
- [ ] Hacer login
- [ ] Refrescar página (F5)
- [ ] ✅ Verificar que sesión permanece
- [ ] Cerrar navegador
- [ ] Abrir navegador y volver a la URL
- [ ] ✅ Verificar que sesión permanece

### Token Expirado (Simulación)
- [ ] Abrir DevTools → Application → Local Storage
- [ ] Modificar token a valor inválido
- [ ] Intentar cargar cualquier panel
- [ ] ✅ Verificar mensaje "🔒 Token inválido o expirado"
- [ ] ✅ Verificar que token se limpia automáticamente

**Resultado Día 1**: ___ de 5 pruebas pasaron ✅

---

## 📦 DÍA 2: INVENTARIO (6 horas)

### Visualización
- [ ] Abrir panel "Inventario de Granos"
- [ ] ✅ Verificar que aparecen 3 granos de prueba (Arabica, Robusta, Blend)
- [ ] ✅ Verificar "Total Items: 3"
- [ ] ✅ Verificar "Total Kg" sumado correctamente
- [ ] ✅ Verificar badges de estado (Stock OK, Medio, Bajo)
- [ ] ✅ Verificar que tabla muestra: Tipo, Cantidad, Proveedor, Estado, Acciones

### Registro de Grano
- [ ] Click en "Registrar Grano"
- [ ] Seleccionar tipo: "Arabica"
- [ ] Ingresar cantidad: "50"
- [ ] Ingresar proveedor: "Test S.A."
- [ ] Click en "Registrar"
- [ ] ✅ Verificar mensaje "✅ Grano registrado exitosamente"
- [ ] ✅ Verificar que aparece en la tabla
- [ ] ✅ Verificar estadísticas actualizadas (4 items, kg sumados)
- [ ] Abrir MongoDB Compass
- [ ] ✅ Verificar que grano existe en colección `granos`

### Validaciones de Registro
- [ ] Click en "Registrar Grano"
- [ ] Dejar tipo vacío, llenar resto
- [ ] Click en "Registrar"
- [ ] ✅ Verificar que muestra error de validación
- [ ] Seleccionar tipo, ingresar cantidad negativa "-10"
- [ ] ✅ Verificar que no permite guardar
- [ ] Llenar todo excepto proveedor
- [ ] Click en "Registrar"
- [ ] ✅ Verificar que usa "Sin especificar" como proveedor

### Actualización de Stock
- [ ] Click en "Editar" de un grano
- [ ] Cambiar cantidad a "200"
- [ ] Click en "Actualizar"
- [ ] ✅ Verificar mensaje "✅ Stock actualizado correctamente"
- [ ] ✅ Verificar nueva cantidad en tabla
- [ ] ✅ Verificar en MongoDB que cantidad cambió
- [ ] Cambiar cantidad a "8" (bajo)
- [ ] ✅ Verificar que badge cambia a "Stock Bajo"
- [ ] ✅ Verificar alerta roja aparece arriba

### Eliminación de Grano
- [ ] Click en "Eliminar" de un grano
- [ ] ✅ Verificar que pide confirmación
- [ ] Click en "Cancelar"
- [ ] ✅ Verificar que NO se eliminó
- [ ] Click en "Eliminar" nuevamente
- [ ] Click en "Aceptar"
- [ ] ✅ Verificar mensaje "✅ Grano eliminado del inventario"
- [ ] ✅ Verificar que desaparece de tabla
- [ ] ✅ Verificar estadísticas actualizadas
- [ ] Abrir MongoDB
- [ ] ✅ Verificar que estado cambió a "inactivo" (soft delete)

### Alertas de Stock Bajo
- [ ] Editar un grano y bajar cantidad a "5"
- [ ] ✅ Verificar que aparece alerta amarilla: "⚠️ Stock Bajo: [nombre] (5 kg)"
- [ ] ✅ Verificar que "Stock Bajo: 1" (o más) en tarjeta de resumen
- [ ] ✅ Verificar badge "Stock Bajo" en la fila

**Resultado Día 2**: ___ de 6 pruebas principales pasaron ✅

---

## 🏭 DÍA 3: PRODUCCIÓN (5 horas)

### Crear Lote de Producción
- [ ] Abrir panel "Producción"
- [ ] Click en "Crear Lote"
- [ ] Ingresar código: "LOTE-TEST-001"
- [ ] Seleccionar tipo de grano
- [ ] Ingresar cantidad: "50"
- [ ] Click en "Crear"
- [ ] ✅ Verificar mensaje de éxito
- [ ] ✅ Verificar que lote aparece en lista
- [ ] ✅ Verificar estado: "pendiente"
- [ ] Verificar inventario
- [ ] ✅ Verificar que cantidad de grano se descontó

### Agregar Proceso de Tostado
- [ ] Seleccionar lote creado
- [ ] Click en "Agregar Tostado"
- [ ] Ingresar temperatura: "220"
- [ ] Ingresar tiempo: "15"
- [ ] Seleccionar nivel: "Medio"
- [ ] Click en "Guardar"
- [ ] ✅ Verificar que estado cambió a "en_proceso"
- [ ] ✅ Verificar información de tostado visible

### Finalizar Lote
- [ ] Click en "Finalizar Lote"
- [ ] ✅ Verificar que estado cambió a "finalizado"
- [ ] ✅ Verificar fecha de finalización registrada

### Validaciones
- [ ] Intentar crear lote con cantidad mayor a inventario disponible
- [ ] ✅ Verificar mensaje de error apropiado
- [ ] Intentar procesar lote con código inexistente
- [ ] ✅ Verificar error 404

**Resultado Día 3**: ___ de 4 pruebas principales pasaron ✅

---

## 🛒 DÍA 4: COMPRAS (6 horas)

### Gestión de Proveedores
- [ ] Abrir panel "Compras" → tab "Proveedores"
- [ ] ✅ Verificar que carga lista de proveedores existentes
- [ ] Click en "Agregar Proveedor"
- [ ] Llenar formulario:
  - Nombre: "Proveedor Test"
  - RUC: "12345678901"
  - Email: "test@proveedor.com"
  - Teléfono: "987654321"
- [ ] Click en "Guardar"
- [ ] ✅ Verificar que aparece en lista
- [ ] Click en "Editar" del proveedor creado
- [ ] Cambiar teléfono
- [ ] ✅ Verificar actualización
- [ ] Click en "Desactivar"
- [ ] ✅ Verificar que estado cambia a "inactivo"

### Órdenes de Compra
- [ ] Tab "Órdenes de Compra"
- [ ] Click en "Nueva Orden"
- [ ] Seleccionar proveedor activo
- [ ] Agregar items:
  - Grano: Arabica
  - Cantidad: 100 kg
  - Precio: 25.00
- [ ] ✅ Verificar que total se calcula automáticamente
- [ ] Click en "Crear Orden"
- [ ] ✅ Verificar orden en lista con estado "pendiente"
- [ ] Click en "Aprobar"
- [ ] ✅ Verificar estado cambia a "aprobada"

### Recepciones
- [ ] Tab "Recepciones"
- [ ] Click en "Nueva Recepción"
- [ ] Seleccionar orden aprobada
- [ ] Ingresar cantidad recibida: "100"
- [ ] Click en "Registrar"
- [ ] ✅ Verificar mensaje de éxito
- [ ] Verificar panel de Inventario
- [ ] ✅ Verificar que stock de grano aumentó

### Devoluciones
- [ ] Click en "Registrar Devolución"
- [ ] Seleccionar recepción
- [ ] Ingresar cantidad: "10"
- [ ] Ingresar motivo: "Calidad deficiente"
- [ ] Click en "Guardar"
- [ ] ✅ Verificar inventario ajustado (-10 kg)

**Resultado Día 4**: ___ de 4 secciones principales pasaron ✅

---

## 💰 DÍA 5: VENTAS (6 horas)

### Gestión de Clientes
- [ ] Abrir panel "Ventas" → tab "Clientes"
- [ ] Click en "Registrar Cliente"
- [ ] Llenar datos:
  - Nombre: "Cliente Test"
  - RUC: "20123456789"
  - Email: "cliente@test.com"
  - Dirección: "Av. Test 123"
- [ ] Click en "Guardar"
- [ ] ✅ Verificar cliente en lista

### Productos
- [ ] Tab "Productos"
- [ ] ✅ Verificar lista de productos disponibles
- [ ] Click en "Nuevo Producto"
- [ ] Llenar formulario
- [ ] ✅ Verificar registro exitoso

### Crear Pedido
- [ ] Tab "Pedidos"
- [ ] Click en "Nuevo Pedido"
- [ ] Seleccionar cliente
- [ ] Agregar productos:
  - Producto 1: cantidad 5
  - Producto 2: cantidad 3
- [ ] ✅ Verificar subtotal calculado
- [ ] ✅ Verificar IGV calculado (18%)
- [ ] ✅ Verificar total final
- [ ] Click en "Crear Pedido"
- [ ] ✅ Verificar pedido en lista

### Procesar Pedido
- [ ] Seleccionar pedido "pendiente"
- [ ] Click en "Procesar"
- [ ] ✅ Verificar estado cambia a "procesado"
- [ ] Verificar inventario
- [ ] ✅ Verificar que stock se descontó

### Generar Factura
- [ ] Seleccionar pedido procesado
- [ ] Click en "Generar Factura"
- [ ] ✅ Verificar factura creada
- [ ] ✅ Verificar serie y número de factura
- [ ] ✅ Verificar totales correctos

### Registrar Pago
- [ ] Click en "Registrar Pago"
- [ ] Ingresar monto
- [ ] Seleccionar método: "Efectivo"
- [ ] Click en "Guardar"
- [ ] ✅ Verificar pago registrado
- [ ] Tab "Finanzas" → "Cuentas por Cobrar"
- [ ] ✅ Verificar saldo actualizado

### Devolución
- [ ] Seleccionar factura
- [ ] Click en "Registrar Devolución"
- [ ] Seleccionar productos a devolver
- [ ] Click en "Procesar"
- [ ] ✅ Verificar inventario incrementado

**Resultado Día 5**: ___ de 7 secciones principales pasaron ✅

---

## 🔬 DÍA 6: CALIDAD (4 horas)

### Recepción de Granos
- [ ] Abrir panel "Calidad"
- [ ] Tab "Recepción de Granos"
- [ ] Click en "Nueva Inspección"
- [ ] Seleccionar recepción de compra
- [ ] Llenar parámetros:
  - Humedad: "12%"
  - Defectos: "2%"
  - Tamaño: "Uniforme"
- [ ] Resultado: "Aprobado"
- [ ] Click en "Guardar"
- [ ] ✅ Verificar inspección registrada

### Rechazar Lote
- [ ] Crear inspección con resultado "Rechazado"
- [ ] Motivo: "Humedad excesiva"
- [ ] ✅ Verificar inventario NO actualizado
- [ ] ✅ Verificar lote bloqueado

### No Conformidades (NC)
- [ ] Tab "No Conformidades"
- [ ] Click en "Registrar NC"
- [ ] Llenar:
  - Descripción: "Producto fuera de especificación"
  - Severidad: "Alta"
  - Área: "Producción"
- [ ] Click en "Crear"
- [ ] ✅ Verificar NC en lista
- [ ] Click en "Asignar Responsable"
- [ ] ✅ Verificar estado "en_investigación"
- [ ] Agregar acciones correctivas
- [ ] Click en "Cerrar NC"
- [ ] ✅ Verificar estado "cerrada"

### Control de Proceso
- [ ] Tab "Control de Proceso"
- [ ] Click en "Nueva Inspección"
- [ ] Seleccionar lote en producción
- [ ] Verificar parámetros críticos
- [ ] ✅ Verificar alertas si fuera de rango

**Resultado Día 6**: ___ de 4 secciones principales pasaron ✅

---

## 💵 DÍA 7: FINANZAS (6 horas)

### Cuentas por Pagar (CxP)
- [ ] Abrir panel "Finanzas" → tab "CxP"
- [ ] ✅ Verificar lista de cuentas pendientes
- [ ] Verificar que órdenes de compra generan CxP automáticamente
- [ ] Click en "Registrar Pago"
- [ ] Ingresar:
  - Monto: (total o parcial)
  - Método: "Transferencia"
  - Fecha: (actual)
- [ ] Click en "Guardar"
- [ ] ✅ Verificar saldo actualizado
- [ ] Si pago total: ✅ Verificar estado "pagado"

### Cuentas por Cobrar (CxC)
- [ ] Tab "CxC"
- [ ] ✅ Verificar que facturas generan CxC automáticamente
- [ ] Click en "Registrar Cobro"
- [ ] Ingresar datos del cobro
- [ ] ✅ Verificar saldo actualizado
- [ ] Aplicar descuento por pronto pago
- [ ] ✅ Verificar cálculo correcto

### Gestión de Mora
- [ ] Identificar CxC vencidas
- [ ] ✅ Verificar marcadas en rojo
- [ ] ✅ Verificar cálculo de días de mora
- [ ] Click en "Calcular Intereses"
- [ ] ✅ Verificar interés aplicado

### Gastos Operativos
- [ ] Tab "Gastos"
- [ ] Click en "Registrar Gasto"
- [ ] Llenar:
  - Categoría: "Servicios"
  - Descripción: "Luz y agua"
  - Monto: "500.00"
  - Fecha: (actual)
- [ ] Click en "Guardar"
- [ ] ✅ Verificar gasto en lista

### Reportes Financieros
- [ ] Tab "Reportes"
- [ ] Seleccionar "Flujo de Caja"
- [ ] Rango: "Último mes"
- [ ] Click en "Generar"
- [ ] ✅ Verificar ingresos listados
- [ ] ✅ Verificar egresos listados
- [ ] ✅ Verificar saldo calculado
- [ ] Seleccionar "Estado de Resultados"
- [ ] ✅ Verificar ventas totales
- [ ] ✅ Verificar costos
- [ ] ✅ Verificar utilidad bruta/neta

**Resultado Día 7**: ___ de 6 secciones principales pasaron ✅

---

## 🔄 DÍA 8: INTEGRACIÓN END-TO-END (6 horas)

### Flujo Completo: Compra
1. [ ] Registrar proveedor nuevo
2. [ ] Crear orden de compra (100 kg Arabica)
3. [ ] Aprobar orden
4. [ ] ✅ Verificar CxP generada
5. [ ] Registrar recepción
6. [ ] ✅ Verificar inventario aumentó
7. [ ] Inspección de calidad → Aprobar
8. [ ] ✅ Verificar lote disponible para producción
9. [ ] Registrar pago a proveedor
10. [ ] ✅ Verificar CxP cerrada

**Tiempo estimado**: 1 hora

### Flujo Completo: Venta
1. [ ] Verificar inventario de productos disponible
2. [ ] Registrar cliente nuevo
3. [ ] Crear pedido (5 unidades producto X)
4. [ ] ✅ Verificar total calculado
5. [ ] Procesar pedido
6. [ ] ✅ Verificar inventario descontado
7. [ ] Generar factura
8. [ ] ✅ Verificar CxC generada
9. [ ] Registrar cobro
10. [ ] ✅ Verificar CxC cerrada
11. [ ] ✅ Verificar flujo de caja actualizado

**Tiempo estimado**: 1 hora

### Flujo Completo: Producción
1. [ ] Verificar inventario de granos (min 100kg)
2. [ ] Crear lote de producción (50kg)
3. [ ] ✅ Verificar descuento de inventario de granos
4. [ ] Agregar proceso de tostado
5. [ ] ✅ Verificar estado "en_proceso"
6. [ ] Control de calidad intermedio
7. [ ] Finalizar lote
8. [ ] ✅ Verificar estado "finalizado"
9. [ ] Empacar producto terminado
10. [ ] ✅ Verificar inventario de productos aumentó
11. [ ] Verificar trazabilidad completa (grano → lote → producto)

**Tiempo estimado**: 1.5 horas

### Pruebas de Consistencia
- [ ] Realizar venta sin stock
- [ ] ✅ Verificar error apropiado
- [ ] Crear orden de compra sin proveedor activo
- [ ] ✅ Verificar validación
- [ ] Intentar procesar lote con usuario no autorizado
- [ ] ✅ Verificar error 403
- [ ] Verificar totales en reportes vs suma manual
- [ ] ✅ Verificar que coinciden

### Pruebas de Performance
- [ ] Medir tiempo de carga de inventario
- [ ] ✅ Target: < 500ms
- [ ] Medir tiempo de carga de ventas
- [ ] ✅ Target: < 1s
- [ ] Crear 50 registros en ráfaga
- [ ] ✅ Verificar sistema estable

**Resultado Día 8**: ___ de 5 flujos completados ✅

---

## 📊 Resumen Final

### Resultados por Día
| Día | Módulo | Casos | Pasaron | % |
|-----|--------|-------|---------|---|
| 1 | Autenticación | 5 | ___ | ___% |
| 2 | Inventario | 6 | ___ | ___% |
| 3 | Producción | 4 | ___ | ___% |
| 4 | Compras | 4 | ___ | ___% |
| 5 | Ventas | 7 | ___ | ___% |
| 6 | Calidad | 4 | ___ | ___% |
| 7 | Finanzas | 6 | ___ | ___% |
| 8 | Integración | 5 | ___ | ___% |
| **TOTAL** | **8 módulos** | **41** | **___** | **___%** |

### Bugs Encontrados
| # | Módulo | Severidad | Descripción | Estado |
|---|--------|-----------|-------------|--------|
| 1 |  | 🔴/🟡/🟢 |  | Pendiente/Resuelto |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

### Observaciones Generales
```
[Anotar aquí observaciones importantes durante el testing]

- 
- 
- 
```

### Recomendaciones
```
[Anotar mejoras sugeridas]

- 
- 
- 
```

---

## ✅ Checklist Final

- [ ] Todos los casos de prueba ejecutados
- [ ] Bugs documentados con screenshots
- [ ] Issues creados en GitHub
- [ ] Reporte final de testing generado
- [ ] Demo preparada para stakeholders
- [ ] Respaldo de base de datos con datos de prueba

---

**Tester**: _______________  
**Fecha Inicio**: 18/10/2025  
**Fecha Fin**: 25/10/2025  
**Horas Totales**: ~40 horas

**Estado General**: 🔴 Inicial / 🟡 En Progreso / 🟢 Completado
