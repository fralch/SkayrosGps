# Compilación de APK Release para SkayrosGps

Este documento describe los pasos necesarios para compilar la versión release del APK de SkayrosGps localmente.

## Requisitos Previos

### 1. Java Development Kit (JDK)
- Se requiere **JDK 17** (Recomendado para las versiones actuales de Expo y React Native).
- Puedes instalarlo desde:
  - OpenJDK: https://jdk.java.net/
  - Adoptium (recomendado): https://adoptium.net/
  - Amazon Corretto: https://aws.amazon.com/corretto/

### 2. Android SDK
- Asegúrate de tener instalado el Android SDK.
- La ruta típica es: `C:\Users\[USUARIO]\AppData\Local\Android\Sdk`

## Configuración del Entorno

### 1. Variables de entorno
Configura las siguientes variables de entorno:

```bash
ANDROID_HOME=C:\Users\[USUARIO]\AppData\Local\Android\Sdk
PATH=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin;%PATH%
```

Reemplaza `[USUARIO]` con tu nombre de usuario de Windows.

### 2. Java Home
Configura `JAVA_HOME` para apuntar a tu instalación de JDK. Si usas Android Studio (y Flutter), la ruta más fácil de usar en PowerShell es:
```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
```

### 3. Archivo local.properties
En el directorio `android/` del proyecto, crea o verifica el archivo `local.properties` con la ruta correcta del SDK:

```properties
sdk.dir=C:\\Users\\[USUARIO]\\AppData\\Local\\Android\\Sdk
```

## Compilación del APK Release

1. **Navega al directorio del proyecto:**
```bash
cd D:\CODE\Gutarra\SkayrosGps
```

2. **Instala las dependencias de Node.js (si no lo has hecho):**
```bash
npm install
```

3. **Genera el código nativo de Android (Prebuild):**
*Nota: Este paso es crucial en Expo para crear la carpeta `android` si es que no existe.*
```bash
npx expo prebuild --platform android
```

4. **Compila el APK release:**
Entra a la carpeta generada y ejecuta Gradle (usando `.\` en PowerShell de Windows):
```powershell
cd android
.\gradlew assembleRelease
```

## Resultado

- El APK release se generará en:
  `android/app/build/outputs/apk/release/app-release.apk`

- El APK estará firmado con el keystore debug (adecuado para pruebas, NO para producción).

## Notas Importantes

- **Primera compilación**: La primera vez puede tardar varios minutos mientras se descargan las dependencias.
- **Modificaciones futuras**: Si cambias el código, solo necesitas ejecutar `.\gradlew assembleRelease` nuevamente.
- **Versión de Gradle**: El proyecto usa Gradle 8.x, asegúrate de tener una versión compatible.
- **Problemas comunes**:
  - Si falla por falta de Java, verifica `JAVA_HOME` y que Java esté en el PATH.
  - Si falla por SDK, verifica `ANDROID_HOME` y el archivo `local.properties`.

## Ubicación de Archivos Generados

- **APK release**: `android/app/build/outputs/apk/release/app-release.apk`
- **Reporte de problemas**: `android/build/reports/problems/problems-report.html`

## Comandos Útiles

- Limpiar compilación: `.\gradlew clean`
- Verificar tareas disponibles: `.\gradlew tasks`

---

**Última actualización**: 2026-04-10  
**Autor**: Kilo (asistente de compilación)