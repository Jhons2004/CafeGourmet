# 🔧 Correcciones Aplicadas y Pendientes

## ✅ Correcciones Completadas en App.jsx

### 1. Importación de apiFacade
```javascript
// ✅ CORREGIDO
import { apiFacade } from './apiFacade';
```

### 2. Estado de Autenticación
```javascript
// ✅ CORREGIDO - Removido `token` del estado
const [user, setUser] = useState(null);
// Token manejado automáticamente por apiFacade
```

### 3. Login
```javascript
// ✅ CORREGIDO
const handleLogin = async e => {
  const data = await apiFacade.auth.login(login);
  setUser(data.usuario);
  // Token guardado automáticamente
};
```

### 4. Logout
```javascript
// ✅ CORREGIDO
const handleLogout = () => {
  apiFacade.auth.logout();
  setUser(null);
  setPanel('inicio');
};
```

### 5. Props de Componentes
```javascript
// ✅ CORREGIDO - Removido token de props
<InventarioPanel />
<ProduccionPanel />
<ComprasPanel />
<VentasPanel />
<FinanzasPanel />
<ConfigPanel />
```

### 6. Carga de Datos
```javascript
// ✅ CORREGIDO
const loadProveedores = async () => {
  const proveedores = await apiFacade.compras.proveedores.listar();
  setProveedores(proveedores);
};

const loadOrdenes = async () => {
  const ordenes = await apiFacade.compras.ordenes.listar();
  setOrdenes(ordenes);
};

// Similar para otras funciones
```

---

## ⚠️ Correcciones Pendientes en App.jsx

### Panel de Calidad - Formularios Inline

Estos formularios todavía tienen referencias a `token` y usan `fetch` directamente:

#### 1. Formulario QC Recepciones (línea ~971)
```javascript
// ❌ ACTUAL
const r = await fetch(`${CALIDAD_URL}/recepciones`, { 
  method:'POST', 
  headers:{ 
    'Content-Type':'application/json', 
    ...(token? { Authorization:`Bearer ${token}` } : {}) 
  }, 
  body: JSON.stringify(payload) 
});

// ✅ DEBERÍA SER
await apiFacade.calidad.recepciones.crear(payload);
```

#### 2. Formulario QC Proceso (línea ~1008)
```javascript
// ❌ ACTUAL
const r = await fetch(`${CALIDAD_URL}/proceso`, { 
  method:'POST', 
  headers:{ 
    'Content-Type':'application/json', 
    ...(token? { Authorization:`Bearer ${token}` } : {}) 
  }, 
  body: JSON.stringify(payload) 
});

// ✅ DEBERÍA SER
await apiFacade.calidad.proceso.crear(payload);
```

#### 3. Formulario NC (línea ~1073)
```javascript
// ❌ ACTUAL
const r = await fetch(`${CALIDAD_URL}/nc`, { 
  method:'POST', 
  headers:{ 
    'Content-Type':'application/json', 
    ...(token? { Authorization:`Bearer ${token}` } : {}) 
  }, 
  body: JSON.stringify(newNC) 
});

// ✅ DEBERÍA SER
await apiFacade.calidad.nc.crear(newNC);
```

#### 4. Cerrar NC (línea ~1110)
```javascript
// ❌ ACTUAL
await fetch(`${CALIDAD_URL}/nc/${n._id}/cerrar`, { 
  method:'POST', 
  headers: token? { Authorization:`Bearer ${token}` } : {} 
});

// ✅ DEBERÍA SER
await apiFacade.calidad.nc.cerrar(n._id);
```

---

## 🎯 Solución Recomendada

### Opción A: Mover Panel de Calidad a Componente Separado
El panel de Calidad tiene mucho código inline en App.jsx. **Recomendación**: 
- Crear `CalidadPanel.jsx` completo
- Usar `apiFacade` en ese componente
- Remover lógica de calidad de App.jsx

### Opción B: Actualizar Inline en App.jsx
- Reemplazar todos los `fetch` con `apiFacade`
- Asegurar que apiFacade tenga todos los métodos necesarios

---

## 📋 Métodos Necesarios en apiFacade.calidad

Verificar que existan estos métodos:

```javascript
apiFacade.calidad = {
  // Recepciones QC
  recepciones: {
    listar: async () => { ... },
    crear: async (data) => { ... }
  },
  
  // Proceso QC
  proceso: {
    listar: async () => { ... },
    crear: async (data) => { ... }
  },
  
  // No Conformidades
  nc: {
    listar: async () => { ... },
    crear: async (data) => { ... },
    cerrar: async (id) => { ... }
  }
};
```

---

## ✅ Próximos Pasos

1. ⚠️ Verificar si `CalidadPanel.jsx` existe y está completo
2. ⚠️ Si existe, usar ese componente en lugar del inline
3. ⚠️ Si no existe, crear `CalidadPanel.jsx` completo
4. ⚠️ Verificar que apiFacade tiene todos los métodos de calidad
5. ⚠️ Remover lógica inline de calidad en App.jsx

---

**Estado**: Correcciones principales aplicadas, quedan formularios inline de calidad  
**Prioridad**: 🟡 Media (el resto funciona, solo calidad inline falta)
