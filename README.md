# PricePing 🔔📈

> **Real-time crypto price alerts for React Native + Expo**

**PricePing** is a mobile cryptocurrency price-monitoring app built with **React Native and Expo**. It connects to Binance's real-time market stream, displays the latest cryptocurrency price, and lets users create alarms that trigger when the selected price reaches a user-defined target.

The app is designed around a simple idea:

**Choose a crypto → watch its live price → set an alarm → get notified when the target is reached.**

---

## ✨ Features

- 📡 **Real-time cryptocurrency prices**
  - Uses Binance's WebSocket market stream.
  - Price updates arrive without repeatedly polling a REST endpoint.

- 🔔 **Price alarms**
  - Create an alarm for a target price.
  - Supports:
    - `Above` — trigger when the price reaches or crosses above the target.
    - `Below` — trigger when the price reaches or crosses below the target.

- 🪙 **Crypto symbol support**
  - Connect to a Binance symbol such as `BTCUSDT`.
  - The app can reconnect if the WebSocket connection is interrupted.

- 💾 **Persistent alarms**
  - Alarms and app settings are stored locally using AsyncStorage.
  - Previously configured alarms can be restored when the app starts.

- 📱 **Notifications**
  - Uses `expo-notifications`.
  - Android notification channels are configured for price alerts.
  - Custom alarm sounds can be bundled with the native application.

- 🔊 **Custom alarm sounds**
  - Supports custom sounds such as `alarm1.mp3` and `alarm2.mp3`.
  - Sound behavior can be controlled from the app settings.

- ⚙️ **Settings**
  - Enable/disable alarm sounds.
  - Enable/disable notifications.
  - Manage notification permissions.

- 🟢 **Connection status**
  - Shows whether the Binance WebSocket is:
    - Connecting
    - Connected
    - Disconnected

- 📜 **Alarm history**
  - Active alarms can be distinguished from alarms that have already triggered.

---

## 🛠️ Tech Stack

| Technology                                  | Purpose                               |
| ------------------------------------------- | ------------------------------------- |
| React Native                                | Mobile application framework          |
| Expo                                        | React Native development platform     |
| Expo Router / React Navigation              | App navigation                        |
| TypeScript / JavaScript                     | Application development               |
| Binance WebSocket                           | Real-time crypto prices               |
| `@react-native-async-storage/async-storage` | Local persistence                     |
| `expo-notifications`                        | Notifications and alarm alerts        |
| EAS Build                                   | Android development/production builds |

---

## 📁 Project Structure

The exact structure may evolve as the project grows, but the application is organized around screens and reusable hooks.

```text
PricePing/
├── assets/
│   └── sounds/
│       ├── alarm1.mp3
│       └── alarm2.mp3
│
├── hooks/
│   ├── useBinanceBTCPrice.*
│   └── useNotifications.*
│
├── screens/
│   ├── Home.*
│   └── Settings.*
│
├── app.json / app.config.*
├── eas.json
├── package.json
└── README.md
```

> File names and folders may differ depending on the current branch of the project.

---

# 🚀 Getting Started

## Prerequisites

Before running PricePing locally, install:

### 1. Node.js

Install a current LTS version of Node.js.

Verify:

```bash
node --version
npm --version
```

### 2. Git

Verify:

```bash
git --version
```

### 3. Expo / EAS CLI

Install EAS CLI globally:

```bash
npm install --global eas-cli
```

Verify:

```bash
eas --version
```

### 4. Expo account

An Expo account is required for EAS cloud builds.

Create an account at:

https://expo.dev/signup

Then log in:

```bash
eas login
```

Verify the logged-in account:

```bash
eas whoami
```

---

# 📥 Installation

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
```

Move into the project:

```bash
cd PricePing
```

Install dependencies:

```bash
npm install
```

If the project uses another package manager, use the corresponding lockfile and package manager instead.

---

# ⚡ Running the App

For normal JavaScript development, start Expo with:

```bash
npx expo start
```

You can then use the development build to connect to the Metro bundler.

For a development build, use:

```bash
npx expo start --dev-client
```

Then open the application using the installed **PricePing development build**.

---

# 📱 Android Development Build

## Why a development build is required

PricePing uses native functionality provided by `expo-notifications`, including notification configuration and custom notification sounds.

For modern Expo SDK versions, push-notification functionality is not available through Expo Go on Android. A development build is therefore required when the application needs this native notification functionality.

Expo's documentation specifically recommends a development build for notification functionality that is unavailable in Expo Go.

Documentation:

https://docs.expo.dev/versions/latest/sdk/notifications/

---

# 🏗️ Create an Android Development Build

A new developer cloning this repository should follow these steps.

## Step 1 — Install dependencies

```bash
npm install
```

---

## Step 2 — Install EAS CLI

If EAS CLI is not already installed:

```bash
npm install --global eas-cli
```

Verify:

```bash
eas --version
```

---

## Step 3 — Log in to Expo

```bash
eas login
```

Check the account:

```bash
eas whoami
```

---

## Step 4 — Check `eas.json`

The project should contain an `eas.json` file with a development profile similar to:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

The important part for the Android development build is:

```json
"developmentClient": true
```

This tells EAS to create a development client rather than a normal production application.

Expo's EAS documentation describes the `development` profile as a profile intended for development builds and internal distribution.

Documentation:

https://docs.expo.dev/build/eas-json/

---

## Step 5 — Configure EAS if necessary

If `eas.json` does not exist yet, run:

```bash
eas build:configure
```

Follow the prompts and select the Android platform if requested.

This creates the EAS configuration required by the project.

---

## Step 6 — Create the Android development build

Run:

```bash
eas build --platform android --profile development
```

This is the primary command required to create the PricePing Android development build.

Expo's Android development-build documentation uses this same command for creating an installable development build.

Documentation:

https://docs.expo.dev/tutorial/eas/android-development-build/

---

## Step 7 — Wait for the build

EAS uploads the project and builds the Android application on Expo's build infrastructure.

You can monitor the build from the terminal and from the Expo dashboard.

When the build completes, EAS provides a build URL.

The development Android build is generated as an installable APK when the development profile is configured with `developmentClient: true` / internal distribution.

---

## Step 8 — Install the APK

Open the build URL on an Android device and install the generated APK.

You may need to allow installation from the browser or file manager when Android asks for permission.

Alternatively, download the APK to your computer and install it with Android Debug Bridge:

```bash
adb install path/to/PricePing.apk
```

Make sure USB debugging is enabled on the Android device.

---

# 🔄 Start the Development Server

After installing the development build, start Metro:

```bash
npx expo start --dev-client
```

The development build can then connect to the local Metro server.

For a physical Android device:

1. Connect the device and computer to the same network.
2. Start the development server.
3. Open PricePing.
4. Connect the application to the Metro development server.
5. Make code changes and reload the app.

---

# 🔔 Notifications Setup

PricePing uses `expo-notifications`.

The notification configuration is defined in the Expo application configuration.

A typical configuration for custom sounds looks like:

```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "sounds": ["./assets/sounds/alarm1.mp3", "./assets/sounds/alarm2.mp3"]
      }
    ]
  ]
}
```

The exact configuration should match the current `app.json` / `app.config.*` in the repository.

### Important

Notification plugin configuration is applied at **native build time**.

If you add, remove, or rename notification sounds, you must create a new Android build.

For example:

```bash
eas build --platform android --profile development
```

Simply restarting Metro does not update native notification resources.

Expo documentation:

https://docs.expo.dev/versions/latest/sdk/notifications/

---

# 🔊 Custom Alarm Sounds

Custom sounds are stored in:

```text
assets/sounds/
```

Example:

```text
assets/
└── sounds/
    ├── alarm1.mp3
    └── alarm2.mp3
```

If you add a new sound:

1. Put the audio file inside `assets/sounds/`.
2. Add its path to the `expo-notifications` plugin configuration.
3. Create a new development build.
4. Install the newly generated APK.
5. Test the notification channel and alarm.

### Android notification channels

Android notification channels are persistent once created. If you change a channel's sound configuration during development, Android may retain the previous channel configuration.

If a sound change appears to have no effect, remove the PricePing app from the device and install the newly built development APK again so the notification channels are recreated.

---

# 📡 Binance WebSocket

PricePing receives real-time trade information from Binance through a WebSocket connection.

The payload contains the latest trade price.

The application reads the price and updates the UI in real time.

### Important

PricePing is a **market monitoring and alert application**.

It does **not** execute trades, place orders, buy cryptocurrency, sell cryptocurrency, or manage Binance trading accounts.

---

# 🚨 How Price Alarms Work

A user creates an alarm by specifying:

```text
Symbol
Target Price
Direction
```

For example:

```text
BTCUSDT
Target: 110000
Direction: Above
```

The application continuously observes the live price.

If the price reaches the entered limit, the alarm is triggered.

After an alarm is triggered, it can be moved from the active-alarm state to the alarm history/past-alarm state depending on the application's current implementation.

---

# 💾 Local Storage

PricePing uses AsyncStorage for local persistence.

Typical persisted data includes:

- Price alarms
- Alarm settings
- Sound preference
- Notification preference

This means users do not need an internet connection merely to retain previously saved local settings.

However, a network connection is required to receive live Binance market prices.

---

# 🌐 Network Requirements

PricePing requires an internet connection for live market data.

If the connection is lost, the application reports a disconnected state and can attempt to reconnect.

For development, make sure the Android device has internet access.

---

# 🧪 Testing

Before submitting changes, test the following:

### WebSocket

- [ ] Application connects to Binance.
- [ ] Current price updates continuously.
- [ ] Connection status changes correctly.
- [ ] Reconnection works after a temporary network interruption.

### Alarms

- [ ] Above alarm can be created.
- [ ] Below alarm can be created.
- [ ] Alarm appears in active alarms.
- [ ] Triggered alarms are handled correctly.
- [ ] Alarm can be deleted.
- [ ] Multiple alarms behave independently.

### Notifications

- [ ] Notification permission can be requested.
- [ ] Notification appears when enabled.
- [ ] Notification is not shown when notifications are disabled.
- [ ] Alarm sound works when sound is enabled.
- [ ] Custom sound is correctly bundled into the native build.

### Persistence

- [ ] Alarms survive an application restart.
- [ ] Settings survive an application restart.
- [ ] Deleted alarms remain deleted after restart.

---

# 🐛 Troubleshooting

## `eas: command not found`

Install EAS CLI:

```bash
npm install --global eas-cli
```

Then:

```bash
eas login
```

---

## Expo Go does not show notifications

For Android projects using modern Expo SDK versions, notification functionality requiring native capabilities is not available through Expo Go.

Create and install the development build:

```bash
eas build --platform android --profile development
```

Then start:

```bash
npx expo start --dev-client
```

---

## Custom notification sound is not playing

Check:

1. The sound file exists.
2. The file path in `app.json` / `app.config.*` is correct.
3. The sound is included in the `expo-notifications` plugin configuration.
4. A new development build was created after changing the configuration.
5. The application was reinstalled if Android retained an old notification channel.
6. The device is not in a mode that suppresses notification sounds.

Example:

```json
[
  "expo-notifications",
  {
    "sounds": ["./assets/sounds/alarm1.mp3", "./assets/sounds/alarm2.mp3"]
  }
]
```

---

## WebSocket says `disconnected`

Check:

- Internet connection.
- Binance availability.
- WebSocket URL.
- Device network restrictions.
- Whether the application is being backgrounded by Android.
- Console logs for WebSocket errors.

---

## Build fails on EAS

First try:

```bash
npx expo-doctor
```

Then check the EAS build logs.

You can also clear the EAS build cache when troubleshooting:

```bash
eas build --platform android --profile development --clear-cache
```

Only use `--clear-cache` when necessary because it can make the build take longer.

---

# 🧹 Useful Commands

### Start Expo

```bash
npx expo start
```

### Start with development client

```bash
npx expo start --dev-client
```

### Check project health

```bash
npx expo-doctor
```

### Configure EAS

```bash
eas build:configure
```

### Android development build

```bash
eas build --platform android --profile development
```

### Android development build with cleared cache

```bash
eas build --platform android --profile development --clear-cache
```

### Android production build

```bash
eas build --platform android --profile production
```

### Check EAS account

```bash
eas whoami
```

### View builds

```bash
eas build:list
```

---

# 📦 Development vs Production

| Build       | Purpose                       | Typical command                                      |
| ----------- | ----------------------------- | ---------------------------------------------------- |
| Development | Local development and testing | `eas build --platform android --profile development` |
| Preview     | Internal testing/distribution | `eas build --platform android --profile preview`     |
| Production  | Store/release build           | `eas build --platform android --profile production`  |

A development build contains the development client and is intended for development rather than Play Store distribution.

For Google Play distribution, Android production builds normally use an `.aab` rather than an installable `.apk`.

---

# 🔐 Environment & Secrets

Do not commit sensitive credentials, private API keys, signing credentials, or personal access tokens to Git.

Use environment variables / EAS environment variables where appropriate.

Never commit:

```text
.env
.env.local
*.keystore
*.jks
google-services.json
```

unless a particular file is intentionally public and the project's security requirements explicitly allow it.

Always review `.gitignore` before pushing the repository.

---

# ⚠️ Important Notes

### Price data

Cryptocurrency prices are volatile and can change rapidly.

PricePing is a monitoring and alerting application. It does not provide financial advice and does not execute trades.

### Binance connectivity

The application depends on Binance's WebSocket service for real-time market data. Availability and connectivity may change independently of PricePing.

### Notifications

Notification delivery and sound behavior can be affected by:

- Android notification permissions
- Notification channels
- Device sound settings
- Do Not Disturb / Focus modes
- Battery optimization
- Background execution restrictions
- Operating-system behavior

Therefore, users should not treat an alert as a guaranteed real-time trading signal.

---

# 🤝 Contributing

Contributions are welcome.

Recommended workflow:

```bash
git checkout -b feature/your-feature
```

Make your changes, test them locally, then commit:

```bash
git add .
git commit -m "Add your feature"
```

Push your branch:

```bash
git push origin feature/your-feature
```

Then open a pull request.

Before submitting a PR, make sure:

- The application builds successfully.
- Existing functionality still works.
- Notification behavior has been tested when relevant.
- No secrets have been committed.
- Code follows the existing project structure and conventions.

---

# 📚 Useful Documentation

- Expo: https://docs.expo.dev/
- Expo EAS Build: https://docs.expo.dev/build/introduction/
- Android development builds: https://docs.expo.dev/tutorial/eas/android-development-build/
- EAS configuration: https://docs.expo.dev/build/eas-json/
- Expo Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/
- EAS CLI: https://docs.expo.dev/eas/cli/
- Binance WebSocket Streams: https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams

---

# 📄 License

Add the project's license information here.

If this repository is not intended for redistribution, replace this section with the appropriate proprietary/private-project notice.

---

## 💙 PricePing

**Real-time prices. Simple alarms. No trading.**

Built with React Native + Expo.
