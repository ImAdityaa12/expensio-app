# Expensio - Expense Tracker App 💰

An Expo-based expense tracking app with automatic SMS expense detection.

## Features

- 📊 Track expenses manually or automatically from SMS
- 📈 Analytics and spending insights
- 🔔 Real-time SMS detection for bank transactions
- 📱 Native Android SMS integration

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables

   Create a `.env` file with your Supabase credentials:

   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **IMPORTANT: SMS Listener Setup**

   The SMS auto-detection feature requires a **development build** and will NOT work in Expo Go.

   ### To enable SMS listening:

   ```bash
   # Clean and generate native code
   npx expo prebuild --clean

   # Build and run on Android device/emulator
   npx expo run:android
   ```

   ### Why development build is required:
   - `react-native-android-sms-listener` is a native module
   - Expo Go doesn't support custom native modules
   - Development builds include all native dependencies

4. For development without SMS (using Expo Go)

   ```bash
   npx expo start
   ```

   Note: SMS auto-sync will not work, but manual expense entry will.

## SMS Auto-Detection

Once you've built the development build:

1. The app automatically requests RECEIVE_SMS permission on launch
2. When you receive a bank SMS, it's automatically parsed
3. Expenses are added to your account in real-time
4. No manual sync needed!

### Supported SMS formats:

- ICICI Bank transactions
- HDFC Bank transactions
- SBI transactions
- And more (uses regex pattern matching)

## Troubleshooting

### "Nothing showing in console" or "Permission request hangs"

- You're running in Expo Go
- Solution: Build a development build (see step 3 above)

### "SMS listener not working"

- Check Android Settings > Apps > Expensio > Permissions > SMS
- Ensure RECEIVE_SMS permission is granted
- Restart the app after granting permission

### "Module not found" errors

- Run `npm install` again
- Clear cache: `npx expo start -c`

## Project Structure

- `app/` - Screen components (file-based routing)
- `components/` - Reusable UI components
- `services/` - SMS parsing and listening services
- `lib/` - Supabase client configuration
- `types/` - TypeScript type definitions

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/): Learn about development builds for native modules.
