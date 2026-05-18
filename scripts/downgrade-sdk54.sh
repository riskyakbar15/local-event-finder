#!/usr/bin/env bash
set -euo pipefail

echo "This script will downgrade the project to Expo SDK 54. Run this on a feature branch."

echo "Creating branch 'downgrade/sdk-54'..."
git checkout -b downgrade/sdk-54 || true

echo "Installing expo@~54.0.0..."
npm install expo@~54.0.0 --save

echo "Running expo install for SDK-compatible packages (may prompt)..."
npx expo install \
  expo-constants expo-device expo-font expo-image expo-linking expo-router \
  expo-splash-screen expo-status-bar expo-system-ui expo-web-browser \
  react-native-gesture-handler react-native-reanimated react-native-safe-area-context \
  react-native-screens

echo "Optional: If you use these packages, run expo install for them as well: expo-auth-session expo-location react-native-maps"

echo "Installing node modules..."
npm install

echo "Clearing Expo Metro cache..."
npx expo start -c & sleep 3; kill $!

echo "Downgrade script completed. Please run the app and fix any API incompatibilities."

echo "Suggested next steps:"
echo "  1) Run the app on simulator/device and test auth, maps, location flows."
echo "  2) Inspect package.json for any remaining ~55.* expo packages and adjust as needed."
echo "  3) Commit changes: git add package.json package-lock.json && git commit -m \"chore(sdk): downgrade to Expo SDK 54 (scripted)\""
