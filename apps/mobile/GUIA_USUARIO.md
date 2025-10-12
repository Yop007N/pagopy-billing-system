# PagoPy Mobile - Guía del Usuario

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Características Principales](#características-principales)
4. [Tareas Comunes](#tareas-comunes)
5. [Modo Sin Conexión (Offline)](#modo-sin-conexión-offline)
6. [Configuración de la Aplicación](#configuración-de-la-aplicación)
7. [Solución de Problemas](#solución-de-problemas)
8. [Preguntas Frecuentes](#preguntas-frecuentes)
9. [Soporte](#soporte)

---

## Introducción

**PagoPy Mobile** es una aplicación móvil completa para la gestión de ventas, facturación electrónica y pagos, diseñada específicamente para pequeñas y medianas empresas en Paraguay. La aplicación integra con los servicios locales como SET (e-Kuatia), SIPAP y pasarelas de pago como Bancard y Pagopar.

### Características Destacadas

- Gestión completa de ventas offline y online
- Facturación electrónica con integración SET (e-Kuatia)
- Sincronización automática de datos
- Gestión de clientes y productos
- Impresión de tickets vía Bluetooth
- Escaneo de códigos QR y de barras
- Captura de fotos de productos
- Notificaciones locales
- Modo oscuro

### Requisitos del Sistema

- **Android**: Versión 6.0 (API 23) o superior
- **iOS**: iOS 13.0 o superior
- **Espacio de Almacenamiento**: Mínimo 100 MB
- **Conexión a Internet**: Recomendada (funciona sin conexión con sincronización posterior)
- **Permisos Requeridos**:
  - Cámara (para fotos de productos y escaneo QR)
  - Almacenamiento (para guardar datos locales)
  - Bluetooth (para impresoras térmicas)
  - Notificaciones (para alertas de la app)

---

## Primeros Pasos

### 1. Instalación

#### Android
1. Descarga la aplicación desde Google Play Store
2. Busca "PagoPy" o accede al enlace directo proporcionado por tu administrador
3. Toca "Instalar"
4. Espera a que se complete la descarga e instalación
5. Toca "Abrir"

#### iOS
1. Descarga la aplicación desde App Store
2. Busca "PagoPy" o accede al enlace directo proporcionado por tu administrador
3. Toca "Obtener"
4. Autentica con Touch ID, Face ID o contraseña de Apple ID
5. Espera a que se complete la descarga e instalación
6. Toca "Abrir"

### 2. Primer Inicio

Al abrir la aplicación por primera vez:

1. **Pantalla de Bienvenida**: Verás el logo de PagoPy y una breve presentación
2. **Permisos**: Se te solicitarán permisos necesarios:
   - **Notificaciones**: Para recibir alertas de ventas y sincronización
   - **Cámara**: Para escanear productos y tomar fotos
   - **Bluetooth**: Para conectar con impresoras térmicas
   - **Almacenamiento**: Para guardar datos localmente

**Importante**: Aceptar estos permisos es fundamental para el funcionamiento completo de la aplicación.

### 3. Inicio de Sesión

#### Registro de Nueva Cuenta

Si es tu primera vez usando PagoPy:

1. En la pantalla de inicio de sesión, toca **"Crear cuenta"**
2. Completa el formulario de registro:
   - **Nombre completo**: Tu nombre y apellido
   - **Email**: Tu correo electrónico (será tu usuario)
   - **Contraseña**: Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números
   - **Confirmar contraseña**: Repite tu contraseña
   - **Teléfono**: Número de teléfono (opcional pero recomendado)
   - **RUC de la Empresa**: RUC de tu negocio
   - **Nombre de la Empresa**: Nombre comercial de tu negocio
3. Lee y acepta los **Términos y Condiciones**
4. Toca **"Registrarse"**
5. Revisa tu correo electrónico para verificar tu cuenta (si está habilitado)

#### Iniciar Sesión

Si ya tienes una cuenta:

1. Ingresa tu **correo electrónico**
2. Ingresa tu **contraseña**
3. (Opcional) Marca **"Recordar sesión"** para mantener la sesión iniciada
4. Toca **"Iniciar Sesión"**

#### ¿Olvidaste tu Contraseña?

1. En la pantalla de inicio de sesión, toca **"¿Olvidaste tu contraseña?"**
2. Ingresa tu correo electrónico registrado
3. Toca **"Enviar enlace de recuperación"**
4. Revisa tu correo electrónico y sigue las instrucciones para restablecer tu contraseña

### 4. Configuración Inicial

Después de iniciar sesión por primera vez, te recomendamos:

1. **Configurar tu Perfil**:
   - Ve a la pestaña **"Perfil"**
   - Completa tu información personal
   - Agrega una foto de perfil (opcional)

2. **Configurar Notificaciones**:
   - Ve a **"Configuración"** → **"Notificaciones"**
   - Activa las notificaciones que deseas recibir

3. **Configurar Sincronización**:
   - Ve a **"Configuración"** → **"Sincronización"**
   - Configura el intervalo de sincronización automática
   - Decide si sincronizar solo con WiFi

4. **Conectar Impresora (Opcional)**:
   - Ve a **"Configuración"** → **"Impresora Bluetooth"**
   - Sigue las instrucciones para conectar tu impresora térmica

---

## Características Principales

### Pantalla de Inicio (Home)

La pantalla principal muestra un resumen de tu negocio:

#### Estadísticas del Día
- **Ventas del Día**: Total de ventas realizadas hoy
- **Total Facturado**: Monto total facturado hoy
- **Clientes Atendidos**: Número de clientes únicos hoy
- **Ticket Promedio**: Promedio de compra por cliente

#### Accesos Rápidos
- **Nueva Venta**: Crear una venta rápidamente
- **Ver Facturas**: Acceder a tus facturas
- **Gestión de Clientes**: Administrar tu cartera de clientes
- **Catálogo de Productos**: Ver y editar productos

#### Estado de Sincronización
- **Indicador Verde**: Todos los datos sincronizados
- **Indicador Amarillo**: Hay ventas pendientes de sincronizar
- **Indicador Rojo**: Sin conexión (modo offline)
- **Número de Pendientes**: Cantidad de ventas sin sincronizar

#### Gráficos
- **Ventas de la Semana**: Gráfico de barras con ventas de los últimos 7 días
- **Productos Más Vendidos**: Top 5 de productos más vendidos

### Ventas (Sales)

Gestiona todas tus ventas desde aquí.

#### Lista de Ventas

**Ver tus Ventas**:
- Lista cronológica de todas tus ventas
- Cada venta muestra:
  - Número de venta
  - Fecha y hora
  - Cliente
  - Total
  - Estado (Completada, Pendiente, Cancelada)
  - Estado de sincronización

**Filtrar Ventas**:
- Toca el icono de filtro en la parte superior
- Filtra por:
  - Fecha (Hoy, Esta semana, Este mes, Personalizado)
  - Estado (Todas, Completadas, Pendientes, Canceladas)
  - Cliente específico
  - Rango de monto

**Buscar Ventas**:
- Usa la barra de búsqueda en la parte superior
- Busca por número de venta, nombre de cliente o producto

#### Crear Nueva Venta

1. Toca el botón **"+"** o **"Nueva Venta"**
2. **Seleccionar Cliente**:
   - Busca un cliente existente por nombre, RUC o CI
   - O toca **"+ Nuevo Cliente"** para crear uno nuevo
   - O selecciona **"Cliente General"** para venta sin cliente específico

3. **Agregar Productos**:
   - **Método 1: Búsqueda Manual**
     - Escribe el nombre del producto en la barra de búsqueda
     - Selecciona el producto de la lista

   - **Método 2: Escaneo de Código de Barras**
     - Toca el icono de cámara
     - Apunta al código de barras del producto
     - El producto se agregará automáticamente

   - **Método 3: Escaneo de Código QR**
     - Toca el icono de QR
     - Escanea el código QR del producto

4. **Configurar Cantidad y Descuento**:
   - Ajusta la cantidad usando los botones **+** y **-**
   - O ingresa la cantidad manualmente
   - Agrega un descuento si es necesario (% o monto fijo)

5. **Revisar el Total**:
   - El subtotal se calcula automáticamente
   - El IVA (10%) se calcula automáticamente
   - Verifica el total final

6. **Seleccionar Método de Pago**:
   - Efectivo
   - Tarjeta de Débito
   - Tarjeta de Crédito
   - Transferencia Bancaria
   - QR de Pago (Bancard/Pagopar)
   - Crédito

7. **Finalizar Venta**:
   - Toca **"Finalizar Venta"**
   - La venta se guarda localmente
   - Si hay conexión, se sincroniza automáticamente
   - Si no hay conexión, se sincronizará cuando vuelvas a estar online

8. **Opciones Post-Venta**:
   - **Imprimir Ticket**: Imprime un ticket de la venta
   - **Generar Factura**: Crea la factura electrónica
   - **Compartir**: Comparte los detalles de la venta
   - **Ver Detalles**: Revisa los detalles completos

#### Ver Detalles de una Venta

Toca cualquier venta en la lista para ver:
- Información del cliente
- Lista detallada de productos
- Totales y cálculos
- Método de pago
- Estado de sincronización
- Opciones:
  - Imprimir ticket
  - Generar factura
  - Enviar por WhatsApp
  - Editar (solo si no está sincronizada)
  - Cancelar venta

### Facturas (Invoices)

Gestiona tus facturas electrónicas integradas con SET (e-Kuatia).

#### Lista de Facturas

**Ver tus Facturas**:
- Lista de todas tus facturas
- Cada factura muestra:
  - Número de factura
  - Timbrado
  - CDC (Código de Control)
  - Cliente
  - Fecha de emisión
  - Monto total
  - Estado (Pendiente, Aprobada, Rechazada)

**Filtrar Facturas**:
- Por fecha
- Por estado (Pendiente, Aprobada, Rechazada, Cancelada)
- Por cliente
- Por rango de monto

**Buscar Facturas**:
- Por número de factura
- Por CDC
- Por nombre de cliente

#### Generar Factura

**Desde una Venta**:
1. Ve a los detalles de una venta completada
2. Toca **"Generar Factura"**
3. Verifica los datos del cliente (RUC, razón social, dirección)
4. Toca **"Generar Factura Electrónica"**
5. Espera la confirmación de SET
6. La factura aparecerá con estado "Aprobada" si todo es correcto

**Estado de las Facturas**:
- **Pendiente**: La factura está en proceso de envío a SET
- **Aprobada**: SET aprobó la factura, es válida
- **Rechazada**: SET rechazó la factura, revisar errores
- **Cancelada**: Factura anulada

#### Ver y Compartir Factura

1. Toca cualquier factura en la lista
2. Verás:
   - Datos completos de la factura
   - QR de verificación
   - KUDE (Representación gráfica)
   - CDC y datos de SET

3. Opciones disponibles:
   - **Descargar PDF**: Guarda el PDF de la factura
   - **Compartir**: Comparte la factura por WhatsApp, email, etc.
   - **Imprimir**: Imprime la factura
   - **Ver en SET**: Verifica la factura en el portal de SET
   - **Anular**: Solicita anulación de la factura (si está permitido)

### Clientes (Customers)

Administra tu cartera de clientes.

#### Lista de Clientes

**Ver tus Clientes**:
- Lista completa de clientes
- Cada cliente muestra:
  - Nombre completo o razón social
  - Tipo de documento (RUC, CI, Pasaporte)
  - Número de documento
  - Teléfono
  - Email

**Buscar Clientes**:
- Por nombre
- Por RUC o CI
- Por teléfono
- Por email

**Ordenar Clientes**:
- Por nombre (A-Z)
- Por fecha de creación
- Por última compra

#### Agregar Nuevo Cliente

1. Toca el botón **"+"** o **"Nuevo Cliente"**
2. Completa el formulario:

   **Información Básica**:
   - **Tipo de Cliente**: Persona física o Empresa
   - **Nombre/Razón Social**: Nombre completo o razón social
   - **Tipo de Documento**: RUC, CI o Pasaporte
   - **Número de Documento**: Ingresa el número sin puntos ni guiones

   **Información de Contacto**:
   - **Teléfono**: Número de celular o fijo
   - **Email**: Correo electrónico
   - **Dirección**: Dirección física
   - **Ciudad**: Ciudad de residencia

   **Notas** (Opcional):
   - Cualquier información adicional relevante

3. Toca **"Guardar"**

**Escanear Documento**:
- Al ingresar el documento, puedes tocar el icono de cámara
- La app escaneará y extraerá automáticamente el número de documento

#### Ver y Editar Cliente

1. Toca cualquier cliente en la lista
2. Verás:
   - Información completa del cliente
   - Historial de compras
   - Total gastado
   - Última compra

3. Opciones disponibles:
   - **Editar**: Modifica la información del cliente
   - **Nueva Venta**: Crea una venta para este cliente
   - **Ver Historial**: Revisa todas sus compras
   - **Llamar**: Llama al cliente (abre el marcador)
   - **WhatsApp**: Envía un mensaje de WhatsApp
   - **Email**: Envía un correo electrónico
   - **Eliminar**: Elimina el cliente (solo si no tiene ventas asociadas)

### Productos (Products)

Gestiona tu catálogo de productos.

#### Lista de Productos

**Ver tus Productos**:
- Lista completa del catálogo
- Cada producto muestra:
  - Foto del producto
  - Código del producto
  - Nombre
  - Precio de venta
  - Stock disponible
  - Estado (Activo/Inactivo)

**Buscar Productos**:
- Por nombre
- Por código
- Por código de barras
- Por categoría

**Filtrar Productos**:
- Por categoría
- Por estado (Activos/Inactivos)
- Con stock / Sin stock
- Por rango de precio

**Ordenar Productos**:
- Por nombre (A-Z)
- Por precio (Mayor/Menor)
- Por stock (Mayor/Menor)
- Por más vendidos

#### Agregar Nuevo Producto

1. Toca el botón **"+"** o **"Nuevo Producto"**
2. Completa el formulario:

   **Información Básica**:
   - **Código**: Código interno del producto (auto-generado o manual)
   - **Nombre**: Nombre descriptivo del producto
   - **Descripción**: Descripción detallada (opcional)
   - **Categoría**: Selecciona o crea una categoría

   **Precios e Inventario**:
   - **Precio de Costo**: Costo de adquisición
   - **Precio de Venta**: Precio al público
   - **Stock Inicial**: Cantidad en inventario
   - **Stock Mínimo**: Alerta de stock bajo

   **Códigos y Medidas**:
   - **Código de Barras**: Escanea o ingresa manualmente
   - **Unidad de Medida**: Unidad, Kg, Litro, etc.

   **Impuestos**:
   - **IVA**: Selecciona tasa (0%, 5%, 10%)

   **Foto del Producto**:
   - Toca **"Tomar Foto"** para usar la cámara
   - Toca **"Desde Galería"** para seleccionar una imagen existente

3. Toca **"Guardar"**

#### Ver y Editar Producto

1. Toca cualquier producto en la lista
2. Verás:
   - Información completa del producto
   - Historial de ventas
   - Estadísticas de ventas
   - Movimientos de inventario

3. Opciones disponibles:
   - **Editar**: Modifica la información del producto
   - **Actualizar Stock**: Ajusta el inventario
   - **Ver Historial**: Revisa todas las ventas de este producto
   - **Cambiar Precio**: Modifica el precio de venta
   - **Activar/Desactivar**: Activa o desactiva el producto
   - **Eliminar**: Elimina el producto (solo si no tiene ventas asociadas)

### Perfil (Profile)

Gestiona tu cuenta y configuración personal.

#### Mi Perfil

**Ver y Editar Información Personal**:
- Foto de perfil
- Nombre completo
- Email (no editable)
- Teléfono
- Rol en la empresa

**Cambiar Contraseña**:
1. Toca **"Cambiar Contraseña"**
2. Ingresa tu contraseña actual
3. Ingresa tu nueva contraseña
4. Confirma la nueva contraseña
5. Toca **"Guardar"**

**Información de la Empresa**:
- RUC
- Nombre comercial
- Dirección
- Teléfono de contacto
- Email corporativo
- Logo de la empresa

#### Cerrar Sesión

1. Ve a la pestaña **"Perfil"**
2. Desplázate hasta el final
3. Toca **"Cerrar Sesión"**
4. Confirma que deseas cerrar sesión

**Importante**: Los datos sin sincronizar se mantendrán en el dispositivo y se sincronizarán cuando vuelvas a iniciar sesión.

---

## Tareas Comunes

### Realizar una Venta Rápida

**Escenario**: Cliente compra un producto, paga en efectivo, necesitas hacer la venta rápidamente.

1. En la pantalla de **Inicio**, toca **"Nueva Venta"**
2. Toca **"Cliente General"** (o busca el cliente si lo conoces)
3. Escanea el código de barras del producto o búscalo manualmente
4. Ajusta la cantidad si es necesario
5. Verifica el total
6. Selecciona **"Efectivo"** como método de pago
7. Toca **"Finalizar Venta"**
8. Opcionalmente, toca **"Imprimir Ticket"**

**Tiempo estimado**: 30-60 segundos

### Buscar una Venta Anterior

**Escenario**: Un cliente pide información sobre una compra anterior.

1. Ve a la pestaña **"Ventas"**
2. Usa la barra de búsqueda y escribe:
   - El nombre del cliente
   - El número de venta
   - El nombre de un producto

3. O usa los filtros:
   - Toca el icono de filtro
   - Selecciona el rango de fechas
   - Selecciona el cliente
   - Toca **"Aplicar"**

4. Encuentra la venta en la lista
5. Toca la venta para ver los detalles completos

### Actualizar el Inventario de un Producto

**Escenario**: Llegó nueva mercadería y necesitas actualizar el stock.

1. Ve a la pestaña **"Inicio"** y toca **"Catálogo de Productos"**
2. Busca el producto que necesitas actualizar
3. Toca el producto para abrir los detalles
4. Toca **"Actualizar Stock"**
5. Selecciona el tipo de movimiento:
   - **Entrada**: Agregar stock (compra, devolución de cliente)
   - **Salida**: Reducir stock (pérdida, daño, uso interno)
   - **Ajuste**: Corregir el stock (inventario físico)

6. Ingresa la cantidad
7. Agrega una nota explicativa (opcional pero recomendado)
8. Toca **"Guardar"**

El stock se actualizará inmediatamente.

### Generar y Enviar una Factura

**Escenario**: Completaste una venta y necesitas generar la factura electrónica.

1. Ve a la venta completada (en **Ventas**)
2. Toca **"Generar Factura"**
3. Verifica que el cliente tenga:
   - RUC completo
   - Razón social correcta
   - Dirección

4. Si falta información, toca **"Editar Cliente"** y complétala
5. Toca **"Generar Factura Electrónica"**
6. Espera la confirmación (puede tardar 10-30 segundos)
7. Una vez aprobada, toca **"Compartir"**
8. Selecciona **"WhatsApp"** o **"Email"**
9. Selecciona el contacto del cliente
10. Envía el mensaje con la factura adjunta

### Imprimir un Ticket de Venta

**Escenario**: El cliente necesita un comprobante impreso.

**Requisito Previo**: Debes tener una impresora Bluetooth configurada (ver [Configurar Impresora Bluetooth](#configurar-impresora-bluetooth)).

1. Ve a los detalles de la venta
2. Toca **"Imprimir Ticket"**
3. Si la impresora está conectada, el ticket se imprimirá automáticamente
4. Si la impresora no está conectada:
   - Toca **"Conectar Impresora"**
   - Selecciona tu impresora de la lista
   - Espera a que se conecte
   - Toca **"Imprimir"** nuevamente

**Contenido del Ticket**:
- Logo y nombre de la empresa
- RUC de la empresa
- Número de venta
- Fecha y hora
- Nombre del vendedor
- Cliente (si no es general)
- Detalle de productos
- Subtotal
- IVA (10%)
- Total
- Método de pago
- "Gracias por su compra"

### Trabajar Sin Conexión (Offline)

**Escenario**: Estás en un lugar sin internet o la conexión es inestable.

La app **funciona completamente sin conexión**:

1. **Crear Ventas Offline**:
   - Todas las ventas se guardan localmente
   - El indicador mostrará "Modo Offline"
   - El número de ventas pendientes aumentará

2. **Ver Productos y Clientes**:
   - Los datos se cargan desde el almacenamiento local
   - Puedes buscar y ver toda la información

3. **Sincronización Automática**:
   - Cuando recuperes la conexión, la app sincronizará automáticamente
   - Verás una notificación: "Sincronizando X ventas..."
   - Una vez completada: "X ventas sincronizadas correctamente"

4. **Verificar Estado**:
   - Ve a **Configuración** → **Sincronización**
   - Verás el estado de sincronización
   - Puedes forzar una sincronización manual con **"Sincronizar Ahora"**

**Limitaciones en Modo Offline**:
- No se pueden generar facturas electrónicas (requiere conexión a SET)
- No se pueden actualizar los datos del catálogo desde el servidor
- No se pueden ver reportes en tiempo real del servidor

### Sincronizar Datos Manualmente

**Escenario**: Quieres asegurarte de que todos tus datos estén sincronizados.

1. Ve a **Configuración** → **Sincronización**
2. Verifica el estado actual:
   - **Última sincronización**: Fecha y hora
   - **Ventas pendientes**: Número de ventas sin sincronizar
   - **Estado**: Sincronizado / Pendiente / Sincronizando

3. Toca **"Sincronizar Ahora"**
4. Espera a que se complete la sincronización
5. Verás un mensaje de confirmación:
   - "X ventas sincronizadas correctamente"
   - "0 ventas pendientes"

**Consejo**: La sincronización automática está habilitada por defecto cada 5 minutos cuando hay conexión.

---

## Modo Sin Conexión (Offline)

PagoPy Mobile está diseñada para funcionar completamente sin conexión a internet.

### ¿Cómo Funciona el Modo Offline?

La aplicación almacena todos los datos necesarios localmente en tu dispositivo:

1. **Catálogo de Productos**: Se descarga y almacena localmente
2. **Lista de Clientes**: Se mantiene sincronizada en el dispositivo
3. **Ventas**: Se crean y almacenan localmente
4. **Configuración**: Se guarda en el dispositivo

### ¿Qué Puedes Hacer Sin Conexión?

**Completamente Funcional**:
- Crear ventas
- Agregar/editar clientes
- Buscar productos
- Ver historial de ventas locales
- Imprimir tickets (con impresora Bluetooth)
- Actualizar inventario

**Funcionalidad Limitada**:
- Generar facturas electrónicas (requiere conexión a SET)
- Sincronizar datos con el servidor
- Actualizar catálogo desde el servidor
- Ver reportes en tiempo real

### Indicadores de Estado de Conexión

**En la Barra Superior**:
- **Verde con WiFi**: Conectado a internet vía WiFi
- **Verde con señal celular**: Conectado vía datos móviles
- **Amarillo con alerta**: Conexión inestable
- **Rojo con X**: Sin conexión (Modo Offline)

**En la Pantalla de Inicio**:
- **"X ventas pendientes de sincronizar"**: Número de ventas creadas offline

### Sincronización de Datos

#### Sincronización Automática

La app sincroniza automáticamente cuando:
- Recuperas la conexión a internet
- Inicias la aplicación con conexión disponible
- Cada X minutos (configurable en Ajustes)
- Cuando la app regresa del segundo plano

#### Sincronización Manual

Puedes forzar una sincronización en cualquier momento:
1. Ve a **Configuración** → **Sincronización**
2. Toca **"Sincronizar Ahora"**
3. Espera a que se complete

#### Resolución de Conflictos

Si los mismos datos fueron modificados tanto en el dispositivo como en el servidor:

1. La app detectará el conflicto
2. Te mostrará una notificación
3. Por defecto, **los datos del servidor tienen prioridad**
4. Puedes cambiar esta configuración en **Ajustes** → **Sincronización** → **Estrategia de Conflictos**

### Mejores Prácticas para Trabajar Offline

1. **Sincroniza Regularmente**: Cuando tengas conexión, asegúrate de sincronizar
2. **WiFi Preferido**: Configura la app para sincronizar preferentemente con WiFi (ahorra datos móviles)
3. **Verifica el Estado**: Revisa regularmente el número de ventas pendientes
4. **Espacio de Almacenamiento**: Asegúrate de tener suficiente espacio en el dispositivo
5. **Batería**: Las sincronizaciones consumen batería, sincroniza cuando tengas buena carga

### Almacenamiento Local

**Capacidad**:
- La app puede almacenar miles de productos y clientes
- Las ventas offline se mantienen hasta 30 días después de ser sincronizadas
- Puedes ver el espacio usado en **Configuración** → **Almacenamiento**

**Limpiar Datos Antiguos**:
1. Ve a **Configuración** → **Almacenamiento**
2. Toca **"Limpiar Caché"**
3. Selecciona qué datos limpiar:
   - Ventas ya sincronizadas
   - Imágenes en caché
   - Logs antiguos

4. Toca **"Limpiar"**

---

## Configuración de la Aplicación

### Acceder a Configuración

1. Ve a la pestaña **"Perfil"**
2. Toca el icono de engranaje o **"Configuración"**

### Notificaciones

Configura qué notificaciones deseas recibir:

**Tipos de Notificaciones**:
- **Ventas Offline**: Te notifica cuando creas una venta sin conexión
- **Sincronización Completada**: Te avisa cuando los datos se sincronizan
- **Errores Críticos**: Te alerta sobre problemas importantes
- **Pagos Recibidos**: Te notifica cuando se confirma un pago
- **Stock Bajo**: Te avisa cuando un producto alcanza el stock mínimo

**Configuración de Sonido y Vibración**:
- **Sonido**: Activa/desactiva el sonido de las notificaciones
- **Vibración**: Activa/desactiva la vibración

**Cómo Configurar**:
1. Ve a **Configuración** → **Notificaciones**
2. Activa/desactiva cada tipo de notificación con el interruptor
3. Ajusta el sonido y vibración según tu preferencia

### Impresora Bluetooth

Conecta tu impresora térmica Bluetooth.

#### Configurar Impresora por Primera Vez

1. **Encender la Impresora**:
   - Asegúrate de que tu impresora está encendida
   - Verifica que tiene papel
   - Confirma que está en modo emparejamiento (consulta el manual de tu impresora)

2. **En la App**:
   - Ve a **Configuración** → **Impresora Bluetooth**
   - Toca **"Activar Impresora"**
   - Toca **"Buscar Impresoras"**

3. **Emparejar**:
   - Aparecerá una lista de dispositivos Bluetooth cercanos
   - Selecciona tu impresora (generalmente aparece como "TM-T20", "RPP300", etc.)
   - Si se solicita, ingresa el PIN (generalmente "0000" o "1234")

4. **Probar Conexión**:
   - Una vez conectada, toca **"Imprimir Prueba"**
   - Deberías ver un ticket de prueba impreso

5. **Configurar Papel**:
   - Selecciona el ancho de papel: **58mm** o **80mm**
   - Esto ajustará el formato de impresión

#### Impresoras Compatibles

PagoPy Mobile es compatible con impresoras térmicas ESC/POS:
- Epson TM series (TM-T20, TM-T88)
- Zebra ZD series
- Star Micronics TSP series
- Generic POS printers (con comandos ESC/POS)

#### Solucionar Problemas de Impresión

**La impresora no aparece en la lista**:
- Verifica que está encendida
- Asegúrate de que está en modo emparejamiento
- Reinicia el Bluetooth de tu dispositivo
- Acércate más a la impresora

**Se conecta pero no imprime**:
- Verifica que tiene papel
- Confirma que el ancho de papel está configurado correctamente
- Reinicia la impresora
- Desconecta y vuelve a conectar

**Impresión cortada o deformada**:
- Ajusta el ancho de papel en la configuración
- Verifica que el papel esté instalado correctamente

### Sincronización

Configura cómo y cuándo se sincronizan tus datos.

#### Opciones de Sincronización

**Auto-Sincronización**:
- **Activar/Desactivar**: Habilita la sincronización automática
- **Intervalo**: Elige cada cuánto sincronizar (15 min, 30 min, 1 hora, 3 horas)

**Sincronizar Solo con WiFi**:
- Activa esta opción para ahorrar datos móviles
- La sincronización solo ocurrirá cuando estés conectado a WiFi

**Sincronización al Iniciar**:
- Sincroniza automáticamente al abrir la app

**Sincronización en Segundo Plano**:
- Permite sincronizar aunque la app no esté abierta

**Estrategia de Conflictos**:
- **Servidor Gana**: Los datos del servidor sobrescriben los locales
- **Local Gana**: Los datos locales sobrescriben los del servidor
- **Manual**: Te pregunta en cada conflicto
- **Combinar**: Intenta fusionar los cambios (puede no siempre funcionar)

#### Sincronizar Ahora

Toca **"Sincronizar Ahora"** para forzar una sincronización inmediata.

### Apariencia

Personaliza el aspecto visual de la app.

#### Tema

Selecciona el tema de color:
- **Claro**: Fondo blanco, ideal para uso diurno
- **Oscuro**: Fondo negro, reduce la fatiga visual en ambientes oscuros
- **Sistema**: Sigue la configuración del sistema operativo

#### Idioma

Selecciona el idioma de la interfaz:
- **Español**: Idioma predeterminado
- **English**: English interface
- **Guaraní**: Avañe'ẽ (próximamente)

### Almacenamiento

Gestiona el espacio usado por la app.

#### Tamaño de Caché

Muestra cuánto espacio está usando la app:
- **Productos**: Imágenes y datos de productos
- **Clientes**: Información de clientes
- **Ventas**: Datos de ventas locales
- **Otros**: Logs y datos temporales

#### Limpiar Caché

Libera espacio eliminando datos temporales:
1. Toca **"Limpiar Caché"**
2. Revisa qué se eliminará
3. Confirma tocando **"Limpiar"**

**Importante**: Esto **NO** elimina ventas pendientes de sincronizar.

### Acerca de

Información sobre la aplicación:

- **Versión de la App**: Número de versión actual
- **Compilación**: Número de build
- **Última Actualización**: Fecha de la última actualización
- **Términos y Condiciones**: Lee los términos de uso
- **Política de Privacidad**: Lee la política de privacidad
- **Licencias**: Información de licencias de código abierto

---

## Solución de Problemas

### La App No Inicia

**Síntomas**: La app se cierra al abrirla o muestra pantalla en blanco.

**Soluciones**:
1. **Reiniciar el Dispositivo**:
   - Apaga y enciende tu teléfono completamente

2. **Borrar Caché de la App** (Android):
   - Ve a **Configuración del Teléfono** → **Apps** → **PagoPy**
   - Toca **"Almacenamiento"**
   - Toca **"Borrar Caché"** (no borres datos aún)
   - Intenta abrir la app

3. **Verificar Espacio de Almacenamiento**:
   - Asegúrate de tener al menos 100 MB libres
   - Elimina archivos innecesarios

4. **Reinstalar la App**:
   - Desinstala la app
   - Vuelve a instalarla desde la tienda
   - **Importante**: Asegúrate de haber sincronizado todos los datos antes

5. **Contactar Soporte**: Si nada funciona, contacta a soporte técnico

### No Puedo Iniciar Sesión

**Síntomas**: La app no acepta mi usuario y contraseña.

**Soluciones**:
1. **Verificar Credenciales**:
   - Confirma que el email esté escrito correctamente
   - Verifica que la contraseña sea correcta (mayúsculas/minúsculas importan)

2. **Restablecer Contraseña**:
   - Toca **"¿Olvidaste tu contraseña?"**
   - Sigue las instrucciones enviadas a tu email

3. **Verificar Conexión a Internet**:
   - El inicio de sesión requiere conexión
   - Verifica que tienes WiFi o datos móviles activos

4. **Esperar y Reintentar**:
   - Puede haber un problema temporal con el servidor
   - Espera unos minutos e intenta de nuevo

5. **Cuenta Bloqueada**:
   - Después de varios intentos fallidos, la cuenta se bloquea temporalmente
   - Espera 15 minutos o contacta a soporte

### La Sincronización No Funciona

**Síntomas**: Las ventas quedan en "Pendiente" y no se sincronizan.

**Soluciones**:
1. **Verificar Conexión a Internet**:
   - Asegúrate de tener conexión activa
   - Verifica que puedes navegar en el navegador

2. **Revisar Estado del Servidor**:
   - El servidor puede estar en mantenimiento
   - Contacta a soporte para verificar

3. **Forzar Sincronización Manual**:
   - Ve a **Configuración** → **Sincronización**
   - Toca **"Sincronizar Ahora"**

4. **Revisar Logs de Sincronización**:
   - Ve a **Configuración** → **Sincronización** → **Ver Logs**
   - Revisa si hay errores específicos
   - Anota el mensaje de error y contacta a soporte

5. **Verificar Permisos**:
   - Ve a **Configuración del Teléfono** → **Apps** → **PagoPy** → **Permisos**
   - Asegúrate de que todos los permisos necesarios estén otorgados

### La Impresora No Se Conecta

**Síntomas**: No puedo conectar mi impresora Bluetooth.

**Soluciones**:
1. **Verificar la Impresora**:
   - Confirma que está encendida
   - Verifica que tiene batería o está conectada a corriente
   - Asegúrate de que tiene papel

2. **Verificar Bluetooth del Teléfono**:
   - Ve a **Configuración del Teléfono** → **Bluetooth**
   - Verifica que Bluetooth está activado
   - Desactiva y reactiva Bluetooth

3. **Olvidar y Re-emparejar**:
   - En **Configuración del Teléfono** → **Bluetooth**
   - Busca la impresora en dispositivos emparejados
   - Toca el icono de información y selecciona **"Olvidar"**
   - Vuelve a buscarla y empareja desde la app

4. **Reiniciar Impresora**:
   - Apaga la impresora completamente
   - Espera 10 segundos
   - Enciéndela de nuevo
   - Vuelve a intentar conectar

5. **Verificar Compatibilidad**:
   - Confirma que tu impresora es compatible (ESC/POS)
   - Consulta el manual de la impresora

6. **Actualizar Firmware de la Impresora**:
   - Algunos modelos requieren actualización de firmware
   - Consulta con el fabricante

### La Cámara No Funciona

**Síntomas**: No puedo escanear códigos QR o tomar fotos.

**Soluciones**:
1. **Verificar Permisos**:
   - Ve a **Configuración del Teléfono** → **Apps** → **PagoPy** → **Permisos**
   - Activa el permiso de **"Cámara"**

2. **Reiniciar la App**:
   - Cierra la app completamente (no solo minimizar)
   - Vuelve a abrirla

3. **Verificar que la Cámara Funciona**:
   - Abre la app de cámara nativa del teléfono
   - Verifica que funciona correctamente
   - Si no funciona, es un problema del hardware

4. **Limpiar Lente**:
   - Limpia el lente de la cámara con un paño suave

5. **Liberar Espacio**:
   - Asegúrate de tener espacio de almacenamiento suficiente
   - La app necesita espacio para guardar fotos temporalmente

### No Recibo Notificaciones

**Síntomas**: La app no muestra notificaciones de ventas o sincronización.

**Soluciones**:
1. **Verificar Permisos de Notificaciones**:
   - Ve a **Configuración del Teléfono** → **Apps** → **PagoPy** → **Notificaciones**
   - Activa todas las categorías de notificaciones

2. **Verificar Configuración en la App**:
   - Ve a **PagoPy** → **Configuración** → **Notificaciones**
   - Verifica que las notificaciones estén activadas

3. **Verificar Modo No Molestar**:
   - Asegúrate de que el teléfono no esté en modo No Molestar
   - O configura excepciones para PagoPy

4. **Optimización de Batería**:
   - En Android, ve a **Configuración** → **Batería** → **Optimización de batería**
   - Busca PagoPy y selecciona **"No optimizar"**

5. **Reiniciar el Teléfono**:
   - A veces un reinicio soluciona problemas de notificaciones

### Ventas Duplicadas

**Síntomas**: Aparece la misma venta dos veces en la lista.

**Causas**: Esto puede ocurrir si se pierde la conexión durante la sincronización.

**Soluciones**:
1. **Identificar Duplicados**:
   - Revisa el número de venta y la fecha/hora
   - Confirma que son idénticas

2. **Sincronizar Nuevamente**:
   - Ve a **Configuración** → **Sincronización** → **Sincronizar Ahora**
   - El sistema debería detectar y eliminar duplicados

3. **Contactar Soporte**:
   - Si persiste, contacta a soporte con:
     - Números de venta duplicados
     - Fecha y hora de creación
     - Capturas de pantalla

### Errores al Generar Facturas

**Síntomas**: La factura falla al generarse o SET la rechaza.

**Causas Comunes y Soluciones**:

1. **Error: "Cliente sin RUC"**:
   - El cliente debe tener un RUC válido para facturación electrónica
   - Edita el cliente y agrega el RUC completo

2. **Error: "Timbrado inválido o vencido"**:
   - El timbrado de tu empresa está vencido
   - Contacta a tu contador o administrador para renovarlo

3. **Error: "Sin conexión a SET"**:
   - Verifica tu conexión a internet
   - SET puede estar en mantenimiento (consulta su sitio web)

4. **Error: "Monto inválido"**:
   - Verifica que el monto total sea correcto
   - Asegúrate de que los productos tienen precios válidos

5. **Error: "CDC duplicado"**:
   - Esta venta ya fue facturada
   - Revisa en la lista de facturas

### Problemas de Rendimiento

**Síntomas**: La app funciona lenta o se congela.

**Soluciones**:
1. **Limpiar Caché**:
   - Ve a **Configuración** → **Almacenamiento** → **Limpiar Caché**

2. **Liberar Memoria**:
   - Cierra otras apps que estén abiertas
   - Reinicia el teléfono

3. **Verificar Espacio de Almacenamiento**:
   - Asegúrate de tener al menos 500 MB libres

4. **Actualizar la App**:
   - Verifica que tienes la última versión
   - Ve a la tienda de apps y actualiza si hay una versión nueva

5. **Reducir Datos en Caché**:
   - Si tienes muchos productos con imágenes, considera sincronizar menos frecuentemente
   - O descargar imágenes en menor resolución (en configuración avanzada)

---

## Preguntas Frecuentes

### ¿La app funciona sin internet?

**Sí**, PagoPy Mobile funciona completamente sin conexión. Puedes crear ventas, agregar clientes, buscar productos y más. Los datos se sincronizarán automáticamente cuando recuperes la conexión.

**Limitación**: No puedes generar facturas electrónicas sin conexión, ya que esto requiere comunicación con SET en tiempo real.

### ¿Cómo restablezco mi contraseña?

1. En la pantalla de inicio de sesión, toca **"¿Olvidaste tu contraseña?"**
2. Ingresa tu email registrado
3. Recibirás un correo con un enlace para restablecer tu contraseña
4. Haz clic en el enlace y crea una nueva contraseña
5. Vuelve a la app e inicia sesión con la nueva contraseña

### ¿Puedo usar la app en varios dispositivos?

**Sí**, puedes iniciar sesión en varios dispositivos con la misma cuenta. Los datos se sincronizan entre todos los dispositivos.

**Importante**: Asegúrate de sincronizar regularmente para mantener los datos actualizados en todos los dispositivos.

### ¿Cómo actualizo el catálogo de productos?

El catálogo se actualiza automáticamente durante la sincronización. Si agregas productos desde la app web o desde otro dispositivo, se descargarán a tu dispositivo móvil en la próxima sincronización.

**Manual**: Puedes forzar la actualización yendo a **Configuración** → **Sincronización** → **Sincronizar Ahora**.

### ¿Qué pasa si elimino la app?

Si desinstalas la app:
- **Datos Sincronizados**: Están seguros en el servidor
- **Datos No Sincronizados**: Se perderán

**Recomendación**: Antes de desinstalar, asegúrate de sincronizar todos los datos:
1. Ve a **Configuración** → **Sincronización**
2. Verifica que no haya ventas pendientes
3. Toca **"Sincronizar Ahora"** si es necesario
4. Confirma que todo esté sincronizado (0 ventas pendientes)
5. Ahora puedes desinstalar la app de forma segura

### ¿Puedo cambiar el RUC de mi empresa?

No puedes cambiar el RUC directamente desde la app móvil. Este es un dato crítico vinculado a la facturación electrónica.

**Solución**: Contacta a tu administrador o a soporte técnico para cambiar el RUC de tu empresa.

### ¿Cómo agrego otro vendedor?

Los vendedores se gestionan desde la aplicación web (panel de administración).

**Proceso**:
1. Inicia sesión en la web de PagoPy (https://app.pagopy.py)
2. Ve a **Configuración** → **Usuarios**
3. Toca **"Agregar Usuario"**
4. Completa los datos del nuevo vendedor
5. Asigna el rol **"Vendedor"**
6. El nuevo usuario recibirá un email con instrucciones para activar su cuenta
7. Puede descargar la app móvil e iniciar sesión

### ¿Puedo personalizar el diseño del ticket?

Actualmente, el diseño del ticket es estándar. Futuras versiones incluirán opciones de personalización.

**Lo que sí puedes hacer**:
- El nombre y logo de tu empresa aparecen automáticamente
- El RUC y datos de contacto se incluyen
- El formato se adapta al ancho de papel (58mm o 80mm)

### ¿La app consume muchos datos móviles?

No, el consumo de datos es mínimo:
- **Sincronización de ventas**: ~1-5 KB por venta
- **Descarga de catálogo**: ~50-200 KB (depende del número de productos)
- **Imágenes de productos**: ~20-100 KB por imagen (solo se descargan si es necesario)

**Promedio**: ~5-10 MB por mes con uso normal.

**Consejo**: Activa **"Sincronizar solo con WiFi"** en configuración para ahorrar datos móviles.

### ¿Es segura la app?

**Sí**, PagoPy implementa múltiples medidas de seguridad:
- **Encriptación**: Todos los datos se transmiten con HTTPS/TLS
- **Almacenamiento Local**: Los datos sensibles se encriptan en el dispositivo
- **Autenticación**: Tokens JWT con expiración automática
- **Sesiones**: Cierre de sesión automático después de inactividad (configurable)
- **Cumplimiento**: Cumple con las regulaciones de SET y normativas de privacidad

### ¿Qué hago si encuentro un error?

1. **Anota el Error**:
   - Toma una captura de pantalla
   - Anota qué estabas haciendo cuando ocurrió
   - Anota la hora exacta

2. **Intenta Soluciones Básicas**:
   - Cierra y vuelve a abrir la app
   - Sincroniza los datos
   - Verifica tu conexión a internet

3. **Revisa la Sección de Solución de Problemas**:
   - Busca tu error específico en este documento

4. **Contacta a Soporte**:
   - Email: soporte@pagopy.py
   - WhatsApp: +595 XXX-XXXXXX
   - Proporciona:
     - Descripción del error
     - Capturas de pantalla
     - Modelo de tu dispositivo
     - Versión de la app

---

## Soporte

### Canales de Soporte

**Email**: soporte@pagopy.py
- Tiempo de respuesta: 24-48 horas
- Mejor para: Problemas complejos, consultas técnicas

**WhatsApp**: +595 XXX-XXXXXX
- Horario: Lunes a Viernes, 8:00 AM - 6:00 PM
- Mejor para: Consultas rápidas, problemas urgentes

**Chat en Vivo** (desde la app web):
- Disponible en https://app.pagopy.py
- Horario: Lunes a Viernes, 9:00 AM - 5:00 PM

**Base de Conocimientos**:
- https://ayuda.pagopy.py
- Artículos, tutoriales, videos

### Antes de Contactar a Soporte

Para una respuesta más rápida, prepara la siguiente información:

1. **Versión de la App**: Ve a **Perfil** → **Configuración** → **Acerca de**
2. **Modelo del Dispositivo**: Modelo y sistema operativo (Android/iOS)
3. **Descripción del Problema**: Qué estabas haciendo, qué esperabas, qué ocurrió
4. **Capturas de Pantalla**: Si es posible
5. **Logs** (opcional): Ve a **Configuración** → **Avanzado** → **Exportar Logs**

### Actualizaciones y Mantenimiento

**Actualizaciones de la App**:
- Se publican regularmente con mejoras y correcciones
- Recibirás una notificación cuando haya una actualización disponible
- Actualiza desde Google Play Store o App Store

**Mantenimiento del Servidor**:
- Generalmente se realiza los domingos de 1:00 AM - 4:00 AM
- Se notificará con anticipación si hay mantenimiento programado

### Recursos Adicionales

**Tutoriales en Video**:
- Canal de YouTube: PagoPy Paraguay
- Playlist: Guía de Usuario Móvil

**Documentación Oficial**:
- https://docs.pagopy.py

**Comunidad**:
- Grupo de Facebook: PagoPy Usuarios Paraguay
- Comparte experiencias con otros usuarios

---

## Glosario

**CDC**: Código de Control. Identificador único de 44 caracteres generado por SET para cada factura electrónica.

**e-Kuatia**: Sistema de facturación electrónica de Paraguay administrado por SET.

**IVA**: Impuesto al Valor Agregado. En Paraguay es del 10% para la mayoría de productos.

**KUDE**: Representación gráfica de la factura electrónica.

**Modo Offline**: Funcionamiento de la app sin conexión a internet.

**RUC**: Registro Único de Contribuyente. Número de identificación fiscal en Paraguay.

**SET**: Subsecretaría de Estado de Tributación. Entidad que administra el sistema de facturación electrónica en Paraguay.

**Sincronización**: Proceso de actualizar datos entre el dispositivo móvil y el servidor.

**Ticket**: Comprobante impreso de una venta (no es factura electrónica).

**Timbrado**: Autorización de SET para emitir facturas. Tiene número y fecha de vencimiento.

---

## Notas Finales

Esta guía se actualiza regularmente con cada nueva versión de PagoPy Mobile. Consulta la versión más reciente en la app o en nuestro sitio web.

**Última Actualización**: Octubre 2025
**Versión del Documento**: 1.0.0
**Versión de la App**: 1.0.0

¡Gracias por usar PagoPy Mobile!
