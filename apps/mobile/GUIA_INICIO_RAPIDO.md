# Guía de Inicio Rápido - PagoPy Mobile

Configuración completa del entorno de desarrollo en **5 minutos**.

## Tabla de Contenidos

- [Prerrequisitos](#prerrequisitos)
- [Instalación Rápida](#instalación-rápida)
- [Primera Venta](#primera-venta)
- [Configuración Android](#configuración-android)
- [Configuración iOS](#configuración-ios)
- [Problemas Comunes](#problemas-comunes)

---

## Prerrequisitos

### Herramientas Requeridas

- [x] **Node.js 20 LTS**: `node --version` → v20.x.x
- [x] **pnpm 8+**: `pnpm --version` → 8.x
- [x] **Docker**: Para PostgreSQL y Redis
- [x] **Git**: Control de versiones

### Herramientas Opcionales (Para Build Nativo)

**Android**:
- Android Studio Hedgehog (2023.1.1+)
- JDK 17
- Android SDK (API 33)

**iOS** (Solo macOS):
- Xcode 14.0+
- CocoaPods

---

## Instalación Rápida

### Opción 1: Script Automatizado (Recomendado)

```bash
cd /home/enrique-b/sistema-facturacion-wsl

# Setup completo (dependencias + docker + base de datos)
./scripts/setup.sh

# Iniciar todo (Backend + Web + Mobile)
pnpm start
```

### Opción 2: Manual

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar servicios Docker
pnpm docker:up

# 3. Base de datos
pnpm prisma:generate
pnpm prisma:migrate

# 4. Iniciar desarrollo
pnpm dev:mobile          # Mobile en http://localhost:8100
pnpm dev:backend         # API en http://localhost:3000
```

### Verificar Instalación

```bash
./scripts/health-check.sh
```

Debe mostrar:
- ✅ Docker services running
- ✅ Backend API (port 3000)
- ✅ Mobile App (port 8100)

---

## Primera Venta

### 1. Acceder a la App

```bash
# Abrir en navegador
http://localhost:8100
```

### 2. Iniciar Sesión

**Credenciales de prueba**:
- Email: `admin@pagopy.py`
- Password: `admin123`

### 3. Crear Venta

1. Navegar a **Ventas** → **Nueva Venta**
2. Seleccionar cliente (o crear uno nuevo)
3. Agregar productos:
   - Buscar por nombre o código
   - Especificar cantidad
   - Aplicar descuentos (opcional)
4. Seleccionar método de pago
5. Guardar venta

### 4. Probar Modo Offline

```bash
# En Chrome DevTools
1. F12 → Network tab
2. Seleccionar "Offline"
3. Crear venta (se guarda localmente)
4. Volver a "Online"
5. Venta se sincroniza automáticamente
```

---

## Configuración Android

### Setup Inicial

```bash
cd apps/mobile

# Agregar plataforma Android (primera vez)
npx cap add android

# Sincronizar
npx cap sync android

# Abrir en Android Studio
npx cap open android
```

### Configurar Permisos

**Archivo**: `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

  <!-- Internet y Red -->
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

  <!-- Cámara -->
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-feature android:name="android.hardware.camera" android:required="false" />

  <!-- Bluetooth (Impresoras) -->
  <uses-permission android:name="android.permission.BLUETOOTH" />
  <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
  <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:maxSdkVersion="30" />
  <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" android:maxSdkVersion="30" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

  <!-- Notificaciones -->
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

  <!-- Almacenamiento -->
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
  <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

</manifest>
```

### Build y Ejecutar

```bash
cd android

# Build debug APK
./gradlew assembleDebug

# Instalar en dispositivo
adb install app/build/outputs/apk/debug/app-debug.apk

# O ejecutar directo desde Android Studio
```

### Comandos Útiles

```bash
# Ver dispositivos conectados
adb devices

# Logs en tiempo real
adb logcat | grep -i pagopy

# Desinstalar app
adb uninstall py.pago.app
```

---

## Configuración iOS

### Setup Inicial

```bash
cd apps/mobile

# Agregar plataforma iOS (primera vez)
npx cap add ios

# Instalar dependencias CocoaPods
cd ios
pod install
cd ..

# Sincronizar
npx cap sync ios

# Abrir en Xcode
npx cap open ios
```

### Configurar Info.plist

**Archivo**: `ios/App/App/Info.plist`

```xml
<key>NSCameraUsageDescription</key>
<string>PagoPy necesita acceso a la cámara para escanear productos y códigos QR</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>PagoPy necesita acceso a tus fotos para adjuntar imágenes de productos</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>PagoPy necesita permiso para guardar facturas en tu galería</string>

<key>NSBluetoothAlwaysUsageDescription</key>
<string>PagoPy necesita Bluetooth para conectarse a impresoras térmicas</string>

<key>NSBluetoothPeripheralUsageDescription</key>
<string>PagoPy necesita Bluetooth para comunicarse con impresoras</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>PagoPy utiliza tu ubicación para estadísticas de ventas</string>

<key>NSFaceIDUsageDescription</key>
<string>PagoPy utiliza Face ID para autenticación biométrica</string>
```

### Build y Ejecutar

1. Abrir `ios/App/App.xcworkspace` en Xcode
2. Seleccionar equipo de desarrollo en **Signing & Capabilities**
3. Seleccionar dispositivo/simulador
4. Presionar **⌘ + R** para ejecutar

### Probar en Dispositivo Físico

```bash
# 1. Conectar iPhone/iPad via USB
# 2. Confiar en computadora (mensaje en dispositivo)
# 3. En Xcode, seleccionar tu dispositivo
# 4. Primera ejecución: Confiar en certificado
#    Settings → General → VPN & Device Management → Trust
```

---

## Modo Offline

### Configuración Automática

El modo offline está habilitado por defecto. Todas las ventas se guardan localmente y sincronizan automáticamente.

### Indicadores Visuales

La app muestra:
- 🟢 **Online**: Conectado al servidor
- 🟡 **Sin backend**: Internet disponible pero servidor no alcanzable
- 🔴 **Offline**: Sin conexión

### Flujo de Sincronización

```
1. Usuario crea venta offline
   ↓
2. Venta se guarda en SQLite local
   ↓
3. Estado: syncStatus = 'pending'
   ↓
4. Conexión restaurada
   ↓
5. Sincronización automática cada 5 minutos
   ↓
6. Venta enviada al servidor
   ↓
7. Estado: syncStatus = 'synced'
```

### Sincronización Manual

```typescript
// En cualquier página
await this.syncService.manualSync();
```

---

## Entorno de Desarrollo

### Variables de Entorno

**Backend** (`apps/backend/.env`):
```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pagopy_db"
JWT_SECRET=your-super-secret-jwt-key-change-this
```

**Mobile** (`apps/mobile/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  features: {
    offlineMode: true,
    enableDebugLogs: true
  }
};
```

### Para Dispositivo Físico

Cambiar `localhost` por la IP de tu computadora:

```typescript
// Obtener IP
ipconfig     # Windows
ifconfig     # Mac/Linux

// Actualizar en environment.ts
apiUrl: 'http://192.168.1.100:3000/api'
```

---

## Comandos de Desarrollo

### Desarrollo Web

```bash
# Servidor con hot-reload
pnpm dev:mobile              # Puerto 8100

# Build para producción
pnpm build:mobile
nx build mobile --configuration=production
```

### Capacitor

```bash
# Sincronizar assets y plugins
npx cap sync

# Sincronizar plataforma específica
npx cap sync android
npx cap sync ios

# Ejecutar en dispositivo
npx cap run android
npx cap run ios

# Ejecutar con live reload
npx cap run android -l --external
npx cap run ios -l --external
```

### Base de Datos

```bash
# Generar cliente Prisma
pnpm prisma:generate

# Aplicar migraciones
pnpm prisma:migrate

# Ver base de datos (GUI)
pnpm prisma:studio

# Seed (datos de prueba)
pnpm prisma:seed
```

### Docker

```bash
# Iniciar servicios
pnpm docker:up

# Detener servicios
pnpm docker:down

# Ver logs
pnpm docker:logs

# Reiniciar servicios
pnpm docker:restart
```

---

## Problemas Comunes

### App no carga en navegador

```bash
# 1. Verificar puerto disponible
lsof -i :8100

# 2. Limpiar caché y reconstruir
nx reset
pnpm build:mobile

# 3. Verificar backend
curl http://localhost:3000/health
```

### No se conecta al backend

```bash
# 1. Verificar backend está corriendo
pnpm dev:backend

# 2. Verificar URL correcta en environment.ts
apiUrl: 'http://localhost:3000/api'

# 3. Para dispositivo físico, usar IP
apiUrl: 'http://192.168.1.100:3000/api'

# 4. Verificar CORS en backend
# apps/backend/src/main.ts debe tener:
app.enableCors({ origin: '*' })
```

### Error al instalar dependencias

```bash
# Limpiar e instalar de nuevo
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Verificar versión de Node.js
node --version  # Debe ser v20.x.x
```

### Android: Build falla

```bash
# Limpiar build
cd apps/mobile/android
./gradlew clean

# Sync Gradle
./gradlew --refresh-dependencies

# Verificar JDK
java --version  # Debe ser 17
```

### iOS: Pod install falla

```bash
cd apps/mobile/ios

# Actualizar CocoaPods
sudo gem install cocoapods

# Limpiar caché
rm -rf Pods Podfile.lock
pod cache clean --all

# Reinstalar
pod install --repo-update
```

### Sync no funciona

```bash
# 1. Verificar NetworkService
console.log(networkService.isOnline())

# 2. Verificar storage inicializado
await storageService.initialize()

# 3. Ver logs de sync
const logs = await database.getSyncLogs(20)
console.log(logs)

# 4. Forzar sync manual
await syncService.manualSync()
```

---

## Siguientes Pasos

Después del setup inicial:

1. ✅ **Leer documentación completa**: [GUIA_DESARROLLO.md](./GUIA_DESARROLLO.md)
2. ✅ **Configurar plataformas**: [CONFIGURACION_PLATAFORMA.md](./CONFIGURACION_PLATAFORMA.md)
3. ✅ **Explorar funcionalidades**: [FUNCIONALIDADES.md](./FUNCIONALIDADES.md)
4. ✅ **Setup de pruebas**: [PRUEBAS.md](./PRUEBAS.md)
5. ✅ **Leer guía de usuario**: [GUIA_USUARIO.md](./GUIA_USUARIO.md)

---

## Recursos

### Documentación Oficial

- [Angular Documentation](https://angular.dev)
- [Ionic Framework](https://ionicframework.com/docs)
- [Capacitor](https://capacitorjs.com/docs)
- [NestJS Backend](https://docs.nestjs.com)

### Documentación del Proyecto

- Guía principal: `/CLAUDE.md`
- Backend API: `/apps/backend/README.md`
- Deployment: `/DEPLOYMENT.md`

### Soporte

- Email: soporte@pagopy.py
- Issues: GitHub Issues del proyecto
- Documentación: `/apps/mobile/LEEME.md`

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-12
**Mantenido por**: Equipo de Desarrollo PagoPy
