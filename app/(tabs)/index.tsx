import { COLORS } from '@/constants/theme'
import { useAuth } from '@clerk/clerk-expo'
import { Text, TouchableOpacity, View } from 'react-native'
import { styles } from '../../styles/auth.styles'

export default function Index() {
  const { signOut } = useAuth()
  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Text
          style={{ backgroundColor: COLORS.primary }}
          onPress={() => signOut()}
        >
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  )
}
