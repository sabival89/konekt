import { ConvexError, v } from 'convex/values'
import { mutation } from './_generated/server'
import { getAuthenticatedUser } from './users'

export const addComment = mutation({
  args: { content: v.string(), postId: v.id('posts') },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx)

    const post = await ctx.db.get(args.postId)
    if (!post) throw new ConvexError('Post not found')

    const { content, postId } = args
    const userId = currentUser._id

    const commentId = await ctx.db.insert('comments', {
      content,
      postId,
      userId,
    })

    // Increment the comment count on the post
    await ctx.db.patch(postId, { comments: post.comments + 1 })

    if (userId !== post.userId) {
      // Create a notification for the post author if the commenter is not the author
      await ctx.db.insert('notifications', {
        receiverId: post.userId,
        senderId: userId,
        type: 'comment',
        postId,
        commentId,
      })
    }

    return commentId
  },
})

export const getComments = mutation({
  args: { postId: v.id('posts') },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query('comments')
      .withIndex('by_post', (q) => q.eq('postId', args.postId))
      .collect()

    const commentsWithInfo = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId)

        return {
          ...comment,
          user: {
            fullname: user!.fullname || '',
            image: user!.image,
          },
        }
      }),
    )
    return commentsWithInfo
  },
})
