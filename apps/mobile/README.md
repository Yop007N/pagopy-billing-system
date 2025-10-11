# PagoPy Mobile - Aplicación Ionic con Angular

## Descripción
Aplicación móvil del sistema de facturación electrónica PagoPy, construida con Ionic 7+ y Angular 17+.

## Características
- ✅ Componentes standalone (sin NgModules)
- ✅ Ionic 7+ con Material Design
- ✅ Capacitor 5+ para funcionalidades nativas
- ✅ Soporte offline con Storage y sincronización
- ✅ Tema personalizado con colores de Paraguay
- ✅ Diseño mobile-first con botones optimizados para táctil
- ✅ TypeScript strict mode

## Estructura del Proyecto
```
apps/mobile/
├── src/
│   ├── app/
│   │   ├── pages/           # Páginas de la aplicación
│   │   │   ├── auth/        # Autenticación (login, registro)
│   │   │   ├── tabs/        # Tabs principales (home, sales, profile)
│   │   │   ├── sales/       # Gestión de ventas
│   │   │   └── invoices/    # Facturas
│   │   ├── services/        # Servicios (API, Storage, Sync)
│   │   ├── shared/          # Componentes compartidos
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── assets/              # Recursos estáticos
│   ├── theme/               # Estilos y temas
│   ├── environments/        # Configuración de entornos
│   ├── index.html
│   ├── main.ts
│   └── global.scss
├── capacitor.config.ts      # Configuración de Capacitor
├── ionic.config.json        # Configuración de Ionic
├── project.json             # Configuración de Nx
└── tsconfig.json
```

## Tecnologías
- **Framework**: Angular 17+ (Standalone Components)
- **UI Library**: Ionic 7+
- **Runtime**: Capacitor 5+
- **Build Tool**: Nx
- **Package Manager**: pnpm
- **Language**: TypeScript (strict mode)

## Instalación de Dependencias
```bash
# Desde la raíz del monorepo
pnpm install

# Instalar dependencias de Ionic y Capacitor
pnpm add -w @ionic/angular @ionic/angular/standalone
pnpm add -w @capacitor/core @capacitor/cli
pnpm add -w @capacitor/splash-screen @capacitor/status-bar
pnpm add -w @capacitor/keyboard @capacitor/network
pnpm add -w @capacitor/preferences @capacitor/local-notifications
```

## Comandos Disponibles

### Desarrollo
```bash
# Servir la aplicación en modo desarrollo
nx serve mobile

# Servir con recarga en vivo
nx serve mobile --open
```

### Build
```bash
# Build de producción
nx build mobile --configuration=production

# Build de desarrollo
nx build mobile --configuration=development
```

### Capacitor
```bash
# Sincronizar cambios web con plataformas nativas
nx run mobile:sync

# Agregar plataforma Android
nx run mobile:add -- android

# Agregar plataforma iOS
nx run mobile:add -- ios

# Abrir proyecto nativo en Android Studio
npx cap open android

# Abrir proyecto nativo en Xcode
npx cap open ios
```

### Testing
```bash
# Ejecutar tests unitarios
nx test mobile

# Tests con cobertura
nx test mobile --coverage

# Tests en modo watch
nx test mobile --watch
```

### Linting
```bash
# Verificar código
nx lint mobile

# Auto-fix de problemas
nx lint mobile --fix
```

## Configuración de Capacitor

### Android
1. Instalar Android Studio
2. Configurar SDK de Android (API 22+)
3. Ejecutar: `nx run mobile:add -- android`
4. Abrir proyecto: `npx cap open android`

### iOS
1. Instalar Xcode (solo macOS)
2. Configurar CocoaPods
3. Ejecutar: `nx run mobile:add -- ios`
4. Abrir proyecto: `npx cap open ios`

## Características de la Aplicación

### Páginas Implementadas
1. **Autenticación**
   - Login con validación
   - Registro de nuevos usuarios

2. **Dashboard (Home)**
   - Estadísticas de ventas (hoy, semana, mes)
   - Acceso rápido a nueva venta
   - Facturas pendientes

3. **Ventas**
   - Lista de ventas realizadas
   - Detalle de venta
   - Nueva venta con múltiples productos
   - Cálculo automático de totales

4. **Perfil**
   - Información del usuario
   - Sincronización de datos
   - Configuración
   - Cerrar sesión

### Servicios Implementados
- **ApiService**: HTTP con retry y manejo de errores
- **StorageService**: Wrapper de Capacitor Preferences
- **SyncService**: Sincronización offline → online

## Tema y Estilos
- Colores principales de Paraguay (Azul #0033A0, Amarillo #FFCD00)
- Soporte para modo oscuro
- Botones grandes optimizados para táctil (min 44px)
- Safe area support para iOS

## Modo Offline
- Almacenamiento local con Capacitor Preferences
- Cola de sincronización para ventas pendientes
- Detección automática de conexión
- Sincronización automática cuando hay conexión

## Variables de Entorno
- `environment.ts`: Desarrollo (localhost:3000)
- `environment.prod.ts`: Producción (api.pagopy.py)

## Próximos Pasos
1. Instalar dependencias faltantes (Ionic, Capacitor)
2. Configurar backend API
3. Implementar autenticación real
4. Agregar SQLite para datos offline complejos
5. Implementar generación de PDF para facturas
6. Configurar push notifications
7. Agregar analytics
8. Testing E2E con Cypress

## Notas Importantes
- Todos los componentes son **standalone** (sin NgModules)
- TypeScript en **modo strict**
- Diseño **mobile-first**
- Enfoque **offline-first**
- Compatible con Android 5.1+ (API 22+)
- Compatible con iOS 13+

## Recursos
- [Ionic Documentation](https://ionicframework.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Angular Documentation](https://angular.io/docs)
- [Nx Documentation](https://nx.dev)
