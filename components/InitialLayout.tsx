import { useAuth } from '@clerk/clerk-expo'
import { Slot, Stack, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'

const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    const isAuthRoute = segments[0] === '(auth)'

    if (!isSignedIn && !isAuthRoute) router.replace('/(auth)/login')
    else if (isSignedIn && isAuthRoute) router.replace('/(tabs)')
  }, [isLoaded, isSignedIn, segments, router])

  if (!isLoaded) return null

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Slot />
    </Stack>
  )
}

export default InitialLayout
