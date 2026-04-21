# Smart Utility Toolkit 🛠️

A beautiful, all-in-one mobile utility app built with **React Native**, **Expo Router**, and **TypeScript**. Featuring a dark/light theme system, onboarding flow, and 8+ functional tools.

---

## 📱 Screenshots & Features

### Screens
| Screen | Description |
|--------|-------------|
| **Onboarding** | Animated 4-slide intro shown on first launch |
| **Home** | Dashboard with tool grid and quick stats |
| **Unit Converter** | 8 categories (Length, Weight, Temp, Speed, Area, Volume, Data, Time) |
| **Smart Notes** | Create, edit, pin, color-code & search notes (AsyncStorage) |
| **Calculator** | Standard + Scientific mode with history |
| **Tools Hub** | BMI, Timer/Stopwatch, Currency Converter, Password Generator, QR Code, Color Picker |
| **Settings** | Dark/Light/System theme, accent color, preferences |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI for builds (`npm install -g eas-cli`)

### Install & Run

```bash
# Clone / unzip the project
cd SmartUtilityToolkit

# Install dependencies
npm install

# Start the dev server
npx expo start

# Run on Android emulator
npx expo run:android

# Run on iOS simulator (macOS only)
npx expo run:ios

# Run in web browser
npx expo start --web
```

---

## 🏗️ Build APK for Appetize

### Option A: EAS Build (Recommended — cloud build, no local Android SDK needed)

```bash
# 1. Login to Expo
eas login

# 2. Configure the project (only needed once)
eas build:configure

# 3. Build a preview APK
eas build --platform android --profile preview

# 4. Download the APK from the link printed in the terminal
#    OR from https://expo.dev → your project → Builds
```

### Option B: Local Android Build (requires Android Studio)

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build debug APK
cd android && ./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📤 Upload to Appetize.io

1. Go to **https://appetize.io/upload**
2. Click **"Upload APK"** and select your `.apk` file
3. Set **Platform** to Android, **OS Version** to Android 13+
4. Click **Upload**
5. After processing (1–2 min), copy your **public preview link**
6. Share the link for submission ✅

---

## 📁 Project Structure

```
SmartUtilityToolkit/
├── app/
│   ├── _layout.tsx              # Root layout: ThemeProvider + Onboarding + GestureHandler
│   ├── index.tsx                # Redirect → (tabs)
│   └── (tabs)/
│       ├── _layout.tsx          # Tab bar (6 tabs, theme-aware)
│       ├── index.tsx            # Home dashboard
│       ├── converter.tsx        # Unit Converter (8 categories)
│       ├── notes.tsx            # Smart Notes (AsyncStorage CRUD)
│       ├── calculator.tsx       # Calculator + Scientific mode
│       ├── tools.tsx            # BMI / Timer / Currency / Password / QR / Color
│       └── settings.tsx         # Theme, accent color, preferences
│
├── components/
│   ├── ui.tsx                   # Reusable: Button, Card, Badge, Toggle, SettingRow…
│   ├── OnboardingScreen.tsx     # 4-slide animated onboarding
│   ├── QRCodeTool.tsx           # Pure-JS QR code generator (no native deps)
│   └── ColorPickerTool.tsx      # HSL color picker + harmony + contrast
│
├── context/
│   └── ThemeContext.tsx         # Global theme: dark/light/system + accent color
│
├── constants/
│   └── theme.ts                 # Design tokens: Colors, Spacing, BorderRadius, FontSize
│
├── assets/images/               # App icon, splash, adaptive icon, favicon
├── app.json                     # Expo config
├── eas.json                     # EAS build profiles (preview APK / production AAB)
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## 🎨 Design System

### Color Palette
- **Primary:** `#6C63FF` (Purple — customizable in Settings)
- **Background Dark:** `#0F172A` | **Background Light:** `#F8FAFC`
- **Surface Dark:** `#1E293B` | **Surface Light:** `#FFFFFF`

### Typography Scale
```
xs: 11px  |  sm: 13px  |  base: 15px  |  md: 17px
lg: 20px  |  xl: 24px  |  xxl: 30px   |  display: 38px
```

### Spacing
```
xs: 4  |  sm: 8  |  md: 16  |  lg: 24  |  xl: 32  |  xxl: 48
```

---

## 🧩 Tool Modules

### 1. Unit Converter
- **8 Categories:** Length, Weight, Temperature, Speed, Area, Volume, Data Storage, Time
- Live quick-reference table (tap any row to set as target)
- Smooth category pill navigation

### 2. Smart Notes
- Full CRUD: create, read, update, delete
- 7 color themes per note
- Pin/unpin notes, real-time search
- Persisted with AsyncStorage

### 3. Calculator
- Standard arithmetic with operator precedence
- Scientific functions: sin, cos, tan, √, x², ln, log, π
- Calculation history (last 10 entries)
- Haptic feedback on button press

### 4. BMI Calculator
- Metric (kg/cm) and Imperial (lbs/in) modes
- Animated progress bar with category badge
- Reference table for all BMI categories

### 5. Stopwatch & Countdown Timer
- Stopwatch with unlimited lap tracking
- Countdown with configurable duration
- Start / Pause / Reset controls

### 6. Currency Converter
- 12 currencies: USD, EUR, GBP, JPY, NGN, CAD, AUD, CNY, INR, BRL, MXN, ZAR
- Instant conversion with rate display
- Swap currencies button

### 7. Password Generator
- Configurable length (4–64 characters)
- Toggle: uppercase, lowercase, numbers, symbols
- Visual strength indicator (Weak / Good / Strong)

### 8. QR Code Generator
- Pure JavaScript QR encoding — no native dependencies
- Customizable foreground & background colors
- Quick-fill presets (URL, text, mailto, phone)
- Share content via native share sheet

### 9. Color Picker
- HSL sliders (hue, saturation, lightness)
- HEX input with live preview
- Color values: HEX, RGB, HSL, CMYK — one-tap copy
- 8 preset palettes
- Tints & shades row
- Color harmony: complementary, triadic, analogous, split-complementary
- WCAG contrast ratio checker (AA / AAA)

---

## ⚙️ Settings

- **Theme Mode:** Light / Dark / System (follows device)
- **Accent Color:** 6 presets (purple, pink, teal, amber, blue, red)
- **Haptic Feedback:** toggle
- **Notifications:** toggle
- **Data Management:** export notes, clear all data
- **About:** version info, privacy policy, terms, rate the app

---

## 🔧 Tech Stack

| Tech | Version | Purpose |
|------|---------|---------|
| React Native | 0.74 | Core framework |
| Expo | 51 | Build toolchain |
| Expo Router | 3.5 | File-based navigation |
| TypeScript | 5.3 | Type safety |
| AsyncStorage | 1.23 | Local data persistence |
| react-native-safe-area-context | 4.10 | Safe area insets |
| react-native-gesture-handler | 2.16 | Touch gestures |
| react-native-reanimated | 3.10 | Animations |
| @expo/vector-icons | 14 | Ionicons icon set |

---

## 📝 License

MIT — free to use, modify, and distribute.

---

Built with ❤️ using React Native & Expo
