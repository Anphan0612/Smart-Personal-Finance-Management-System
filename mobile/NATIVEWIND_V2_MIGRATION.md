# NativeWind v4 → v2 Migration Guide

## ⚠️ Vấn đề chính

NativeWind v2 **KHÔNG hỗ trợ CSS variables** (`var(--color-primary)`). Tất cả colors phải là giá trị hardcoded.

---

## 🔧 Các bước cần làm

### 1. Cập nhật `tailwind.config.js`

**Trước (v4 - sử dụng CSS variables):**
```js
colors: {
  primary: {
    DEFAULT: 'var(--color-primary)',
    container: 'var(--color-primary-container)',
  }
}
```

**Sau (v2 - hardcoded colors):**
```js
colors: {
  primary: {
    DEFAULT: '#005ab4',
    container: '#0873df',
    on: '#ffffff',
  },
  // Dark mode colors sẽ xử lý thủ công trong code
}
```

### 2. Xóa hoặc đơn giản hóa `global.css`

NativeWind v2 không cần `global.css` với CSS variables. Bạn có thể:
- Xóa file `global.css` hoàn toàn
- Hoặc chỉ giữ lại `@tailwind` directives

**File mới:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Cập nhật `tailwind.config.js` với colors cụ thể

Thay thế toàn bộ section `colors` trong `tailwind.config.js`:

```js
colors: {
  primary: {
    DEFAULT: '#005ab4',
    container: '#0873df',
    on: '#ffffff',
  },
  secondary: {
    DEFAULT: '#465f89',
    container: '#b7cfff',
    on: '#ffffff',
  },
  tertiary: {
    DEFAULT: '#964400',
    container: '#bd5700',
    on: '#ffffff',
  },
  neutral: {
    DEFAULT: '#717785',
    variant: '#414753',
  },
  outline: {
    DEFAULT: '#717785',
    variant: '#c1c6d5',
  },
  ai: {
    primary: '#005ab4',
    'gradient-start': '#0040a2',
    'gradient-end': '#003d9b',
  },
  surface: {
    DEFAULT: '#f9f9ff',
    container: '#ecedf7',
    'container-low': '#f2f3fd',
    'container-lowest': '#ffffff',
    'container-high': '#e6e8f1',
    lowest: '#ffffff',
    low: '#f2f3fd',
    high: '#e6e8f1',
    on: '#181c22',
    'on-variant': '#414753',
  },
}
```

### 4. Dark Mode - Xử lý thủ công

NativeWind v2 không tự động xử lý `dark:` variant với CSS variables. Bạn có 2 lựa chọn:

#### Option A: Không dùng Dark Mode (Đơn giản nhất)
- Xóa tất cả `dark:` classes trong code
- Chỉ dùng light mode

#### Option B: Xử lý Dark Mode thủ công
```tsx
import { useColorScheme } from 'react-native';

function MyComponent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View className={isDark ? 'bg-[#101418]' : 'bg-[#f9f9ff]'}>
      {/* content */}
    </View>
  );
}
```

### 5. Cập nhật `babel.config.js`

Đảm bảo NativeWind v2 plugin được cấu hình đúng:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // ... other plugins
    ],
  };
};
```

### 6. Cập nhật `metro.config.js`

File hiện tại đã được đơn giản hóa và hoạt động tốt:

```js
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
```

---

## 🎨 Thay đổi trong Component Code

### Trước (v4):
```tsx
<View className="bg-primary dark:bg-primary-container">
  <Text className="text-surface-on dark:text-surface-on-variant">
    Hello
  </Text>
</View>
```

### Sau (v2 - Option A: Không dark mode):
```tsx
<View className="bg-primary">
  <Text className="text-surface-on">
    Hello
  </Text>
</View>
```

### Sau (v2 - Option B: Dark mode thủ công):
```tsx
const isDark = useColorScheme() === 'dark';

<View className={isDark ? 'bg-[#004a99]' : 'bg-[#005ab4]'}>
  <Text className={isDark ? 'text-[#e1e2e9]' : 'text-[#181c22]'}>
    Hello
  </Text>
</View>
```

---

## 📝 Checklist

- [ ] Cập nhật `tailwind.config.js` với hardcoded colors
- [ ] Đơn giản hóa `global.css`
- [ ] Xóa tất cả `dark:` variants (hoặc xử lý thủ công)
- [ ] Kiểm tra `babel.config.js`
- [ ] Test app trên Expo Go
- [ ] Kiểm tra tất cả màn hình chính

---

## 🚀 Sau khi hoàn thành

1. Xóa cache: `npm start -- -c`
2. Quét QR code trên Expo Go
3. Kiểm tra UI có hiển thị đúng không

---

## ⚡ Quick Fix (Nếu gấp)

Nếu bạn cần demo gấp và không có thời gian refactor:

1. Chỉ cập nhật `tailwind.config.js` với hardcoded colors
2. Xóa tất cả `dark:` variants trong code
3. Giữ nguyên light mode
4. Test nhanh trên Expo Go

Thời gian ước tính: **30-45 phút** cho toàn bộ dự án.
