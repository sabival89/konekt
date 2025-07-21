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

export const getFeedPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx)

    // get all posts users' posts
    const posts = await ctx.db
      .query('posts')
      // .withIndex('by_user', (q) => q.eq('userId', currentUser._id))
      .order('desc')
      .collect()

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
