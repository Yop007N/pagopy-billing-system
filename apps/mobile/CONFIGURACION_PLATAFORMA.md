# Configuración de Plataforma - PagoPy Mobile

Guía completa para configurar y construir la aplicación PagoPy en Android e iOS.

## Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Configuración de Capacitor](#configuración-de-capacitor)
- [Configuración de Android](#configuración-de-android)
- [Configuración de iOS](#configuración-de-ios)
- [Variables de Entorno](#variables-de-entorno)
- [Dependencias y Plugins](#dependencias-y-plugins)
- [Construcción y Despliegue](#construcción-y-despliegue)
- [Solución de Problemas](#solución-de-problemas)

---

## Requisitos Previos

### Herramientas Generales

```bash
# Node.js 20 LTS (requerido)
node --version  # Debe ser v20.x.x

# pnpm 8.x+ (gestor de paquetes del proyecto)
pnpm --version  # Debe ser 8.x.x o superior

# Capacitor CLI
pnpm add -g @capacitor/cli

# Ionic CLI (opcional)
pnpm add -g @ionic/cli
```

### SDK de Android

**Android Studio**: Versión 2022.3 (Giraffe) o superior

**SDK Components Requeridos**:
- Android SDK Platform 33 (Android 13)
- Android SDK Build-Tools 33.0.0
- Android SDK Platform-Tools
- Android SDK Tools
- Android Emulator
- Intel x86 Emulator Accelerator (HAXM) o equivalente

**NDK**: Versión 25.1.8937393 o superior (opcional, para plugins nativos)

**Variables de Entorno**:
```bash
# Linux/macOS (~/.bashrc o ~/.zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Windows (Variables de Sistema)
ANDROID_HOME=C:\Users\[TU_USUARIO]\AppData\Local\Android\Sdk
Path=%Path%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
```

**Verificar Instalación**:
```bash
# Verificar adb
adb --version

# Verificar SDK
sdkmanager --list
```

### SDK de iOS (Solo macOS)

**Xcode**: Versión 14.0 o superior (desde Mac App Store)

**Command Line Tools**:
```bash
# Instalar command line tools
xcode-select --install

# Verificar instalación
xcode-select -p
# Debe mostrar: /Applications/Xcode.app/Contents/Developer
```

**CocoaPods** (gestor de dependencias iOS):
```bash
# Instalar CocoaPods
sudo gem install cocoapods

# Verificar versión
pod --version
```

**Simuladores iOS**:
- iOS 13.0 o superior
- Instalar desde Xcode → Settings → Platforms

---

## Configuración de Capacitor

### Archivo de Configuración Principal

**Ubicación**: `apps/mobile/capacitor.config.ts`

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'py.pago.app',
  appName: 'PagoPy',
  webDir: 'www',

  // Servidor
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: [
      'api.pagopy.py',
      'localhost',
      '*.pagopy.py'
    ],
    cleartext: true  // Solo para desarrollo
  },

  // Configuración Android
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    },
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false  // true en desarrollo
  },

  // Configuración iOS
  ios: {
    scheme: 'PagoPy',
    contentInset: 'always',
    limitsNavigationsToAppBoundDomains: true
  },

  // Configuración de plugins (ver sección completa abajo)
  plugins: {
    // ... configuración de plugins
  }
};

export default config;
```

### Plugins Capacitor Configurados

#### SplashScreen
```typescript
SplashScreen: {
  launchShowDuration: 2000,
  launchAutoHide: true,
  backgroundColor: '#0033A0',  // Azul Paraguay
  androidSplashResourceName: 'splash',
  androidScaleType: 'CENTER_CROP',
  showSpinner: false,
  spinnerColor: '#FFCD00',  // Amarillo Paraguay
  splashFullScreen: true,
  splashImmersive: true
}
```

#### StatusBar
```typescript
StatusBar: {
  style: 'dark',
  backgroundColor: '#0033A0',
  overlaysWebView: false
}
```

#### LocalNotifications
```typescript
LocalNotifications: {
  smallIcon: 'ic_stat_icon_config_sample',
  iconColor: '#0033A0',
  sound: 'beep.wav'
}
```

#### BluetoothLe (Impresoras Térmicas)
```typescript
BluetoothLe: {
  displayStrings: {
    scanning: 'Buscando impresoras...',
    cancel: 'Cancelar',
    availableDevices: 'Dispositivos disponibles',
    noDeviceFound: 'No se encontraron impresoras'
  }
}
```

### Inicializar Capacitor

```bash
# Desde el directorio del proyecto mobile
cd apps/mobile

# Construir la aplicación web
pnpm build

# Sincronizar con Capacitor
npx cap sync

# Agregar plataformas (solo la primera vez)
npx cap add android
npx cap add ios
```

---

## Configuración de Android

### Estructura del Proyecto Android

```
apps/mobile/android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/
│   │       ├── res/
│   │       │   ├── drawable/
│   │       │   ├── layout/
│   │       │   ├── mipmap-*/  (iconos)
│   │       │   └── values/
│   │       └── assets/
│   └── build.gradle
├── gradle/
├── build.gradle
└── settings.gradle
```

### AndroidManifest.xml

**Ubicación**: `apps/mobile/android/app/src/main/AndroidManifest.xml`

Ver `AndroidManifest.template.xml` para referencia completa.

**Permisos Esenciales**:

```xml
<!-- Internet y Red -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

<!-- Cámara (fotos de productos, escaneo) -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />

<!-- Bluetooth (impresoras térmicas) -->
<!-- Android 12+ -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
    android:usesPermissionFlags="neverForLocation"
    tools:targetApi="s" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"
    tools:targetApi="s" />

<!-- Android 11 y anteriores -->
<uses-permission android:name="android.permission.BLUETOOTH"
    android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"
    android:maxSdkVersion="30" />

<!-- Ubicación (requerido para Bluetooth en Android 12+) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Notificaciones (Android 13+) -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Almacenamiento -->
<!-- Android 12 y anteriores -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />

<!-- Android 13+ (permisos granulares) -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />

<!-- Vibración (feedback háptico) -->
<uses-permission android:name="android.permission.VIBRATE" />

<!-- Servicios en primer plano (sincronización) -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

<!-- Wake Lock (mantener dispositivo activo durante sync) -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

**Activity Principal**:
```xml
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:name=".MainActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:screenOrientation="portrait"
    android:exported="true">

    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <!-- Deep linking -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" android:host="pagopy.py" />
        <data android:scheme="pagopy" />
    </intent-filter>
</activity>
```

### build.gradle (Nivel App)

**Ubicación**: `apps/mobile/android/app/build.gradle`

```gradle
android {
    namespace "py.pago.app"
    compileSdkVersion 33

    defaultConfig {
        applicationId "py.pago.app"
        minSdkVersion 22
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"

        // Habilitar multidex si es necesario
        multiDexEnabled true
    }

    buildTypes {
        debug {
            debuggable true
            minifyEnabled false
        }

        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'

            // Firma de release (configurar keystore)
            signingConfig signingConfigs.release
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "androidx.appcompat:appcompat:1.6.1"
    implementation "androidx.coordinatorlayout:coordinatorlayout:1.2.0"
    implementation "androidx.core:core-splashscreen:1.0.1"

    // Capacitor
    implementation project(':capacitor-android')
    implementation project(':capacitor-app')
    implementation project(':capacitor-haptics')
    implementation project(':capacitor-keyboard')
    implementation project(':capacitor-status-bar')

    // Testing
    testImplementation "junit:junit:4.13.2"
    androidTestImplementation "androidx.test.ext:junit:1.1.5"
    androidTestImplementation "androidx.test.espresso:espresso-core:3.5.1"
}
```

### Configurar Firma de Release (Keystore)

**Generar Keystore**:
```bash
# Generar keystore
keytool -genkey -v -keystore pagopy-release.keystore \
  -alias pagopy-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Ubicación recomendada: ~/keystores/pagopy-release.keystore
```

**Configurar en gradle.properties** (NO comitear):
```properties
# apps/mobile/android/gradle.properties
PAGOPY_RELEASE_STORE_FILE=/home/usuario/keystores/pagopy-release.keystore
PAGOPY_RELEASE_KEY_ALIAS=pagopy-key
PAGOPY_RELEASE_STORE_PASSWORD=tu_password_seguro
PAGOPY_RELEASE_KEY_PASSWORD=tu_password_seguro
```

**Agregar signingConfigs en build.gradle**:
```gradle
android {
    signingConfigs {
        release {
            storeFile file(project.hasProperty('PAGOPY_RELEASE_STORE_FILE')
                ? PAGOPY_RELEASE_STORE_FILE
                : "/dev/null")
            storePassword project.hasProperty('PAGOPY_RELEASE_STORE_PASSWORD')
                ? PAGOPY_RELEASE_STORE_PASSWORD
                : ""
            keyAlias project.hasProperty('PAGOPY_RELEASE_KEY_ALIAS')
                ? PAGOPY_RELEASE_KEY_ALIAS
                : ""
            keyPassword project.hasProperty('PAGOPY_RELEASE_KEY_PASSWORD')
                ? PAGOPY_RELEASE_KEY_PASSWORD
                : ""
        }
    }
}
```

### Iconos y Splash Screens

**Generar Assets**:
```bash
# Usar herramienta de generación de iconos
# Icono de 1024x1024 requerido

# Copiar a carpetas mipmap:
# android/app/src/main/res/mipmap-hdpi/
# android/app/src/main/res/mipmap-mdpi/
# android/app/src/main/res/mipmap-xhdpi/
# android/app/src/main/res/mipmap-xxhdpi/
# android/app/src/main/res/mipmap-xxxhdpi/

# Splash screen: android/app/src/main/res/drawable/splash.png
```

---

## Configuración de iOS

### Estructura del Proyecto iOS

```
apps/mobile/ios/
├── App/
│   ├── App/
│   │   ├── AppDelegate.swift
│   │   ├── Info.plist
│   │   ├── Assets.xcassets/
│   │   └── public/
│   ├── App.xcodeproj/
│   └── App.xcworkspace/
└── Podfile
```

### Info.plist

**Ubicación**: `apps/mobile/ios/App/App/Info.plist`

Ver `Info.plist.template` para referencia completa.

**Permisos de Privacidad Esenciales**:

```xml
<!-- Cámara -->
<key>NSCameraUsageDescription</key>
<string>PagoPy necesita acceso a la cámara para tomar fotos de productos, escanear códigos de barras QR y documentos de clientes.</string>

<!-- Galería de Fotos -->
<key>NSPhotoLibraryUsageDescription</key>
<string>PagoPy necesita acceso a la galería de fotos para guardar facturas y recibos, y cargar imágenes de productos.</string>

<key>NSPhotoLibraryAddUsageDescription</key>
<string>PagoPy necesita permiso para guardar facturas y recibos en tu galería de fotos.</string>

<!-- Bluetooth (impresoras térmicas) -->
<key>NSBluetoothAlwaysUsageDescription</key>
<string>PagoPy usa Bluetooth para conectarse con impresoras térmicas y imprimir facturas y recibos.</string>

<key>NSBluetoothPeripheralUsageDescription</key>
<string>PagoPy necesita acceso a Bluetooth para comunicarse con impresoras térmicas.</string>

<!-- Ubicación -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>PagoPy usa tu ubicación para registrar el lugar de la venta y aplicar las configuraciones fiscales regionales correctas.</string>

<!-- Face ID (autenticación biométrica) -->
<key>NSFaceIDUsageDescription</key>
<string>PagoPy usa Face ID para autenticación rápida y segura en la aplicación.</string>

<!-- Red Local (desarrollo) -->
<key>NSLocalNetworkUsageDescription</key>
<string>PagoPy necesita acceso a la red local para conectarse con el servidor durante el desarrollo.</string>
```

**Configuración de App Transport Security** (desarrollo):
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsLocalNetworking</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
        <key>api.pagopy.py</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSExceptionRequiresForwardSecrecy</key>
            <false/>
        </dict>
    </dict>
</dict>
```

**URL Schemes (Deep Linking)**:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>py.pago.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>pagopy</string>
        </array>
    </dict>
</array>
```

**Modos de Fondo**:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
    <string>bluetooth-central</string>
</array>
```

### Podfile

**Ubicación**: `apps/mobile/ios/Podfile`

```ruby
require_relative '../../node_modules/@capacitor/ios/scripts/pods_helpers'

platform :ios, '13.0'
use_frameworks!

# Habilitar instalación de workspaces
install! 'cocoapods', :deterministic_uuids => false

def capacitor_pods
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorApp', :path => '../../node_modules/@capacitor/app'
  pod 'CapacitorHaptics', :path => '../../node_modules/@capacitor/haptics'
  pod 'CapacitorKeyboard', :path => '../../node_modules/@capacitor/keyboard'
  pod 'CapacitorStatusBar', :path => '../../node_modules/@capacitor/status-bar'
  pod 'CapacitorSplashScreen', :path => '../../node_modules/@capacitor/splash-screen'
  pod 'CapacitorCamera', :path => '../../node_modules/@capacitor/camera'
  pod 'CapacitorFilesystem', :path => '../../node_modules/@capacitor/filesystem'
  pod 'CapacitorStorage', :path => '../../node_modules/@capacitor/preferences'
  pod 'CapacitorNetwork', :path => '../../node_modules/@capacitor/network'
  pod 'CapacitorLocalNotifications', :path => '../../node_modules/@capacitor/local-notifications'

  # Plugins de terceros
  pod 'CapacitorBluetoothLe', :path => '../../node_modules/@capacitor-community/bluetooth-le'
end

target 'App' do
  capacitor_pods

  # Agregar pods adicionales aquí si es necesario
end

post_install do |installer|
  assertDeploymentTarget(installer)
end
```

**Instalar Pods**:
```bash
cd apps/mobile/ios/App
pod install

# Siempre abrir .xcworkspace (no .xcodeproj)
open App.xcworkspace
```

### Configuración en Xcode

**1. General Settings**:
- **Bundle Identifier**: `py.pago.app`
- **Version**: `1.0.0`
- **Build**: `1`
- **Deployment Target**: iOS 13.0
- **Device Orientation**: Portrait

**2. Signing & Capabilities**:
- Agregar Apple Developer Team
- Habilitar "Automatically manage signing" (desarrollo)
- Para producción: configurar Provisioning Profile manual

**Capabilities a Agregar**:
- Push Notifications
- Background Modes (fetch, remote-notification, bluetooth-central)
- Associated Domains (applinks:pagopy.py, applinks:app.pagopy.py)

**3. Build Settings**:
- **Swift Language Version**: Swift 5
- **iOS Deployment Target**: 13.0
- **Excluded Architectures (Debug)**: arm64 (solo para simulador en M1)

### Iconos y Launch Screen

**App Icon**:
- Imagen de 1024x1024
- Agregar a `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Xcode generará todos los tamaños automáticamente

**Launch Screen**:
- Ubicación: `ios/App/App/Assets.xcassets/Splash.imageset/`
- Tamaños recomendados: @1x, @2x, @3x

---

## Variables de Entorno

### Archivo .env

**Ubicación**: `apps/mobile/.env`

```bash
# Backend API
VITE_API_URL=https://api.pagopy.py
# Para desarrollo local: http://localhost:3000

# Entorno
VITE_ENV=production
VITE_APP_NAME=PagoPy
VITE_DEBUG=false

# Feature Flags
VITE_FEATURE_OFFLINE_MODE=true
VITE_FEATURE_PWA=true
VITE_FEATURE_NOTIFICATIONS=true
VITE_FEATURE_BIOMETRIC_AUTH=true

# SET e-Kuatia (opcional en mobile)
VITE_SET_ENVIRONMENT=PRODUCTION

# Configuración de Sincronización
VITE_SYNC_INTERVAL=300000  # 5 minutos
VITE_SYNC_RETRY_ATTEMPTS=5
VITE_SYNC_BATCH_SIZE=50

# Sentry (opcional)
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=production
```

**Copiar Plantilla**:
```bash
cp apps/mobile/.env.example apps/mobile/.env
```

**IMPORTANTE**: NO comitear `.env` al repositorio.

### Acceso en el Código

```typescript
// apps/mobile/src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: import.meta.env.VITE_API_URL || 'https://api.pagopy.py',
  appName: import.meta.env.VITE_APP_NAME || 'PagoPy',
  features: {
    offlineMode: import.meta.env.VITE_FEATURE_OFFLINE_MODE === 'true',
    biometricAuth: import.meta.env.VITE_FEATURE_BIOMETRIC_AUTH === 'true',
  },
  sync: {
    interval: parseInt(import.meta.env.VITE_SYNC_INTERVAL || '300000'),
    retryAttempts: parseInt(import.meta.env.VITE_SYNC_RETRY_ATTEMPTS || '5'),
    batchSize: parseInt(import.meta.env.VITE_SYNC_BATCH_SIZE || '50'),
  }
};
```

---

## Dependencias y Plugins

### Capacitor Core

```bash
# Instalar dependencias core de Capacitor
pnpm add @capacitor/core @capacitor/cli
pnpm add @capacitor/android @capacitor/ios

# Plugins oficiales
pnpm add @capacitor/app
pnpm add @capacitor/haptics
pnpm add @capacitor/keyboard
pnpm add @capacitor/status-bar
pnpm add @capacitor/splash-screen
pnpm add @capacitor/camera
pnpm add @capacitor/filesystem
pnpm add @capacitor/preferences  # antes @capacitor/storage
pnpm add @capacitor/network
pnpm add @capacitor/local-notifications
pnpm add @capacitor/push-notifications
pnpm add @capacitor/dialog
pnpm add @capacitor/toast
pnpm add @capacitor/share
pnpm add @capacitor/device
pnpm add @capacitor/browser
```

### Plugins de Comunidad

```bash
# Bluetooth para impresoras térmicas
pnpm add @capacitor-community/bluetooth-le

# Escáner de códigos de barras
pnpm add @capacitor-community/barcode-scanner

# SQLite para almacenamiento offline
pnpm add @capacitor-community/sqlite

# Biometric authentication
pnpm add @capacitor-community/privacy-screen
pnpm add capacitor-native-biometric
```

### Ionic Storage (SQLite)

```bash
# Ionic Storage con SQLite driver
pnpm add @ionic/storage-angular
pnpm add @ionic/storage

# Drivers de almacenamiento
pnpm add localforage
pnpm add @capacitor-community/sqlite
```

### Lista Completa de Dependencias

Ver `package.json` completo:

```json
{
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "@capacitor/android": "^5.5.0",
    "@capacitor/app": "^5.0.6",
    "@capacitor/camera": "^5.0.7",
    "@capacitor/core": "^5.5.0",
    "@capacitor/filesystem": "^5.1.4",
    "@capacitor/haptics": "^5.0.6",
    "@capacitor/ios": "^5.5.0",
    "@capacitor/keyboard": "^5.0.6",
    "@capacitor/local-notifications": "^5.0.6",
    "@capacitor/network": "^5.0.6",
    "@capacitor/preferences": "^5.0.6",
    "@capacitor/push-notifications": "^5.1.0",
    "@capacitor/splash-screen": "^5.0.6",
    "@capacitor/status-bar": "^5.0.6",
    "@capacitor-community/barcode-scanner": "^4.0.1",
    "@capacitor-community/bluetooth-le": "^3.1.0",
    "@capacitor-community/sqlite": "^5.4.2",
    "@ionic/angular": "^7.5.0",
    "@ionic/angular-toolkit": "^9.0.0",
    "@ionic/storage": "^4.0.0",
    "@ionic/storage-angular": "^4.0.0",
    "capacitor-native-biometric": "^4.1.0",
    "ionicons": "^7.1.0",
    "localforage": "^1.10.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.6.0",
    "zone.js": "^0.14.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^5.5.0",
    "@ionic/cli": "^7.1.0"
  }
}
```

### Verificar Dependencias Instaladas

```bash
# Listar todas las dependencias
pnpm list --depth=0

# Verificar versiones de Capacitor
npx cap doctor

# Verificar plugins instalados
npx cap ls
```

---

## Construcción y Despliegue

### Desarrollo Local

```bash
# Ejecutar en navegador (live reload)
pnpm dev:mobile
# o
ionic serve

# Ejecutar en dispositivo/emulador con live reload
ionic capacitor run android --livereload --external
ionic capacitor run ios --livereload --external
```

### Construcción para Android

**Debug Build**:
```bash
# Construir aplicación web
cd apps/mobile
pnpm build

# Sincronizar con Android
npx cap sync android

# Abrir en Android Studio
npx cap open android

# O construir desde línea de comandos
cd android
./gradlew assembleDebug

# APK generado en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Release Build**:
```bash
# 1. Construir aplicación web para producción
pnpm build --configuration=production

# 2. Sincronizar
npx cap sync android

# 3. Construir release
cd android
./gradlew assembleRelease

# APK generado en:
# android/app/build/outputs/apk/release/app-release.apk

# 4. Generar AAB (Android App Bundle) para Play Store
./gradlew bundleRelease

# AAB generado en:
# android/app/build/outputs/bundle/release/app-release.aab
```

**Verificar Firma**:
```bash
# Verificar que el APK esté firmado correctamente
jarsigner -verify -verbose -certs app-release.apk
```

### Construcción para iOS

**Debug Build**:
```bash
# Construir aplicación web
cd apps/mobile
pnpm build

# Sincronizar con iOS
npx cap sync ios

# Abrir en Xcode
npx cap open ios

# En Xcode:
# 1. Seleccionar dispositivo/simulador
# 2. Product → Run (Cmd+R)
```

**Release Build**:
```bash
# 1. Construir aplicación web para producción
pnpm build --configuration=production

# 2. Sincronizar
npx cap sync ios

# 3. Abrir en Xcode
npx cap open ios

# En Xcode:
# 1. Seleccionar "Any iOS Device (arm64)"
# 2. Product → Archive
# 3. Distribuir a App Store Connect o Ad Hoc
```

### TestFlight (iOS)

**Subir a TestFlight**:
1. Archivar en Xcode (Product → Archive)
2. Window → Organizer
3. Seleccionar archivo
4. Distribute App → App Store Connect
5. Upload
6. En App Store Connect → TestFlight → agregar testers

### Google Play Console (Android)

**Subir a Play Console**:
1. Generar AAB firmado (`bundleRelease`)
2. Ir a Google Play Console
3. Seleccionar app → Production/Testing
4. Create new release
5. Subir AAB
6. Completar información de release
7. Review → Start rollout

### Instalación Directa (Desarrollo)

**Android**:
```bash
# Instalar APK debug en dispositivo conectado
adb install android/app/build/outputs/apk/debug/app-debug.apk

# O usar gradlew
cd android
./gradlew installDebug
```

**iOS**:
- Usar Xcode → Run en dispositivo
- O usar herramientas como ios-deploy:
```bash
npm install -g ios-deploy
ios-deploy --bundle ios/App/build/Release-iphoneos/App.app
```

### Versioning

**Actualizar Versión**:

1. **package.json**:
```json
{
  "version": "1.1.0"
}
```

2. **Android** (`android/app/build.gradle`):
```gradle
defaultConfig {
    versionCode 2       // Incrementar en cada release
    versionName "1.1.0"
}
```

3. **iOS** (Xcode):
- General → Identity → Version: `1.1.0`
- General → Identity → Build: `2`

O en `Info.plist`:
```xml
<key>CFBundleShortVersionString</key>
<string>1.1.0</string>
<key>CFBundleVersion</key>
<string>2</string>
```

---

## Solución de Problemas

### Problemas Comunes de Android

**1. SDK no encontrado**:
```bash
# Verificar ANDROID_HOME
echo $ANDROID_HOME

# Debe apuntar a Android/Sdk
# Reinstalar si es necesario
```

**2. Gradle build failed**:
```bash
# Limpiar caché de Gradle
cd android
./gradlew clean

# Eliminar .gradle y rebuild
rm -rf .gradle
./gradlew build
```

**3. Capacitor sync failed**:
```bash
# Eliminar plataforma y re-agregar
npx cap remove android
npx cap add android
npx cap sync android
```

**4. Plugin no encontrado**:
```bash
# Reinstalar plugins de Capacitor
pnpm install
npx cap sync android
```

### Problemas Comunes de iOS

**1. CocoaPods error**:
```bash
# Actualizar CocoaPods
sudo gem install cocoapods

# Limpiar caché de pods
cd ios/App
rm -rf Pods
rm Podfile.lock
pod install --repo-update
```

**2. Xcode build failed**:
```bash
# Limpiar build folder
# En Xcode: Product → Clean Build Folder (Cmd+Shift+K)

# O desde terminal:
rm -rf ~/Library/Developer/Xcode/DerivedData
```

**3. Provisioning profile error**:
- Verificar que Bundle ID coincida en Xcode y Apple Developer
- Regenerar provisioning profile en developer.apple.com
- En Xcode: Signing & Capabilities → Download Manual Profiles

**4. "Untrusted Developer" en dispositivo**:
- Settings → General → VPN & Device Management
- Confiar en el certificado de desarrollo

### Problemas de Capacitor

**Doctor command**:
```bash
# Diagnosticar problemas de Capacitor
npx cap doctor

# Mostrará:
# - Versiones instaladas
# - Plugins configurados
# - Problemas detectados
```

**Live reload no funciona**:
```bash
# Verificar que dispositivo y PC estén en la misma red
# Usar IP local en lugar de localhost

# Android:
ionic capacitor run android --livereload --external --host=192.168.1.x

# iOS:
ionic capacitor run ios --livereload --external --host=192.168.1.x
```

**Plugins no cargan**:
```bash
# Verificar que plugins estén registrados
# Revisar android/app/src/main/java/.../MainActivity.java

# Debe contener:
import com.capacitorjs.plugins.camera.CameraPlugin;
// ... otros imports

add(CameraPlugin.class);
// ... otros plugins
```

### Logs y Debug

**Android Logs**:
```bash
# Ver logs en tiempo real
adb logcat

# Filtrar por tag
adb logcat | grep "Capacitor"

# Logs de Chrome DevTools
chrome://inspect
```

**iOS Logs**:
```bash
# En Xcode: View → Debug Area → Activate Console

# O usar console.app (macOS)
# Conectar dispositivo y filtrar por proceso "PagoPy"
```

**Web Inspector (Safari para iOS)**:
1. iOS: Settings → Safari → Advanced → Web Inspector (ON)
2. Conectar dispositivo al Mac
3. Safari → Develop → [Tu dispositivo] → [PagoPy]

---

## Recursos Adicionales

### Documentación Oficial

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Ionic Framework](https://ionicframework.com/docs)
- [Android Developers](https://developer.android.com)
- [Apple Developer](https://developer.apple.com/documentation/)

### Herramientas Útiles

- **Android Studio**: IDE para desarrollo Android
- **Xcode**: IDE para desarrollo iOS
- **Chrome DevTools**: Debug de WebView
- **Safari Web Inspector**: Debug de iOS WebView
- **Vysor**: Control remoto de dispositivos Android
- **Scrcpy**: Mirror y control de Android

### Comunidad

- [Capacitor Community Plugins](https://github.com/capacitor-community)
- [Ionic Forum](https://forum.ionicframework.com)
- [Stack Overflow - Capacitor Tag](https://stackoverflow.com/questions/tagged/capacitor)

---

**Versión**: 1.0.0
**Última actualización**: 2025-10-12
**Autor**: Equipo PagoPy
