import { COLORS } from '@/constants/theme'
import { useAuth } from '@clerk/clerk-expo'
import { Slot, Stack, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator } from 'react-native'

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    const isAuthRoute = segments[0] === '(auth)'

    if (!isSignedIn && !isAuthRoute) router.replace('/(auth)/login')
    else if (isSignedIn && isAuthRoute) router.replace('/(tabs)')
  }, [isLoaded, isSignedIn, segments])

  if (!isLoaded)
    return <ActivityIndicator size="large" color={COLORS.secondary} />

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Slot />
    </Stack>
  )
}

export default InitialLayout
