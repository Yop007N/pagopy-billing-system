import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'py.pago.app',
  appName: 'PagoPy',
  webDir: 'www',

  // Server configuration
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // Allow navigation to these domains
    allowNavigation: [
      'api.pagopy.py',
      'localhost',
      '*.pagopy.py'
    ],
    // Clear text traffic for development (remove in production)
    cleartext: true
  },

  // Android specific configuration
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    },
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },

  // iOS specific configuration
  ios: {
    scheme: 'PagoPy',
    contentInset: 'always',
    limitsNavigationsToAppBoundDomains: true
  },

  // Plugin configurations
  plugins: {
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0033A0',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#FFCD00',
      splashFullScreen: true,
      splashImmersive: true
    },

    // Status Bar
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0033A0',
      overlaysWebView: false
    },

    // Keyboard
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },

    // Local Notifications
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#0033A0',
      sound: 'beep.wav'
    },

    // Push Notifications
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },

    // App
    App: {
      launchUrl: undefined
    },

    // Network
    Network: {
      // No specific configuration needed
    },

    // Storage
    Storage: {
      // No specific configuration needed
    },

    // Camera
    Camera: {
      // Allow camera access for product photos and document scanning
    },

    // File System
    Filesystem: {
      // No specific configuration needed
    },

    // Share
    Share: {
      // No specific configuration needed
    },

    // Dialog
    Dialog: {
      // No specific configuration needed
    },

    // Toast
    Toast: {
      // No specific configuration needed
    },

    // Haptics
    Haptics: {
      // No specific configuration needed
    },

    // Device
    Device: {
      // No specific configuration needed
    },

    // Browser
    Browser: {
      // No specific configuration needed
    },

    // Badge (for app icon badges)
    Badge: {
      // Automatically managed by the app
    },

    // Geolocation
    Geolocation: {
      // For location-based features (if needed)
    },

    // Bluetooth LE (for thermal printers)
    BluetoothLe: {
      displayStrings: {
        scanning: 'Buscando impresoras...',
        cancel: 'Cancelar',
        availableDevices: 'Dispositivos disponibles',
        noDeviceFound: 'No se encontraron impresoras'
      }
    },

    // Barcode Scanner (for product scanning)
    BarcodeScanner: {
      // No specific configuration needed
    }
  },

  // Cordova configuration (if using Cordova plugins)
  cordova: {
    preferences: {
      // Scroll settings
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',

      // Android preferences
      'android-minSdkVersion': '22',
      'android-targetSdkVersion': '33',
      'android-compileSdkVersion': '33',

      // iOS preferences
      'deployment-target': '13.0',
      'SwiftVersion': '5.0',

      // Orientation
      Orientation: 'portrait',

      // Security
      AllowInlineMediaPlayback: 'true',
      MediaPlaybackRequiresUserAction: 'false',

      // Performance
      EnableViewportScale: 'true',
      SuppressesIncrementalRendering: 'false',
      GapBetweenPages: '0',
      PageLength: '0'
    }
  },

  // Deep linking / App Links
  appLinks: {
    // Android App Links
    androidPackageName: 'py.pago.app',

    // iOS Universal Links
    iosAppId: 'TEAM_ID.py.pago.app',

    // Domains for deep linking
    domains: [
      'pagopy.py',
      'app.pagopy.py'
    ]
  }
};

export default config;
