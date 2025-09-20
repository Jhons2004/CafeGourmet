# Sistema de Gestión y Control de Producción de Café Gourmet

Monorepo con Backend (Express/MongoDB) y Frontend (React + Vite).

## Estructura
- `backend/` API Express que también sirve la SPA de producción desde `Frontend/dist`.
- `Frontend/` SPA React (Vite). Estilos centralizados en `src/App.css`.

## Requisitos
- Node.js 20.19+ o 22.12+
- MongoDB local en `mongodb://127.0.0.1:27017`
 - Variables de entorno (ver `.env.example`):
    - `HOST`, `PORT`, `MONGODB_URI`, `JWT_SECRET`

## Desarrollo / Build
1. Instala dependencias del Frontend y construye la SPA:
   - En `Frontend/`: `npm ci` y `npm run build`
2. Ejecuta el backend (sirve API + SPA desde `Frontend/dist`):
   - En `backend/`: `npm start` o `node src/app.js`

La app debería estar disponible en `http://127.0.0.1:3000` y salud en `GET /api/health`.

## Git (Control de Versiones)
Para iniciar el repositorio local y hacer el primer commit:

```powershell
cd "C:\Desarrollo Web Formularios 2"
git init
git add -A
git commit -m "chore: initial commit"
```

Para publicar en GitHub (remoto nuevo):

```powershell
# Crea un repo vacío en GitHub y reemplaza la URL de abajo
$remote = "https://github.com/<tu-usuario>/<tu-repo>.git"
git remote add origin $remote
git branch -M main
git push -u origin main
```

Si `git commit` falla por falta de identidad, configura localmente:

```powershell
git config user.name "Tu Nombre"
git config user.email "tu-email@ejemplo.com"
```

## Colaboradores: cómo ejecutar
1. Clonar el repo:
   ```powershell
   git clone https://github.com/Jhons2004/CafeGourmet
   cd CafeGourmet
   ```
2. Configurar entorno del backend:
   - Copia `backend/.env.example` a `backend/.env` y revisa `MONGODB_URI`.
3. Preparar MongoDB (elige una opción):
   - Local instalado: asegurarse que corre en `127.0.0.1:27017`.
   - Docker: 
     ```powershell
     docker compose up -d
     ```
   - Atlas (nube): usa un connection string de Atlas en `MONGODB_URI`.
4. Instalar y construir frontend:
   ```powershell
   cd Frontend
   npm ci
   npm run build
   cd ..
   ```
5. Ejecutar backend (sirve API + SPA):
   ```powershell
   cd backend
   npm ci
   npm start
   ```
6. Abrir en navegador: `http://127.0.0.1:3000` y verificar `GET /api/health`.

Notas:
- Variables sensibles no se versionan; usa `.env` locales.
- Si necesitas exponer tu backend a internet para demos, considera `ngrok`.

## Autenticación y Roles

- Autenticación por JWT. El backend emite `token` en `POST /api/usuario/login`.
- En el Frontend, las operaciones de administración envían `Authorization: Bearer <token>`.
- Roles disponibles: `admin`, `it`, `rrhh`, `operador`.
   - Panel de Configuración y Usuarios visible para: `admin`, `it`, `rrhh`.
   - Endpoints de administración protegidos con middleware de autorización.

### Usuarios sembrados (seed)

Al iniciar, si no existen, se crean dos cuentas admin:

- Admin1 — email: `admin1@cafe.com` — password: `12345678`
- Admin2 — email: `admin2@cafe.com` — password: `12345678`

Se recomienda cambiar las contraseñas tras el primer ingreso.

### Variables de entorno clave (`backend/.env`)

Ejemplo:

```
HOST=127.0.0.1
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/cafe_gourmet
JWT_SECRET=cambia-esta-clave-super-secreta
```

Para exponer en LAN, usa `HOST=0.0.0.0` y abre el puerto 3000 en el firewall.

### Panel de Configuración y Usuarios (Frontend)

- Acceso desde el menú lateral cuando el rol es `admin`, `it` o `rrhh`.
- Permite:
   - Crear usuarios con rol.
   - Listar usuarios (sin contraseñas).
   - Cambiar rol.
   - Resetear contraseña (flujo simple).
   - Eliminar usuario.

Nota: Todas estas acciones requieren token válido con rol autorizado.

## Servir Local vs LAN (Windows)

Dispones de scripts en `scripts/` para alternar entre modo local (solo en tu PC) y expuesto en red local (LAN):

- `run-as-admin-configure-lan.bat` (recomendado):
   - Eleva privilegios (UAC) y ejecuta `configure-lan-server.ps1`.
   - Cambia `HOST=0.0.0.0` en `backend/.env`, compila Frontend, abre firewall TCP:3000 (si Admin), inicia el backend y muestra las URLs LAN a compartir (por ejemplo `http://192.168.1.155:3000`).

- `run-as-admin-disable-lan.bat`:
   - Eleva privilegios y ejecuta `disable-lan.ps1`.
   - Cambia `HOST=127.0.0.1` (solo local), intenta quitar la regla de firewall TCP:3000 (si Admin), reinicia el backend y valida que solo responda en `127.0.0.1`.

Validación rápida:
- LAN: desde otro equipo/telefono en la misma red, abre `http://<tu-ip-lan>:3000/api/health` (debe devolver `{"ok":true,"db":1}`).
- Local: `http://127.0.0.1:3000/api/health` debe responder; `http://<tu-ip-lan>:3000/api/health` NO debe responder.

Notas y solución de problemas:
- Asegúrate de que la red esté en Perfil "Privado" para LAN (el script puede sugerir cambiarlo si ejecutas como Admin).
- Algunos routers activan "AP/Client Isolation"; si está activo, los clientes no se ven entre sí.
- Si necesitas exponer fuera de la red (Internet), usa un túnel temporal como `ngrok http 3000`.
