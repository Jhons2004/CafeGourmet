# 🔄 Script de Reinicio del Backend

## El backend necesita reiniciarse para cargar los cambios

### Pasos para Reiniciar:

#### Opción 1: Ctrl+C en la terminal del backend
1. Ve a la terminal donde está corriendo el backend
2. Presiona `Ctrl + C` para detenerlo
3. Ejecuta nuevamente: `npm start` o `node src/server.js`

#### Opción 2: Detener todos los procesos Node y reiniciar
En PowerShell:
```powershell
# Detener todos los procesos node
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Ir a la carpeta del backend
cd "c:\Desarrollo Web Formularios 2\backend"

# Iniciar el servidor
npm start
```

#### Opción 3: Usar nodemon (auto-reinicio)
Si tienes nodemon instalado:
```powershell
cd "c:\Desarrollo Web Formularios 2\backend"
npx nodemon src/server.js
```

---

## ✅ Después de Reiniciar

Una vez que el backend esté corriendo de nuevo:

1. Verifica que muestre: `✅ Servidor corriendo en http://127.0.0.1:3000`
2. Verifica que muestre: `✅ MongoDB conectado`
3. Recarga el navegador (F5)
4. Prueba crear una orden de producción

---

## 🔍 Verificar si el Backend Está Corriendo

En PowerShell:
```powershell
# Ver procesos Node
Get-Process node -ErrorAction SilentlyContinue

# Verificar puertos
netstat -ano | findstr :3000
```

---

## 📝 Cambios que se Aplicarán al Reiniciar

1. ✅ Método `crear` corregido - Ya no llama a `SistemaCafeFacade.crearProduccion()`
2. ✅ Método `listar` corregido - Ya no llama a `SistemaCafeFacade.listarProduccion()`
3. ✅ Validación de datos agregada
4. ✅ Logging de errores mejorado

---

## ⚠️ IMPORTANTE

**El error actual** (`SistemaCafeFacade.listarProduccion is not a function`) **desaparecerá** después de reiniciar el backend, porque el código ya está corregido en el archivo.

El backend que está corriendo actualmente es la versión **vieja** (antes de las correcciones).

---

**Necesitas reiniciar el backend AHORA para que funcione** 🔄
