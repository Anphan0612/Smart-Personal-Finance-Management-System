# Smart Finance Mobile - Environment Configuration Guide

## Quick Start Commands

### Clear Expo cache and restart (IMPORTANT after changing .env)

```bash
cd mobile
npx expo start -c
```

### Build for Android

```bash
cd mobile
npx expo run:android
```

### Build for iOS

```bash
cd mobile
npx expo run:ios
```

## API Configuration Options

Choose ONE of the following configurations based on your demo setup:

### Option 1: Cloudflare Tunnel (Recommended for external access)

```env
EXPO_PUBLIC_API_URL=https://your-tunnel-name.trycloudflare.com/api/v1
```

### Option 2: Local Network IP (For devices on same WiFi)

```env
EXPO_PUBLIC_API_URL=http://192.168.1.17:8080/api/v1
```

Replace `192.168.1.17` with your machine's actual IP address.

To find your IP:

- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

### Option 3: Android Emulator (localhost)

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api/v1
```

### Option 4: iOS Simulator (localhost)

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Important Notes

1. **Always clear cache after changing .env**: Run `npx expo start -c`
2. **Network switching**: If WiFi disconnects/reconnects, the app should auto-reconnect
3. **Fallback strategy**: Keep both Cloudflare URL and local IP ready to switch quickly during demo
