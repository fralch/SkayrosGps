# Resumen de Diseño: Skayros GPS Tracking

Este documento describe la arquitectura, el diseño de la interfaz de usuario (UI) y la lógica subyacente de la aplicación móvil **SkayrosGps**.

## 1. Visión General
**SkayrosGps** es una aplicación móvil desarrollada con **React Native** y **Expo** utilizando **TypeScript**. Su propósito principal es permitir a los conductores o usuarios seleccionar el número de placa de un vehículo y transmitir su ubicación GPS en tiempo real (cada 5 segundos) a un servidor central.

## 2. Pila Tecnológica (Tech Stack)
*   **Framework:** React Native con Expo (v54).
*   **Lenguaje:** TypeScript.
*   **Dependencias Clave:**
    *   `expo-location`: Para solicitar permisos y obtener las coordenadas geográficas (latitud y longitud) del dispositivo.
    *   `@react-native-community/netinfo`: Para verificar la conectividad a Internet antes de intentar enviar datos.

## 3. Arquitectura y Estructura (Modular)
La aplicación ha sido refactorizada para seguir un enfoque **modular**, separando la lógica de negocio, el tema visual y los componentes de la interfaz. Esto facilita la escalabilidad para futuras funcionalidades.

*   `src/theme/`: Contiene `colors.ts` con la paleta de colores del diseño oscuro.
*   `src/hooks/`: Contiene la lógica separada de la vista.
    *   `useTracking.ts`: Gestiona permisos, estado de envío de ubicación, intervalo y mock de estadísticas.
    *   `usePlacas.ts`: Encapsula la obtención de la lista de placas desde la API.
*   `src/components/`: Módulos de la interfaz de usuario:
    *   `Header.tsx`: Barra superior con el logo.
    *   `StatusHeader.tsx`: Muestra el estado del sistema ("Ready to Dispatch").
    *   `PlateInput.tsx`: Módulo encargado de la entrada de texto y autocompletado de la placa.
    *   `TrackingButton.tsx`: Módulo con la lógica y diseño del botón de INICIAR/DETENER.
    *   `StatsGrid.tsx`: Muestra las tarjetas inferiores de estadísticas (Activos y Distancia).
*   `App.tsx`: Funciona como orquestador uniendo los hooks y componentes.

### Gestión de Estado (State Management)
El estado ahora se maneja de forma distribuida a través de Custom Hooks:
*   `placas`: Almacena la lista de placas disponibles (obtenidas de la API o datos de prueba).
*   `searchText` & `selectedPlaca`: Manejan la entrada del usuario y la selección final en el campo de autocompletado.
*   `showSuggestions`: Controla la visibilidad de la lista desplegable de placas.
*   `isTracking`: Booleano que indica si el envío de coordenadas está activo.
*   `isLoading`: Booleano para mostrar indicadores de carga durante operaciones asíncronas.

### Referencias (Refs)
Se utiliza `useRef` para mantener las referencias de los procesos en segundo plano sin provocar re-renderizados:
*   `trackingInterval`: Almacena el ID del intervalo (`setInterval`) que ejecuta el envío de coordenadas cada 5 segundos.
*   `locationSubscription`: Preparado para posibles implementaciones futuras de seguimiento continuo de ubicación mediante `watchPositionAsync`.

## 4. Diseño de Interfaz de Usuario (UI / UX)
La interfaz ha sido rediseñada adoptando un **Dark Theme** moderno, tecnológico y limpio, dividida en los siguientes módulos:

1.  **Encabezado (Header & Status):**
    *   Logo con estilo en verde neón (`#10B981`) y texto de estado "SYSTEM STATUS: OPTIMAL" en colores atenuados para no distraer.
2.  **Módulo de Placa (PlateInput):**
    *   Tarjeta principal con fondo azul muy oscuro (`#151C2C`).
    *   Un campo de entrada de texto oscuro (`#1C2536`) con un icono de escáner QR.
    *   Al escribir, se despliega una lista flotante de autocompletado sobre los demás elementos.
3.  **Módulo de Tracking (TrackingButton):**
    *   Botón verde brillante (`#10B981`) que destaca sobre el fondo oscuro para "START TRACKING", con texto negro para maximizar contraste.
    *   Cambia a rojo (`#EF4444`) para "STOP TRACKING" cuando el envío está activo.
4.  **Estadísticas Inferiores (StatsGrid):**
    *   Dos tarjetas adicionales mostrando métricas en tiempo real como "LIVE ASSETS" (con un indicador verde parpadeante) y "DIST. TODAY" en kilómetros.

## 5. Lógica de Negocio y Flujo de Ejecución

### 5.1. Inicialización
Al cargar la aplicación (`useEffect`), se ejecuta la función `fetchPlacas()` que intenta conectarse a `https://api.skayros.com/api/gps/track` (GET) para obtener las placas disponibles. Si falla, carga un arreglo de datos de prueba (Mock data).

### 5.2. Inicio del Tracking (`handleStartTracking`)
Cuando el usuario pulsa "INICIAR", ocurren las siguientes validaciones:
1.  **Validación de Placa:** Verifica que se haya seleccionado una placa válida.
2.  **Validación de Internet:** Usa `NetInfo` para comprobar si hay conexión a Internet.
3.  **Permisos de Ubicación:** Solicita a través de `Location.requestForegroundPermissionsAsync()` el permiso del usuario para usar el GPS.
4.  **Ejecución:** Si todo es correcto, se inicia un `setInterval` que ejecuta la función `sendCoordinates` cada 5000 milisegundos (5 segundos).

### 5.3. Envío de Coordenadas (`sendCoordinates`)
Cada 5 segundos, la función:
1.  Vuelve a verificar la conexión a Internet.
2.  Obtiene la posición actual con `Location.getCurrentPositionAsync()`.
3.  Construye un payload JSON con la placa, latitud, longitud y marca de tiempo (`timestamp`).
4.  Realiza una petición `POST` al endpoint de la API con los datos de ubicación.

### 5.4. Detención del Tracking (`handleStopTracking` / `stopTracking`)
Al pulsar "DETENER", se muestra un diálogo de confirmación (`Alert`). Si el usuario acepta:
1.  Se limpia el intervalo usando `clearInterval(trackingInterval.current)`.
2.  Se restablecen los estados (se apaga `isTracking`, se limpia la placa seleccionada y el texto de búsqueda).
