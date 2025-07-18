import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Text, View } from 'react-native'

const CreateScreen = () => {
  const router = useRouter()
  const { user } = useUser()

  const [caption, setCaption] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)

  return (
    <View>
      <Text>Create</Text>
    </View>
  )
}

export default CreateScreen
