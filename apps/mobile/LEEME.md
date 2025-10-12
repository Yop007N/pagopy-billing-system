# PagoPy Mobile - Aplicación Móvil

## Descripción General

**PagoPy Mobile** es una aplicación móvil completa para la gestión de ventas, facturación electrónica y pagos, diseñada específicamente para pequeñas y medianas empresas en Paraguay. Integra con servicios locales como SET (e-Kuatia), SIPAP y pasarelas de pago (Bancard/Pagopar).

## Características Principales

- ✅ Componentes standalone de Angular 17+
- ✅ Ionic 7+ con Material Design
- ✅ Capacitor 5+ para funcionalidades nativas
- ✅ **Soporte offline completo** con sincronización automática
- ✅ Facturación electrónica integrada con SET (e-Kuatia)
- ✅ Gestión de ventas, clientes y productos
- ✅ Impresión térmica vía Bluetooth
- ✅ Escaneo de códigos QR y de barras
- ✅ Captura de fotos de productos
- ✅ Tema personalizado con colores de Paraguay
- ✅ Modo oscuro
- ✅ TypeScript en modo strict

## Requisitos del Sistema

### Para Desarrollo
- **Node.js**: 20 LTS
- **pnpm**: 8.x+
- **Sistema Operativo**: Linux, macOS, Windows (con WSL2)

### Para Compilación Android
- **Android Studio**: Hedgehog (2023.1.1) o superior
- **Android SDK**: API Level 33 (Android 13)
- **JDK**: 17

### Para Compilación iOS
- **macOS**: 12.0+ (Monterey o superior)
- **Xcode**: 14.0+
- **CocoaPods**: Instalado

### Para Dispositivos
- **Android**: 6.0+ (API 23+)
- **iOS**: 13.0+

## Estructura del Proyecto

```
apps/mobile/
├── src/
│   ├── app/
│   │   ├── pages/              # Páginas de la aplicación
│   │   │   ├── auth/           # Autenticación
│   │   │   ├── tabs/           # Tabs principales
│   │   │   ├── sales/          # Gestión de ventas
│   │   │   ├── invoices/       # Facturas
│   │   │   ├── customers/      # Clientes
│   │   │   ├── products/       # Productos
│   │   │   └── settings/       # Configuración
│   │   ├── services/           # Servicios (API, Storage, Sync)
│   │   ├── core/               # Servicios core
│   │   │   ├── services/       # Servicios principales
│   │   │   └── guards/         # Guards de rutas
│   │   ├── models/             # Modelos de datos
│   │   ├── shared/             # Componentes compartidos
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── assets/                 # Recursos estáticos
│   ├── environments/           # Configuración de entornos
│   ├── theme/                  # Estilos y temas
│   └── global.scss
├── android/                    # Proyecto nativo Android
├── ios/                        # Proyecto nativo iOS
├── capacitor.config.ts         # Configuración de Capacitor
├── ionic.config.json           # Configuración de Ionic
├── project.json                # Configuración de Nx
└── tsconfig.json
```

## Tecnologías Utilizadas

### Frontend
- **Framework**: Angular 17+ (Standalone Components)
- **UI Library**: Ionic 7+
- **Signals**: Para manejo de estado reactivo
- **Reactive Forms**: Para formularios
- **RxJS**: Para programación reactiva

### Runtime Nativo
- **Capacitor 5+**: Para acceso a funcionalidades nativas
- **Plugins de Capacitor**:
  - Camera
  - Local Notifications
  - Network
  - Preferences (Storage)
  - @capacitor-community/bluetooth-le
  - @capacitor-community/barcode-scanner

### Almacenamiento
- **SQLite**: Base de datos local para modo offline
- **Capacitor Preferences**: Almacenamiento clave-valor
- **Sincronización**: Bidireccional con el servidor

### Build Tool
- **Nx**: Monorepo y build system
- **Package Manager**: pnpm

## Inicio Rápido

### Instalación

```bash
# Desde la raíz del monorepo
cd /home/enrique-b/sistema-facturacion-wsl

# Instalar dependencias
pnpm install

# Iniciar Docker (PostgreSQL + Redis)
pnpm docker:up

# Generar Prisma Client
pnpm prisma:generate
```

### Desarrollo

```bash
# Servir la aplicación móvil
nx serve mobile
# o
pnpm dev:mobile

# La aplicación se abre en http://localhost:8100
```

### Compilación

```bash
# Build de producción
nx build mobile --configuration=production

# Sincronizar con Capacitor
cd apps/mobile
npx cap sync
```

### Compilación para Android

```bash
# Agregar plataforma Android (solo la primera vez)
npx cap add android

# Abrir en Android Studio
npx cap open android

# Compilar APK
cd android
./gradlew assembleDebug
```

### Compilación para iOS

```bash
# Agregar plataforma iOS (solo la primera vez)
npx cap add ios

# Instalar dependencias de CocoaPods
cd ios
pod install
cd ..

# Abrir en Xcode
npx cap open ios
```

## Documentación

### Guías Principales

1. **[GUIA_INICIO_RAPIDO.md](./GUIA_INICIO_RAPIDO.md)**
   - Configuración inicial rápida
   - Primeros pasos
   - Comandos esenciales

2. **[GUIA_DESARROLLO.md](./GUIA_DESARROLLO.md)**
   - Arquitectura del proyecto
   - Patrones de desarrollo
   - Configuración del entorno
   - Flujo de trabajo

3. **[GUIA_USUARIO.md](./GUIA_USUARIO.md)**
   - Manual del usuario final
   - Guía de uso de la aplicación
   - Funcionalidades principales
   - Resolución de problemas

4. **[CONFIGURACION_PLATAFORMA.md](./CONFIGURACION_PLATAFORMA.md)**
   - Configuración de Android
   - Configuración de iOS
   - Permisos nativos
   - Compilación y distribución

5. **[FUNCIONALIDADES.md](./FUNCIONALIDADES.md)**
   - Modo offline y sincronización
   - Autenticación y seguridad
   - Gestión de clientes
   - Gestión de productos
   - Facturación electrónica
   - Impresión térmica
   - Escaneo de códigos

6. **[PRUEBAS.md](./PRUEBAS.md)**
   - Guía de testing
   - Pruebas unitarias
   - Pruebas E2E
   - Cobertura de código

### Documentación de Referencia

Para documentación más detallada del proyecto completo, consulta:
- [CLAUDE.md](../../CLAUDE.md) - Guía completa del proyecto
- [README.md](../../README.md) - README principal del monorepo

## Comandos Útiles

### Desarrollo

```bash
# Servir con recarga en vivo
nx serve mobile --open

# Ejecutar en dispositivo Android
npx cap run android

# Ejecutar en simulador iOS
npx cap run ios

# Sincronizar cambios
npx cap sync
```

### Testing

```bash
# Ejecutar tests
nx test mobile

# Tests con cobertura
nx test mobile --coverage

# Tests en modo watch
nx test mobile --watch
```

### Linting y Formato

```bash
# Verificar código
nx lint mobile

# Auto-fix de problemas
nx lint mobile --fix
```

### Base de Datos (Desarrollo)

```bash
# Generar Prisma Client
pnpm prisma:generate

# Abrir Prisma Studio
pnpm prisma:studio

# Aplicar migraciones
pnpm prisma:migrate
```

## Modo Offline

La aplicación está diseñada para funcionar completamente sin conexión:

1. **Almacenamiento Local**: SQLite para datos estructurados
2. **Sincronización Automática**: Cuando se recupera la conexión
3. **Cola de Operaciones**: Gestión de operaciones pendientes
4. **Resolución de Conflictos**: Estrategias configurables

Ver [FUNCIONALIDADES.md](./FUNCIONALIDADES.md) para más detalles.

## Características Avanzadas

### Facturación Electrónica (SET)
- Generación de facturas electrónicas
- Integración con e-Kuatia
- CDC y KUDE automáticos
- Envío de facturas por WhatsApp/Email

### Impresión Térmica
- Conexión vía Bluetooth
- Comandos ESC/POS
- Soporte para papel 58mm y 80mm
- Impresión de tickets y facturas

### Gestión Offline
- Base de datos SQLite local
- Sincronización bidireccional
- Manejo de conflictos
- Cola de operaciones pendientes

## Seguridad

- **Autenticación**: JWT con tokens de acceso y refresco
- **Almacenamiento Seguro**: Encriptación de datos sensibles
- **Comunicación**: HTTPS/TLS
- **Permisos**: Manejo granular de permisos nativos

## Soporte y Contribución

### Reportar Problemas

Si encuentras un error:
1. Revisa la documentación relevante
2. Verifica los logs de la aplicación
3. Crea un issue con detalles completos

### Recursos Adicionales

- [Documentación de Ionic](https://ionicframework.com/docs)
- [Documentación de Capacitor](https://capacitorjs.com/docs)
- [Documentación de Angular](https://angular.dev)
- [Documentación de Nx](https://nx.dev)

## Licencia

Propietario - PagoPy

## Equipo de Desarrollo

Desarrollado por el equipo de PagoPy para pequeñas y medianas empresas en Paraguay.

---

**Versión**: 1.0.0
**Última Actualización**: 2025-10-12
**Mantenido por**: Equipo de Desarrollo PagoPy
