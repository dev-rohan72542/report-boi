# Feature Implementation Plan (Refined)

This document outlines the plan for implementing three new features, refined with specific details from the existing codebase.

1.  **Google Authentication (Login/Sign-up) for Web and Android**
2.  **Fetching and Displaying Google Profile Details**
3.  **Making Scrollbars Invisible on Mobile**

---

## 1. Google Authentication & Profile Details (Web & Android)

Implementing Google Sign-In for a hybrid Capacitor app requires a different approach than a standard web application. We will use a native Google Sign-In flow on Android and the standard web-redirect flow for browsers.

### Phase A: Backend Configuration (User Action Required)

You must configure both Google Cloud and Supabase to handle authentication from your web app and your Android app.

**1. Configure Google Cloud Console:**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Go to **APIs & Services > Credentials**.
   - You will need to create **TWO** OAuth client IDs.

   **A. Web Application Client ID (for Web & Supabase):**
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - Application type: **Web application**.
   - Under **Authorized redirect URIs**, add your Supabase callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
   - Click **Create**. Copy the **Client ID** and **Client Secret**.

   **B. Android Client ID (for Capacitor App):**
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - Application type: **Android**.
   - **Package name:** From `capacitor.config.ts`, this is `com.reporttracker.app`.
   - **SHA-1 certificate fingerprint:** Generate this for your debug keystore by running:
     ```bash
     keytool -keystore "%USERPROFILE%\.android\debug.keystore" -list -v -alias androiddebugkey -storepass android -keypass android
     ```
   - Click **Create**.

**2. Configure Supabase:**
   - Go to your Supabase dashboard > **Authentication > Providers > Google**.
   - Enter the **Web Application Client ID** and **Client Secret** from step 1A.
   - **IMPORTANT:** Add the **Web Application Client ID** to the **Authorized Client IDs** field. This is required for the native token sign-in to work.
   - Enable the **Skip nonce check** option for the native mobile sign-in flow.
   - Click **Save**.

### Phase B: Hybrid App Implementation (My Action)

Once Phase A is complete, I will perform the following code changes.

**Task 1: Install and Configure Capacitor Google Auth Plugin**
   - **Action:** Install the community plugin for native Google Authentication.
     ```bash
     npm install @codetrix-studio/capacitor-google-auth
     npx cap sync
     ```
   - **File to Modify:** `capacitor.config.ts`
   - **Action:** Add the plugin configuration using the **Web Application Client ID** as the `serverClientId`.

     ```typescript
     // In capacitor.config.ts
     import { CapacitorConfig } from '@capacitor/cli';

     const config: CapacitorConfig = {
       appId: 'com.reporttracker.app',
       appName: 'ReportTracker',
       webDir: 'out',
       plugins: { // I will add this block
         GoogleAuth: {
           scopes: ['profile', 'email'],
           serverClientId: '<YOUR_WEB_APP_CLIENT_ID_FROM_STEP_1A>',
           forceCodeForRefreshToken: true,
         },
       },
     };

     export default config;
     ```

**Task 2: Create a Reusable Google Sign-In Component**
   - To avoid code duplication and manage the platform-specific logic cleanly, I will create a new, dedicated component.
   - **New File:** `components/google-sign-in-button.tsx`
   - **Action:** This component will:
     - Be a client component (`"use client";`).
     - Use the `useIsMobile` hook from `hooks/use-mobile.ts` to detect the platform.
     - On **mobile**, it will call `GoogleAuth.signIn()` and then `supabase.auth.signInWithIdToken()`.
     - On **web**, it will call the existing `supabase.auth.signInWithOAuth()` method.
     - It will use the `Button` component from `components/ui/button.tsx` for consistent styling.

**Task 3: Integrate the New Component**
   - **Files to Modify:** `app/auth/login/page.tsx` and `app/auth/sign-up/page.tsx`.
   - **Action:**
     - I will add the new `<GoogleSignInButton />` to the login page.
     - I will replace the existing, hardcoded Google button on the sign-up page with the new, functional `<GoogleSignInButton />` component.

**Task 4: Fetch and Display Google Profile Data**
   - The existing database trigger `002_create_profile_trigger.sql` will handle populating the `profiles` table.
   - **Files to Modify:**
      - `components/dashboard-header.tsx`: I will update this to show the user's email (already passed as a prop). I will add logic to display the user's avatar if available.
      - `app/dashboard/profile/page.tsx`: I will modify this page to fetch and display the user's `full_name` and `avatar_url` from their profile, replacing the current placeholder content.

---

## 2. Invisible Scrollbars on Mobile

This is a UI/CSS enhancement.

**Task 1: Add CSS Utility Class**
   - **File to Modify:** `app/globals.css`
   - **Action:** I will add the following utility classes to hide scrollbars:
     ```css
     .no-scrollbar::-webkit-scrollbar {
         display: none;
     }
     .no-scrollbar {
         -ms-overflow-style: none;  /* IE and Edge */
         scrollbar-width: none;  /* Firefox */
     }
     ```

**Task 2: Apply the Class**
   - **File to Modify:** `app/dashboard/layout.tsx`.
   - **Action:** The main content area is the `<main>` element. I will apply the `no-scrollbar` class to it, ensuring it only affects the mobile view by using responsive prefixes if necessary.

