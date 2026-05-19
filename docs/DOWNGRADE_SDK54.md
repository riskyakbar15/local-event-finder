# Downgrade project to Expo SDK 54

This document describes a safe, reversible process to downgrade this project from Expo SDK 55 to SDK 54.

Important: Downgrading the SDK can introduce breaking changes. Do this on a feature branch and run full manual tests (auth, maps, location, build). Keep a backup commit/branch to revert if needed.

Steps

1. Create a branch

```bash
git checkout -b downgrade/sdk-54
```

1. Pin Expo SDK 54

Either update `package.json` manually or run:

```bash
npm install expo@~54.0.0 --save
```

This will update `package.json` to use Expo SDK 54.

1. Install SDK-compatible packages

Use `expo install` to ensure each Expo package gets a SDK-54 compatible version. Run for all expo packages used in this project:

```bash
npx expo install expo-constants expo-device expo-font expo-glass-effect expo-image expo-linking expo-router expo-splash-screen expo-status-bar expo-symbols expo-system-ui expo-web-browser expo-auth-session expo-location react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context
```

Note: `expo install` will pick versions compatible with the pinned `expo` SDK.

1. Install and clean

```bash
npm install
npx expo start -c
```

1. Test on device/simulator

- Run the app on iOS simulator or device.
- Verify authentication, map, and location flows.
- If using Expo Go on device, make sure it supports SDK 54 (App Store may have different versions); reinstall Expo Go if necessary.

1. Fix any code/API mismatches

Search for any APIs introduced in SDK 55 and replace or guard them. Typical areas:

- `expo-router` breakages (check router version)
- `react-native-reanimated` version mismatches
- Any package that changed behavior between SDKs

1. Commit and push

```bash
git add package.json package-lock.json
git commit -m "chore(sdk): downgrade to Expo SDK 54" -m "Pin expo to ~54.0.0 and install SDK-compatible packages; test app flows."
git push origin downgrade/sdk-54
```

1. If downgrade fails, revert

```bash
git checkout main
git reset --hard <commit-before-downgrade>
```

Notes & Recommendations

- Prefer building a development client via EAS (`eas build --profile development --platform ios`) as an alternative to downgrading SDK if you rely on modern SDK features.
- Run `npm audit` and run your test suite after downgrading.
- Keep the `docs/DOWNGRADE_SDK54.md` in repo as reference for team.

If you want, I can prepare an automated patch that runs `npm install expo@~54.0.0` and the `npx expo install ...` commands as a script file—shall I apply that patch now?
