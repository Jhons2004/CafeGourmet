# Sistema de Gestión y Control de Producción de Café Gourmet

Monorepo con Backend (Express/MongoDB) y Frontend (React + Vite).

## Estructura
- `backend/` API Express que también sirve la SPA de producción desde `Frontend/dist`.
- `Frontend/` SPA React (Vite). Estilos centralizados en `src/App.css`.

## Requisitos
- Node.js 20.19+ o 22.12+
- MongoDB local en `mongodb://127.0.0.1:27017`

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
