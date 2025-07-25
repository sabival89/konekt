import { COLORS } from '@/constants/theme'
import { Id } from '@/convex/_generated/dataModel'
import { styles } from '@/styles/notifications.styles'
import { Ionicons } from '@expo/vector-icons'
import { formatDistanceToNow } from 'date-fns'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'

type NotificationProps = {
  notification: {
    type: 'like' | 'comment' | 'follow'
    _creationTime: number
    post: {
      _id: Id<'posts'>
      _creationTime: number
      caption?: string | undefined
      comments: number
      userId: Id<'users'>
      imageUrl: string
      storageId: Id<'_storage'>
      likes: number
    } | null
    sender: {
      _id: Id<'users'>
      username: string | undefined
      image: string | undefined
    }
    comment: {
      content: string | undefined
    }
  }
}

const Notification = ({ notification }: NotificationProps) => {
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Link href={`/notifications`} asChild>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={notification.sender.image}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
            <View style={styles.iconBadge}>
              {notification.type === 'like' ? (
                <Ionicons name="heart" size={14} color={COLORS.primary} />
              ) : notification.type === 'follow' ? (
                <Ionicons name="person-add" size={14} color={COLORS.primary} />
              ) : (
                <Ionicons name="chatbubble" size={14} color={COLORS.primary} />
              )}
            </View>
          </TouchableOpacity>
        </Link>

        <View style={styles.notificationInfo}>
          <Link href={`/notifications`} asChild>
            <TouchableOpacity>
              <Text style={styles.username}>
                {notification.sender.username}
              </Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.action}>
            {notification.type === 'like'
              ? 'liked your post'
              : notification.type === 'follow'
                ? 'started following you'
                : `commented: ${notification.comment.content}`}
          </Text>
          <Text style={styles.timeAgo}>
            {formatDistanceToNow(new Date(notification._creationTime), {
              addSuffix: true,
            })}
          </Text>
        </View>
      </View>

      {notification.post && (
        <Link href={`/notifications`} asChild>
          <TouchableOpacity>
            <Image
              source={notification.post.imageUrl}
              style={styles.postImage}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
        </Link>
      )}
    </View>
  )
}
export default Notification
