---
name: "expo-local-build"
description: "Asiste en la compilación local de APKs para Expo en Windows. Invocar cuando el usuario pida compilar un APK, tenga errores de Java/SDK o pregunte cómo generar builds locales."
---

# Skill: Compilación Local de Expo (Windows)

Esta habilidad dota al LLM de las instrucciones exactas y detalladas para ayudar al usuario a compilar proyectos de React Native Expo en un archivo APK usando su máquina local (Windows + PowerShell), sin depender de EAS en la nube.

## 🎯 Cuándo invocar este skill
- Cuando el usuario pregunte "¿Cómo compilo mi app de Expo en mi PC?".
- Cuando el usuario quiera generar un `.apk` o `.aab`.
- Cuando ocurran errores relacionados con `JAVA_HOME`, `ANDROID_HOME`, o `SDK location not found` al compilar en React Native/Expo.
- Cuando el prebuild de Expo falle.

## 🛠️ Instrucciones paso a paso para el LLM

Al asistir al usuario, el LLM debe seguir este flujo lógico:

### Fase 1: Verificación del Entorno
Antes de compilar, el LLM debe pedir al usuario o ejecutar comandos para verificar:
1. **Node.js**: Instalado y con las dependencias del proyecto (`npm install`).
2. **JDK 17**: Requerido por las versiones modernas de React Native.
   - *Tip para el LLM*: Si el usuario tiene Android Studio (o Flutter), Java ya está en `C:\Program Files\Android\Android Studio\jbr`.
3. **Android SDK**: Generalmente en `C:\Users\[USUARIO]\AppData\Local\Android\Sdk`.

### Fase 2: Configuración de Variables (PowerShell)
Si el usuario tiene errores de que no se encuentra Java o el SDK, el LLM debe sugerir ejecutar estas variables en PowerShell antes de compilar:
```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME="$env:LOCALAPPDATA\Android\Sdk"
```
*(Nota: El LLM también puede sugerir crear el archivo `android/local.properties` con `sdk.dir=...` si prefiere una solución persistente para el SDK).*

### Fase 3: Generación de Código Nativo (Prebuild)
El LLM DEBE asegurarse de que la carpeta `android` exista. Si no existe, indicar este comando en la raíz del proyecto:
```bash
npx expo prebuild --platform android
```
*Si la consola advierte sobre `expo-system-ui`, indicar al usuario que es seguro ignorarlo para pruebas rápidas.*

### Fase 4: Compilación del APK
El LLM debe guiar al usuario a entrar a la carpeta y ejecutar Gradle:
```powershell
cd android
.\gradlew assembleRelease
```
*(Si el usuario necesita subir a la Google Play Store, el comando a sugerir es `.\gradlew bundleRelease` para generar un `.aab`).*

### Fase 5: Ubicación del Archivo
Una vez que el terminal muestre `BUILD SUCCESSFUL`, el LLM debe indicar exactamente dónde está el archivo resultante:
- **Ruta del APK**: `android/app/build/outputs/apk/release/app-release.apk`

## 💡 Resolución de Problemas Comunes (Troubleshooting)

Si el usuario pega un error de la terminal, el LLM debe usar esta base de conocimientos:
- **`SDK location not found`**: Falta la ruta del SDK. Solución: definir `$env:ANDROID_HOME` o crear `local.properties`.
- **`JAVA_HOME is not set` o `java command could be found`**: Falta Java en las variables. Solución: definir `$env:JAVA_HOME` apuntando al JDK 17 (o a la carpeta `jbr` de Android Studio).
- **Gradle o Kotlin incompatibles**: Si hay fallos extraños de Gradle, verificar que la versión de Java no sea ni muy vieja (11) ni demasiado nueva (21+) si la versión de React Native no la soporta aún. El estándar de oro es **JDK 17**.
