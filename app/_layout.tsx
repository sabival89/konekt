import InitialLayout from '@/components/InitialLayout'
import ClerkAndConvexProvider from '@/providers/ClerkAndConvexProvider'
import { useFonts } from 'expo-font'
import * as NavigationBar from 'expo-navigation-bar'
import { SplashScreen } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useCallback, useEffect } from 'react'
import { Platform } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'JetBrainsMono-Medium': require('@/assets/fonts/JetBrainsMono-Medium.ttf'),
  })

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  // Set navigation bar color for Android
  // This is necessary to ensure the navigation bar matches the app's theme
  // and is visible when the app is running on Android devices.
  // Note: This is only applicable for Android devices.
  // For iOS, the navigation bar color is managed by the system.
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#000000')
      NavigationBar.setButtonStyleAsync('light')
    }
  }, [])

  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: 'black' }}
          onLayout={onLayoutRootView}
        >
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
      <StatusBar style="light" />
      {/* Ensure the status bar is styled correctly mostly for an Android devices */}
      <StatusBar style="light" />
    </ClerkAndConvexProvider>
  )
}
