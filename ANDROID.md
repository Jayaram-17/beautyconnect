# Mobile deployment

Glowlist is a Capacitor app: one React codebase, packaged for Android and iOS. Its login and API routes are server-side, so the native apps load the deployed HTTPS version of the app rather than a bundled, offline-only build.

## 1. Deploy the web app

Create `.env.local` from `.env.example`, configure `DATABASE_URL`, then build the production app:

```powershell
npm run build
```

This project produces a Cloudflare-compatible Nitro build. Log in to your Cloudflare account, create a Worker with a public HTTPS URL, then deploy the generated build:

```powershell
npx wrangler login
npx nitro deploy --prebuilt
```

Open the deployed URL in a browser and test sign-in, search, booking, and profile updates. Set that exact HTTPS URL in `.env.local`:

```env
CAPACITOR_SERVER_URL=https://your-deployed-app.example.com
```

## 2. Build Android

Run these commands in PowerShell. The first line loads the deployment URL for Capacitor:

```powershell
. .\scripts\android-env.ps1
npm run android:sync
npm run android:open
```

In Android Studio, use **Build → Generate Signed Bundle / APK → Android App Bundle** to create the Play Store upload (`.aab`). Use a release APK only for direct distribution or testing.

For a debug APK from the command line:

```powershell
. .\scripts\android-env.ps1
npm run android:apk
```

The debug APK is created under `android\app\build\outputs\apk\debug\app-debug.apk`.

## 3. Build iOS

iOS signing and App Store uploads require macOS with Xcode and an Apple Developer account. Clone this repository on the Mac, add the same `.env.local` values, then run:

```bash
npm install
export CAPACITOR_SERVER_URL=https://your-deployed-app.example.com
npm run ios:sync
npm run ios:open
```

In Xcode, select the **App** target, set a unique bundle identifier and your signing team, test on a real device, then choose **Product → Archive**. Upload the archive through Xcode Organizer to App Store Connect, complete the listing/privacy information, and submit it for review.

## Release checklist

- Use a real production HTTPS URL in `CAPACITOR_SERVER_URL`; never use `localhost`.
- Keep `DATABASE_URL` only on the server/deployment platform. Do not place it in mobile app settings or commit `.env.local`.
- Register the final Android package name (`com.glowlist.app`) and iOS bundle identifier in the respective store consoles before release.
- Add store icons, screenshots, privacy policy, support email, and age/content declarations before submitting.
- Every time the web app changes: deploy it first, then run `android:sync` or `ios:sync` before producing a new native release.
