import { COLORS } from '@/constants/theme'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { styles } from '@/styles/feed.styles'
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from 'convex/react'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

type PostProps = {
  post: {
    _id?: Id<'posts'>
    _creationTime: number
    caption?: string | undefined
    userId: Id<'users'>
    imageUrl: string
    storageId: Id<'_storage'>
    likes: number
    comments: number
    author: {
      _id: Id<'users'>
      username: string
      image: string
    }
    isLiked?: boolean
    isBookmarked?: boolean
  }
}

const Post = ({ post }: PostProps) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likesCount, setLikesCount] = useState(post.likes)

  const toggleLike = useMutation(api.posts.toggleLike)

  /**
   * Handles the like action for a post.
   * It toggles the like state, updates the likes count,
   * and calls the toggleLike mutation to update the backend.
   */
  const handleLike = async () => {
    try {
      const newIsLiked = await toggleLike({ postId: post._id! })
      setIsLiked(newIsLiked)
      setLikesCount(newIsLiked ? likesCount + 1 : likesCount - 1)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Link href={`/(tabs)/notifications`}>
          <TouchableOpacity style={styles.postHeaderLeft}>
            <Image
              source={post.author.image}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <Text style={styles.postUsername}>{post.author.username}</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <Image
        source={post.imageUrl}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />

      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={() => handleLike()}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => null}>
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => null}>
          <Ionicons name={'bookmark'} size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {post.likes > 0
            ? `${post.likes.toLocaleString()} likes`
            : 'Be the first to like'}
        </Text>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {post.comments > 0 && (
          <TouchableOpacity onPress={() => null}>
            <Text style={styles.commentsText}>
              View all {post.comments} comments
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>
          {/* {formatDistanceToNow(post._creationTime, { addSuffix: true })} */}
          2 hours ago
        </Text>
      </View>
    </View>
  )
}

export default Post
