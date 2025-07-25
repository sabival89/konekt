import Loader from '@/components/Loader'
import { COLORS } from '@/constants/theme'
import { api } from '@/convex/_generated/api'
import { styles } from '@/styles/notifications.styles'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from 'convex/react'
import { formatDistanceToNow } from 'date-fns'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import React from 'react'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'

export default function Notifications() {
  const notifications = useQuery(api.notifications.getNotifications)

  if (notifications === undefined) return <Loader />
  if (notifications.length === 0) return <NoNotificationsFound />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem notification={item} />}
        keyExtractor={(item) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
    </View>
  )
}

const NoNotificationsFound = () => {
  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons name="notifications-outline" size={48} color={COLORS.primary} />
      <Text style={{ color: COLORS.primary, fontSize: 22 }}>
        No notifications yet
      </Text>
    </View>
  )
}

const NotificationItem = ({ notification }: {}) => {
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
