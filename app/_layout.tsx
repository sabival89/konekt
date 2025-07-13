import { Stack } from 'expo-router'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="notifications"
            // options={{ title: 'Notification' }}
          />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="index" options={{ title: 'Home' }} />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}
