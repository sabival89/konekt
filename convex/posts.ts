import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthenticatedUser } from './users'

/**
 * Generates a signed URL for uploading files to Convex storage.
 * This mutation is used to create a new post with an image.
 */
export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error('Unauthenticated')
  return await ctx.storage.generateUploadUrl()
})

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx)

    const imageUrl = await ctx.storage.getUrl(args.storageId)
    if (!imageUrl) throw new Error('Image URL not found')

    const postId = await ctx.db.insert('posts', {
      userId: currentUser._id,
      imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments: 0,
    })

    // increment the user's post count
    await ctx.db.patch(currentUser._id, { posts: currentUser.posts + 1 })
    return postId
  },
})

/**
 * Fetches all posts for the current user.
 */
export const getFeedPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx)

    // get all posts users' posts
    const posts = await ctx.db.query('posts').order('desc').collect()

    if (!posts.length) return []

    const postWithInfo = await Promise.all(
      posts.map(async (post) => {
        const postAuthor = (await ctx.db.get(post.userId))!

        const like = await ctx.db
          .query('likes')
          .withIndex('by_user_and_post', (q) =>
            q.eq('userId', currentUser._id).eq('postId', post._id),
          )
          .first()

        const bookmark = await ctx.db
          .query('bookmarks')
          .withIndex('by_user_and_post', (q) =>
            q.eq('userId', currentUser._id).eq('postId', post._id),
          )
          .first()

        return {
          ...post,
          author: {
            _id: postAuthor?._id,
            username: postAuthor?.username,
            image: postAuthor?.image,
          },
          isLiked: !!like,
          isBookmarked: !!bookmark,
        }
      }),
    )

    return postWithInfo
  },
})

/**
 * Handles the like action for a post.
 * It toggles the like state, updates the likes count,
 */
export const toggleLike = mutation({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx)

    const liked = await ctx.db
      .query('likes')
      .withIndex('by_user_and_post', (q) =>
        q.eq('userId', currentUser._id).eq('postId', args.postId),
      )
      .first()

    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error('Post not found')

    if (liked) {
      // unlike the post
      await ctx.db.delete(liked._id)
      await ctx.db.patch(post._id, { likes: post.likes - 1 })
      return false
    } else {
      // like the post
      await ctx.db.insert('likes', {
        userId: currentUser._id,
        postId: args.postId,
      })
      await ctx.db.patch(post._id, { likes: post.likes + 1 })

      // if not my post, create a notification
      if (post.userId !== currentUser._id) {
        await ctx.db.insert('notifications', {
          receiverId: post.userId,
          postId: args.postId,
          type: 'like',
          senderId: currentUser._id,
        })
      }

      return true
    }
  },
})

export const deletePost = mutation({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx)

    const post = await ctx.db.get(args.postId)
    if (!post) throw new Error('Post not found')

    // verify owner of the post
    if (post.userId !== currentUser._id) {
      throw new Error('You can only delete your own posts')
    }

    // get all likes  associated with the post
    const postLikes = await ctx.db
      .query('likes')
      .withIndex('by_post', (q) => q.eq('postId', args.postId))
      .collect()

    // get all comments associated with the post
    const postComments = await ctx.db
      .query('comments')
      .withIndex('by_post', (q) => q.eq('postId', args.postId))
      .collect()

    const postBookmarks = await ctx.db
      .query('bookmarks')
      .withIndex('by_post', (q) => q.eq('postId', args.postId))
      .collect()

    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_post', (q) => q.eq('postId', args.postId))
      .collect()

    // delete all likes
    postLikes.forEach(async (like) => await ctx.db.delete(like._id))

    // delete all comments
    postComments.forEach(async (comment) => await ctx.db.delete(comment._id))

    // delete all bookmarks
    postBookmarks.forEach(async (bookmark) => await ctx.db.delete(bookmark._id))

    // delete all notifications related to the post
    notifications.forEach(async (notification) => {
      await ctx.db.delete(notification._id)
    })

    // delete the image from storage
    if (post.storageId) await ctx.storage.delete(post.storageId)

    // delete the post
    await ctx.db.delete(post._id)

    // decrement the user's post count
    await ctx.db.patch(currentUser._id, {
      posts: Math.max(0, (currentUser.posts || 1) - 1),
    })

    return true
  },
})
