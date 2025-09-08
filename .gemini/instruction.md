You are an expert software developer specializing in hybrid mobile app development with Next.js and Capacitor. Your task is to take over a project at the final stage of its conversion into an Android APK.

First, gain complete context by carefully reading the provided project history files. These documents detail the entire development process, including UI design, offline architecture implementation, and troubleshooting steps.

## Phase 1: Context and Project Analysis

To begin, execute the following read commands to understand the project's journey:

`read 1.cursor_fix_error_and_start_dev_server.md`
`read 2.cursor_adapt_file_instructions_for_our.md`
`read 3.cursor_change_app_title_to.md`
`read 4.cursor_convert_app_to_android_apk_withouto.md`
`read 5.cursor_resolve_indexeddb_ssr_compatibil.md`

### Project Summary

The project is a 'Daily Life Tracker' web application named **'রিপোর্ট বই'**. It's built with **Next.js**, **Tailwind CSS**, and uses **Supabase** for the backend. The primary goal is to convert this web app into a fully functional, **offline-first Android APK** using the **Capacitor** framework. The local offline database is implemented with **IndexedDB** via the **Dexie.js** library.

---

## Phase 2: Progress and Current Status

A significant amount of work has been completed. Here is a summary of the key accomplishments:

### ✅ **What's Done:**

1.  **Complete UI Overhaul**: The application has been successfully redesigned into a dark-mode first, cyber-neon, glassmorphism dashboard.
2.  **Offline-First Architecture**: An entire offline data persistence layer has been built using IndexedDB (Dexie.js), including a `SyncManager` and `HybridDataService` to handle data synchronization between the local device and the Supabase backend.
3.  **SSR Compatibility Resolved**: The Next.js application, originally using Server-Side Rendering (SSR), has been converted to use client-side rendering (`\"use client\"`) across all pages to make it compatible with the browser-only IndexedDB API and enable static export (`next export`).
4.  **Capacitor Integration**: Capacitor has been initialized in the project, the Android platform has been added, and the Next.js static build output is correctly configured.
5.  **Build Environment Troubleshooting**: Initial build failures related to Java version conflicts have been addressed by forcing Gradle to use JDK 17.

### ❌ **The Immediate Roadblock:**

The final step of the APK build process failed. The logs indicate that **Gradle cannot find the Android SDK**, even though the user has downloaded the necessary **command-line tools**. The `android/local.properties` file, which points to the SDK location, is missing.

---

## Phase 3: Actionable Next Steps to Completion

Your mission is to resolve the final roadblock and successfully build the debug APK. Follow these steps precisely.

### **Step 1: Configure the Android SDK Path**
The user has downloaded the Android SDK command-line tools. Your first task is to locate them (assume they are in a standard location like `C:\\Android\\Sdk` or prompt the user if you cannot find it) and correctly configure the project.
   - **Action**: Create the `android/local.properties` file.
   - **Content**: Add the line `sdk.dir=<PATH_TO_SDK>`, ensuring the path uses double backslashes for Windows (e.g., `sdk.dir=C:\\Android\\Sdk`).

### **Step 2: Install Required SDK Packages**
The command-line tools alone are insufficient. You must use the SDK's package manager (`sdkmanager`) to install the necessary components for building an Android app.
   - **Action**: From the project root, execute the following commands to accept licenses and install the required tools and platform versions.
     ```powershell
     & 'C:\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat' --licenses
     & 'C:\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat' 'platform-tools' 'platforms;android-34' 'build-tools;34.0.0'
     ```

### **Step 3: Verify the Build Environment**
Before building, confirm that Gradle can now correctly identify both the JDK and the Android SDK.
   - **Action**: Navigate into the `android` directory and run a verification command.
     ```powershell
     cd android
     .\gradlew --version
     ```
   - **Expected Outcome**: The output should show that Gradle is using **JVM 17** and correctly reports the **Android SDK location**.

### **Step 4: Build the Debug APK**
With the environment correctly configured, proceed with the final build.
   - **Action**: While still in the `android` directory, execute the Gradle build command.
     ```powershell
     .\gradlew assembleDebug
     ```

### **Step 5: Report Success**
Upon a successful build, provide a final confirmation to the user.
   - **Action**: Announce that the build was successful and clearly state the exact path to the generated APK file, which is typically located at `android/app/build/outputs/apk/debug/app-debug.apk`.

Execute these steps to complete the project.