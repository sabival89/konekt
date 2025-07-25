import Loader from '@/components/Loader'
import { COLORS } from '@/constants/theme'
import { api } from '@/convex/_generated/api'
import { styles } from '@/styles/feed.styles'
import { useQuery } from 'convex/react'
import { Image } from 'expo-image'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'

const Bookmarks = () => {
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts)

  // Show loader when state is undefined
  if (bookmarkedPosts === undefined) return <Loader />
  // Show empty state when there are no bookmarked posts
  if (bookmarkedPosts.length === 0) return <NoBookMarksFound />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {bookmarkedPosts.map((post) => (
          <View key={post?._id} style={{ width: '33.33%', padding: 1 }}>
            <Image
              source={{ uri: post?.imageUrl }}
              style={{ width: '100%', aspectRatio: 1 }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default Bookmarks

const NoBookMarksFound = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
      }}
    >
      <Text style={{ color: COLORS.primary, fontSize: 22 }}>
        No bookmarked posts yet
      </Text>
    </View>
  )
}
