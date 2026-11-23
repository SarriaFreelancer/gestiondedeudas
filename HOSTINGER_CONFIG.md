# Configuración de Base de Datos Hostinger & Despliegue en Producción

Esta guía contiene la configuración de la base de datos suministrada para Hostinger y las instrucciones paso a paso para el despliegue.

---

## 1. Cadena de Conexión de Hostinger

La URL proporcionada para el backend en la nube es:
```env
DATABASE_URL="mysql://DavSar20:DavSar20@libertad-financiera-backend-l65tk7:3306/misdeudas"
```

### Explicación del Host:
- El host `libertad-financiera-backend-l65tk7` es el nombre interno de servicio/contenedor en la infraestructura de Hostinger Cloud / Docker.
- Dentro de la red de Hostinger, este nombre se resuelve automáticamente a la IP del contenedor de MySQL.
- En desarrollo local (Windows), se continúa usando `localhost:3306` para garantizar que la app funcione sin depender de la red interna de Hostinger.

---

## 2. Variables de Entorno para Hostinger (.env en Producción)

Configura estas variables en el panel de Hostinger (sección Environment Variables / Variables de Entorno):

```env
NODE_ENV=production
DATABASE_URL="mysql://DavSar20:DavSar20@libertad-financiera-backend-l65tk7:3306/misdeudas"
APP_SECRET="mi_libertad_financiera_super_secret_key_2026_jwt"
NEXT_PUBLIC_APP_NAME="Mi Libertad Financiera"
PORT=3000
```

---

## 3. Pasos de Despliegue en Hostinger

1. **Subir los archivos o conectar repositorio:**
   Clonar o subir el código a la carpeta del proyecto en Hostinger.

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Migrar tablas a MySQL de Hostinger:**
   ```bash
   npx prisma db push
   ```
   *(Esto creará automáticamente todas las tablas: `Usuario`, `Deuda`, `Cuota`, `Movimiento`, `Ingreso`, `GastoPresupuesto`, `Configuracion`)*.

4. **Compilar la aplicación:**
   ```bash
   npm run build
   ```

5. **Iniciar en Producción:**
   ```bash
   npm run start
   ```
