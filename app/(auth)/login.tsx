import { COLORS } from '@/constants/theme'
import { styles } from '@/styles/auth.styles'
import { useSSO } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

const Login = () => {
  const { startSSOFlow } = useSSO()

  return (
    <View style={styles.container}>
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="keypad-outline" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>konekt</Text>
        <Text style={styles.tagline}>Connect with your friends</Text>
      </View>

      <View style={styles.illustrationContainer}>
        <Image
          source={require('@/assets/images/auth-bg-2.png')}
          style={styles.illustration}
          resizeMode="cover"
        />
      </View>

      <View style={styles.loginSection}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={async () => {
            try {
              const { createdSessionId, setActive } = await startSSOFlow({
                strategy: 'oauth_google',
              })

              if (setActive && createdSessionId) {
                setActive({ session: createdSessionId })
                router.replace('/(tabs)')
              }
            } catch (error) {
              console.error('SSO Flow Error:', error)
              // Handle error appropriately, e.g., show a toast or alert
              alert('Failed to log in with Google. Please try again.')
            }
          }}
        >
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={20} color={COLORS.surface} />
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={{ color: COLORS.primary }}>Terms of Service</Text> and
          our <Text style={{ color: COLORS.primary }}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  )
}

export default Login
