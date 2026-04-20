#!/usr/bin/env bash
set -euo pipefail

cd /workspace/mobile

if [ ! -f package.json ]; then
  echo "[ERROR] package.json not found in /workspace/mobile"
  exit 1
fi

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  echo "[INFO] Installing npm dependencies..."
  npm install
fi

echo "[INFO] Cleaning old local build artifacts..."
rm -rf .expo android/build android/.gradle

echo "[INFO] Ensuring native android project exists (expo prebuild)..."
npx expo prebuild --platform android --non-interactive

echo "[INFO] Building APK with Gradle..."
cd android
./gradlew --no-daemon clean assembleRelease

cd /workspace/mobile
mkdir -p artifacts /workspace/mobile-host/artifacts

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK_PATH" ]; then
  echo "[ERROR] APK not found at $APK_PATH"
  exit 1
fi

cp "$APK_PATH" "artifacts/app-release.apk"
cp "$APK_PATH" "/workspace/mobile-host/artifacts/app-release.apk"

echo "[SUCCESS] APK generated: /workspace/mobile/artifacts/app-release.apk"
echo "[SUCCESS] APK copied to host: /workspace/mobile-host/artifacts/app-release.apk"
